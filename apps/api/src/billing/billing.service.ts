import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
    if (!pkg || !pkg.enabled) throw new NotFoundException('Package not found');

    const orderId = `qlens_topup_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const payment = await this.prisma.payment.create({
      data: {
        amount: pkg.price,
        packageId: pkg.id,
        tokenAmount: pkg.tokens,
        provider: 'midtrans',
        status: 'PENDING',
        providerTxId: orderId,
        user: { connect: { id: userId } },
      },
    });

    // Sandbox/dev URL only. Production must replace this with a server-side Midtrans Snap API call.
    const invoiceUrl = process.env.MIDTRANS_SNAP_BASE_URL
      ? `${process.env.MIDTRANS_SNAP_BASE_URL}/${orderId}`
      : `https://app.sandbox.midtrans.com/snap/v2/vtweb/${orderId}`;

    await this.prisma.payment.update({ where: { id: payment.id }, data: { invoiceUrl } });
    return { message: 'Top-up initiated', payment: { ...payment, invoiceUrl }, invoiceUrl, orderId };
  }

  async getInvoices(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}
