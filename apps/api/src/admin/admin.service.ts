import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const [totalUsers, paidUsers, freeUsers, totalRevenue, totalRequests, totalTokens] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { subscriptions: { some: { plan: { slug: { not: 'free' } } } } } }),
      this.prisma.user.count({ where: { subscriptions: { some: { plan: { slug: 'free' } } } } }),
      this.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      this.prisma.requestLog.count(),
      this.prisma.usageLog.aggregate({ _sum: { totalTokens: true } }),
    ]);
    return { totalUsers, paidUsers, freeUsers, totalRevenue: totalRevenue._sum.amount || 0, totalRequests, totalTokens: totalTokens._sum.totalTokens || 0 };
  }

  async listUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, role: true, status: true, riskScore: true, createdAt: true } }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { subscriptions: { include: { plan: true } }, apiKeys: true } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safeUser } = user as any;
    return safeUser;
  }

  async changePlan(userId: string, planId: string) {
    await this.prisma.subscription.update({ where: { userId }, data: { planId } });
    await this.audit('SYSTEM_ADMIN', userId, 'CHANGE_PLAN', 'subscription', userId, { planId });
    return { message: 'Plan changed' };
  }

  async changeStatus(userId: string, status: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { status } });
    await this.audit('SYSTEM_ADMIN', userId, 'CHANGE_STATUS', 'user', userId, { status });
    return { message: `User status changed to ${status}` };
  }

  async addCredit(userId: string, amount: number, description: string) {
    if (!description) throw new BadRequestException('description is required for manual credit');
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) throw new BadRequestException('amount must be positive');
    const bal = await this.prisma.topUpLedger.aggregate({ where: { userId }, _sum: { amount: true } });
    const prev = bal._sum.amount || 0;
    await this.prisma.$transaction(async (tx) => {
      await tx.topUpLedger.create({ data: { userId, amount: Number(amount), balanceAfter: prev + Number(amount), source: 'manual_credit', description } });
      await tx.auditLog.create({ data: { adminId: 'SYSTEM_ADMIN', userId, action: 'MANUAL_CREDIT', entityType: 'top_up_ledger', entityId: userId, details: JSON.stringify({ amount, description }) } });
    });
    return { message: `Added ${amount} tokens` };
  }

  async listPayments(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.payment.count(),
    ]);
    return { payments, total, page, limit };
  }

  async listUsageLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.usageLog.findMany({ skip, take: limit, orderBy: { timestamp: 'desc' } }),
      this.prisma.usageLog.count(),
    ]);
    return { logs, total, page, limit };
  }

  async listAbuseAlerts() { return this.prisma.abuseAlert.findMany({ where: { resolved: false }, orderBy: { createdAt: 'desc' } }); }
  async listModels() { return this.prisma.model.findMany({ include: { health: true } }); }

  async createModel(dto: any) {
    const model = await this.prisma.model.create({ data: { ...dto, compatibilityModes: Array.isArray(dto.compatibilityModes) ? JSON.stringify(dto.compatibilityModes) : dto.compatibilityModes } });
    await this.prisma.modelHealth.create({ data: { modelId: model.id } });
    return { message: 'Model created', model };
  }

  async updateModel(id: string, dto: any) {
    if (dto.compatibilityModes && Array.isArray(dto.compatibilityModes)) dto.compatibilityModes = JSON.stringify(dto.compatibilityModes);
    const model = await this.prisma.model.update({ where: { id }, data: dto });
    return { message: 'Model updated', model };
  }

  async listPlans() { return this.prisma.plan.findMany({ orderBy: { price: 'asc' } }); }

  async createPlan(dto: any) {
    const plan = await this.prisma.plan.create({ data: { ...dto, allowedModels: Array.isArray(dto.allowedModels) ? JSON.stringify(dto.allowedModels) : dto.allowedModels } });
    return { message: 'Plan created', plan };
  }

  async updatePlan(id: string, dto: any) {
    if (dto.allowedModels && Array.isArray(dto.allowedModels)) dto.allowedModels = JSON.stringify(dto.allowedModels);
    const plan = await this.prisma.plan.update({ where: { id }, data: dto });
    return { message: 'Plan updated', plan };
  }

  async listAuditLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count(),
    ]);
    return { logs, total, page, limit };
  }

  async modelHealth() { return this.prisma.modelHealth.findMany({ include: { model: true } }); }

  private async audit(adminId: string, userId: string, action: string, entityType: string, entityId: string, details: any) {
    await this.prisma.auditLog.create({ data: { adminId, userId, action, entityType, entityId, details: JSON.stringify(details) } });
  }
}
