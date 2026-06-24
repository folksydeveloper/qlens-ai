import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AbuseService } from './abuse.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin/abuse')
@UseGuards(AdminGuard)
export class AbuseController {
  constructor(private abuseService: AbuseService) {}

  @Get('alerts')
  async listAlerts() { return this.abuseService.listAlerts(); }

  @Get('signals')
  async detectSignals() { return this.abuseService.detectAbuseSignals(); }

  @Post('alerts')
  async createAlert(@Body() dto: any) {
    return this.abuseService.createAlert(dto.type, dto.severity, dto.details, dto.userId);
  }

  @Patch('alerts/:id/resolve')
  async resolveAlert(@Param('id') id: string, @Body() dto: any) {
    return this.abuseService.resolveAlert(id, dto.resolvedBy);
  }

  @Post('users/:id/check-risk')
  async checkUserRisk(@Param('id') id: string) {
    const score = await this.abuseService.calculateRiskScore(id);
    const throttled = await this.abuseService.autoThrottle(id);
    return { userId: id, riskScore: score, autoThrottled: throttled };
  }
}
