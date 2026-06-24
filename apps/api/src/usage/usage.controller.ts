import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

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
}
