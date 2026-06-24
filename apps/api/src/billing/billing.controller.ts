import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('plans')
  async listPlans() { return this.billingService.listPlans(); }

  @Get('subscription')
  async getSubscription(@Req() req: any) { return this.billingService.getSubscription(req.user.id); }

  @Get('top-up-packages')
  async listTopUpPackages() { return this.billingService.listTopUpPackages(); }

  @Post('top-up')
  async createTopUp(@Req() req: any, @Body() dto: any) { return this.billingService.createTopUp(req.user.id, dto); }

  @Get('invoices')
  async getInvoices(@Req() req: any) { return this.billingService.getInvoices(req.user.id); }
}
