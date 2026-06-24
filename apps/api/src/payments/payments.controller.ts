import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('invoices')
  async getInvoices(@Req() req: any) { return this.paymentsService.getInvoices(req.user.id); }

  @Public()
  @Post('webhook/midtrans')
  async handleWebhook(@Body() payload: any) { return this.paymentsService.handleWebhook(payload); }
}
