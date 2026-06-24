import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayLogs, monthLogs, totalLogs, subscription, balance, activeKeys] = await Promise.all([
      this.prisma.usageLog.aggregate({ where: { userId, timestamp: { gte: today } }, _sum: { totalTokens: true }, _count: true }),
      this.prisma.usageLog.aggregate({ where: { userId, timestamp: { gte: monthStart } }, _sum: { totalTokens: true }, _count: true }),
      this.prisma.usageLog.aggregate({ where: { userId }, _sum: { totalTokens: true }, _count: true }),
      this.prisma.subscription.findUnique({ where: { userId }, include: { plan: true } }),
      this.prisma.topUpLedger.aggregate({ where: { userId }, _sum: { amount: true } }),
      this.prisma.apiKey.count({ where: { userId, status: 'ACTIVE' } }),
    ]);

    const tokensUsed = todayLogs._sum.totalTokens || 0;
    const tokensLimit = subscription?.plan?.dailyQuota || 0;

    return {
      tokensUsed,
      tokensLimit,
      activeKeys,
      plan: subscription?.plan || null,
      topUpBalance: balance._sum.amount || 0,
      today: { tokens: tokensUsed, requests: todayLogs._count },
      thisMonth: { tokens: monthLogs._sum.totalTokens || 0, requests: monthLogs._count, limit: subscription?.plan?.monthlyQuota || 0 },
      total: { tokens: totalLogs._sum.totalTokens || 0, requests: totalLogs._count },
    };
  }

  async getLogs(userId: string, page: number, limit: number) {
    const safePage = Math.max(page || 1, 1);
    const safeLimit = Math.min(Math.max(limit || 20, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const [logs, total] = await Promise.all([
      this.prisma.usageLog.findMany({ where: { userId }, orderBy: { timestamp: 'desc' }, skip, take: safeLimit }),
      this.prisma.usageLog.count({ where: { userId } }),
    ]);
    return { logs, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async getAvailableModels(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId }, include: { plan: true } });
    if (!sub?.plan) return [];
    const allowedModels = this.parseList(sub.plan.allowedModels);
    return this.prisma.model.findMany({ where: { enabled: true, publicModelId: { in: allowedModels } } });
  }

  async checkQuota(userId: string, tokens: number) {
    if (!userId) throw new BadRequestException('userId is required');
    const safeTokens = Math.max(Number(tokens || 1), 1);
    const sub = await this.prisma.subscription.findUnique({ where: { userId }, include: { plan: true } });
    if (!sub || sub.status !== 'ACTIVE') return { allowed: false, remaining: 0, reason: 'subscription_inactive' };

    const todayUsed = await this.todayUsed(userId);
    const monthUsed = await this.monthUsed(userId);
    if (todayUsed + safeTokens <= sub.plan.dailyQuota && monthUsed + safeTokens <= sub.plan.monthlyQuota) {
      return { allowed: true, remaining: sub.plan.dailyQuota - todayUsed, source: 'plan_daily' };
    }

    const topUpBalance = await this.getTopUpBalance(userId);
    if (topUpBalance >= safeTokens) return { allowed: true, remaining: topUpBalance, source: 'topup_balance' };
    return { allowed: false, remaining: Math.max(topUpBalance, 0), reason: 'quota_exceeded' };
  }

  async deductQuota(userId: string, tokens: number) {
    if (!userId) throw new BadRequestException('userId is required');
    const safeTokens = Math.max(Number(tokens || 0), 0);
    if (safeTokens === 0) return { success: true, remaining: await this.getTopUpBalance(userId), source: 'none' };

    return this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({ where: { userId }, include: { plan: true } });
      if (!sub || sub.status !== 'ACTIVE') return { success: false, remaining: 0, source: 'subscription_inactive' };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const [todayAgg, monthAgg] = await Promise.all([
        tx.usageLog.aggregate({ where: { userId, timestamp: { gte: today } }, _sum: { totalTokens: true } }),
        tx.usageLog.aggregate({ where: { userId, timestamp: { gte: monthStart } }, _sum: { totalTokens: true } }),
      ]);
      const todayUsed = todayAgg._sum.totalTokens || 0;
      const monthUsed = monthAgg._sum.totalTokens || 0;

      if (todayUsed + safeTokens <= sub.plan.dailyQuota && monthUsed + safeTokens <= sub.plan.monthlyQuota) {
        await tx.subscription.update({ where: { userId }, data: { dailyUsed: { increment: safeTokens }, monthlyUsed: { increment: safeTokens } } });
        return { success: true, remaining: sub.plan.dailyQuota - todayUsed - safeTokens, source: 'plan_daily' };
      }

      const bal = await tx.topUpLedger.aggregate({ where: { userId }, _sum: { amount: true } });
      const available = bal._sum.amount || 0;
      if (available < safeTokens) return { success: false, remaining: available, source: 'quota_exceeded' };
      await tx.topUpLedger.create({ data: { userId, amount: -safeTokens, balanceAfter: available - safeTokens, source: 'usage_deduction', description: `API usage: ${safeTokens} tokens` } });
      return { success: true, remaining: available - safeTokens, source: 'topup_balance' };
    });
  }

  async writeUsageLog(data: any) {
    await this.prisma.usageLog.create({
      data: {
        userId: data.userId,
        apiKeyId: data.apiKeyId,
        requestId: data.requestId,
        model: data.model,
        compatibilityMode: data.compatibilityMode || 'OPENAI',
        inputTokens: Number(data.inputTokens || 0),
        outputTokens: Number(data.outputTokens || 0),
        totalTokens: Number(data.totalTokens || 0),
        deductionSource: data.deductionSource || 'unknown',
        cost: Number(data.cost || 0),
        status: data.status || 'SUCCESS',
        errorCode: data.errorCode || null,
        latency: Number(data.latency || 0),
      },
    });
    return { ok: true };
  }

  async writeRequestLog(data: any) {
    await this.prisma.requestLog.create({
      data: {
        requestId: data.requestId,
        userId: data.userId || null,
        apiKeyId: data.apiKeyId || null,
        model: data.model || null,
        compatibilityMode: data.compatibilityMode || null,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: Number(data.statusCode || 0),
        inputTokens: Number(data.inputTokens || 0),
        outputTokens: Number(data.outputTokens || 0),
        totalTokens: Number(data.totalTokens || 0),
        latency: Number(data.latency || 0),
        errorCode: data.errorCode || null,
        errorMessage: data.errorMessage || null,
      },
    });
    return { ok: true };
  }

  private async todayUsed(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const agg = await this.prisma.usageLog.aggregate({ where: { userId, timestamp: { gte: today } }, _sum: { totalTokens: true } });
    return agg._sum.totalTokens || 0;
  }

  private async monthUsed(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const agg = await this.prisma.usageLog.aggregate({ where: { userId, timestamp: { gte: monthStart } }, _sum: { totalTokens: true } });
    return agg._sum.totalTokens || 0;
  }

  private async getTopUpBalance(userId: string) {
    const bal = await this.prisma.topUpLedger.aggregate({ where: { userId }, _sum: { amount: true } });
    return bal._sum.amount || 0;
  }

  private parseList(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value !== 'string') return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }
}
