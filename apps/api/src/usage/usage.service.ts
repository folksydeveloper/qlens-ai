import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayLogs, monthLogs, totalLogs] = await Promise.all([
      this.prisma.usageLog.aggregate({ where: { userId, timestamp: { gte: today } }, _sum: { totalTokens: true }, _count: true }),
      this.prisma.usageLog.aggregate({ where: { userId, timestamp: { gte: monthStart } }, _sum: { totalTokens: true }, _count: true }),
      this.prisma.usageLog.aggregate({ where: { userId }, _sum: { totalTokens: true }, _count: true }),
    ]);

    return {
      today: { tokens: todayLogs._sum.totalTokens || 0, requests: todayLogs._count },
      thisMonth: { tokens: monthLogs._sum.totalTokens || 0, requests: monthLogs._count },
      total: { tokens: totalLogs._sum.totalTokens || 0, requests: totalLogs._count },
    };
  }

  async getLogs(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.usageLog.findMany({ where: { userId }, orderBy: { timestamp: 'desc' }, skip, take: limit }),
      this.prisma.usageLog.count({ where: { userId } }),
    ]);
    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAvailableModels(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId }, include: { plan: true } });
    if (!sub || !sub.plan) return [];
    const allowedModels = sub.plan.allowedModels.split(',').filter(Boolean);
    return this.prisma.model.findMany({ where: { enabled: true, publicModelId: { in: allowedModels } } });
  }
}
