import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async listPlans() {
    return this.prisma.plan.findMany({ where: { enabled: true }, orderBy: { price: 'asc' } });
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId }, include: { plan: true } });
  }

  async listTopUpPackages() {
    return this.prisma.topUpPackage.findMany({ where: { enabled: true }, orderBy: { sortOrder: 'asc' } });
  }

  async createTopUp(userId: string, dto: any) {
    const pkg = await this.prisma.topUpPackage.findUnique({ where: { id: dto.packageId } });
    if (!pkg) throw new NotFoundException('Package not found');
    const payment = await this.prisma.payment.create({
      data: {
        amount: pkg.price,
        packageId: pkg.id,
        tokenAmount: pkg.tokens,
        provider: 'midtrans',
        status: 'PENDING',
        providerTxId: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user: { connect: { id: userId } },
      },
    });
    // In production, call Midtrans API to create payment URL
    return { message: 'Top-up initiated', payment, invoiceUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${payment.id}` };
  }

  async getInvoices(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async checkAndDeduct(userId: string, estimatedTokens: number) {
    return this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({ where: { userId }, include: { plan: true } });
      if (sub && sub.status === 'ACTIVE' && sub.dailyUsed < sub.plan.dailyQuota) {
        await tx.subscription.update({ where: { userId }, data: { dailyUsed: { increment: estimatedTokens } } });
        return { source: 'plan_daily', allowed: true };
      }
      const balance = await tx.topUpLedger.aggregate({ where: { userId }, _sum: { amount: true } });
      const available = (balance._sum?.amount) || 0;
      if (available >= estimatedTokens) {
        await tx.topUpLedger.create({ data: { userId, amount: -estimatedTokens, balanceAfter: available - estimatedTokens, source: 'usage_deduction', description: `API usage: ${estimatedTokens} tokens` } });
        return { source: 'topup_balance', allowed: true };
      }
      return { source: null, allowed: false };
    });
  }

  async finalizeDeduction(userId: string, actualTokens: number, estimatedTokens: number, source: string) {
    if (actualTokens === estimatedTokens) return;
    const adjustment = actualTokens - estimatedTokens;
    if (source === 'plan_daily') {
      await this.prisma.subscription.update({ where: { userId }, data: { dailyUsed: { increment: adjustment } } });
    } else if (source === 'topup_balance') {
      const bal = await this.prisma.topUpLedger.aggregate({ where: { userId }, _sum: { amount: true } });
      const current = (bal._sum?.amount) || 0;
      await this.prisma.topUpLedger.create({ data: { userId, amount: -adjustment, balanceAfter: current - adjustment, source: 'usage_deduction', description: `Usage adjustment: ${adjustment} tokens` } });
    }
  }
}
