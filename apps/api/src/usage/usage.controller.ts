import { Controller, Get, Post, Body, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

function assertServiceSecret(req: any) {
  const expected = process.env.API_SERVICE_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-service-token');
  const provided = req.headers['x-service-secret'];
  if (!expected || provided !== expected) throw new ForbiddenException('Invalid service secret');
}

@Controller('usage')
@UseGuards(JwtAuthGuard)
export class UsageController {
  constructor(private usageService: UsageService) {}

  @Get('summary')
  async getSummary(@Req() req: any) { return this.usageService.getSummary(req.user.id); }

  @Get('logs')
  async getLogs(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usageService.getLogs(req.user.id, parseInt(page || '1'), parseInt(limit || '20'));
  }

  @Get('models')
  async getModels(@Req() req: any) { return this.usageService.getAvailableModels(req.user.id); }

  @Public()
  @Post('check-quota')
  async checkQuota(@Req() req: any, @Body() dto: any) {
    assertServiceSecret(req);
    return this.usageService.checkQuota(dto.userId, Number(dto.tokens || 1));
  }

  @Public()
  @Post('deduct-quota')
  async deductQuota(@Req() req: any, @Body() dto: any) {
    assertServiceSecret(req);
    return this.usageService.deductQuota(dto.userId, Number(dto.tokens || 0));
  }

  @Public()
  @Post('log-usage')
  async logUsage(@Req() req: any, @Body() dto: any) {
    assertServiceSecret(req);
    return this.usageService.writeUsageLog(dto);
  }

  @Public()
  @Post('log-request')
  async logRequest(@Req() req: any, @Body() dto: any) {
    assertServiceSecret(req);
    return this.usageService.writeRequestLog(dto);
  }
}
