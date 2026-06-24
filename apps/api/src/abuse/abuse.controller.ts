import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AbuseService } from './abuse.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('abuse')
@UseGuards(AdminGuard)
export class AbuseController {
  constructor(private abuseService: AbuseService) {}

  @Get('alerts')
  async listAlerts() { return this.abuseService.listAlerts(); }

  @Patch('alerts/:id/resolve')
  async resolveAlert(@Param('id') id: string, @Body() dto: any) {
    return this.abuseService.resolveAlert(id, dto.resolvedBy || 'admin');
  }
}
