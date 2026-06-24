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
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey && process.env.NODE_ENV === 'production') throw new BadRequestException('Payment server key is not configured');

    const { order_id, status_code, gross_amount, transaction_status, signature_key, transaction_id, currency } = payload;
    const expected = createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey || 'dev-midtrans-key'}`).digest('hex');
    if (signature_key !== expected) throw new BadRequestException('Invalid signature');

    const payment = await this.prisma.payment.findFirst({
      where: { OR: [{ providerTxId: order_id }, { providerTxId: transaction_id }] },
    });
    if (!payment) return { status: 'ignored', reason: 'payment_not_found' };

    if (currency && String(currency).toUpperCase() !== 'IDR') throw new BadRequestException('Invalid currency');
    if (Number(gross_amount) !== payment.amount / 100) throw new BadRequestException('Invalid amount');

    if (transaction_status !== 'settlement' && transaction_status !== 'capture') {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { webhookPayload: JSON.stringify(payload) } });
      return { status: 'ok', paymentStatus: transaction_status };
    }

    if (payment.status === 'PAID') return { status: 'ok', idempotent: true };
    if (!payment.tokenAmount || payment.tokenAmount <= 0) throw new BadRequestException('Invalid token amount');

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.payment.findUnique({ where: { id: payment.id } });
      if (!current || current.status === 'PAID') return;
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', paidAt: new Date(), providerTxId: transaction_id || order_id, webhookPayload: JSON.stringify(payload) },
      });
      const bal = await tx.topUpLedger.aggregate({ where: { userId: payment.userId }, _sum: { amount: true } });
      const prev = bal._sum.amount || 0;
      await tx.topUpLedger.create({
        data: {
          userId: payment.userId,
          amount: payment.tokenAmount || 0,
          balanceAfter: prev + (payment.tokenAmount || 0),
          source: 'purchase',
          referenceId: payment.id,
          description: `Top-up payment settled`,
        },
      });
    });

    return { status: 'ok' };
  }
}
