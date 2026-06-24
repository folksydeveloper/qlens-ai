import { Injectable, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getInvoices(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async handleWebhook(payload: any) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder';
    const { order_id, status_code, gross_amount, transaction_status, signature_key, transaction_id } = payload;
    const expected = createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex');
    if (signature_key !== expected) throw new BadRequestException('Invalid signature');

    const payment = await this.prisma.payment.findUnique({ where: { providerTxId: transaction_id } });
    if (!payment) return { status: 'ok' };

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({ where: { id: payment.id }, data: { status: 'PAID', paidAt: new Date() } });
        const bal = await tx.topUpLedger.aggregate({ where: { userId: payment.userId }, _sum: { amount: true } });
        const prev = (bal._sum?.amount) || 0;
        await tx.topUpLedger.create({ data: { userId: payment.userId, amount: payment.tokenAmount, balanceAfter: prev + payment.tokenAmount, source: 'purchase', referenceId: payment.id, description: `Top-up: ${payment.packageId}` } });
      });
    }
    return { status: 'ok' };
  }
}
