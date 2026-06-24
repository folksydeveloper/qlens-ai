import { Controller, Get, Post, Patch, Body, Req, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('overview')
  async overview() { return this.adminService.overview(); }

  @Get('users')
  async listUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listUsers(parseInt(page || '1'), parseInt(limit || '20'));
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) { return this.adminService.getUser(id); }

  @Patch('users/:id/plan')
  async changePlan(@Param('id') id: string, @Body() dto: any) { return this.adminService.changePlan(id, dto.planId); }

  @Patch('users/:id/status')
  async changeStatus(@Param('id') id: string, @Body() dto: any) { return this.adminService.changeStatus(id, dto.status); }

  @Post('users/:id/credit')
  async addCredit(@Param('id') id: string, @Body() dto: any) { return this.adminService.addCredit(id, dto.amount, dto.description); }

  @Get('payments')
  async listPayments(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listPayments(parseInt(page || '1'), parseInt(limit || '20'));
  }

  @Get('usage-logs')
  async usageLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listUsageLogs(parseInt(page || '1'), parseInt(limit || '20'));
  }

  @Get('abuse-alerts')
  async abuseAlerts() { return this.adminService.listAbuseAlerts(); }

  @Get('models')
  async listModels() { return this.adminService.listModels(); }

  @Post('models')
  async createModel(@Body() dto: any) { return this.adminService.createModel(dto); }

  @Patch('models/:id')
  async updateModel(@Param('id') id: string, @Body() dto: any) { return this.adminService.updateModel(id, dto); }

  @Get('plans')
  async listPlans() { return this.adminService.listPlans(); }

  @Post('plans')
  async createPlan(@Body() dto: any) { return this.adminService.createPlan(dto); }

  @Patch('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() dto: any) { return this.adminService.updatePlan(id, dto); }

  @Get('audit-logs')
  async auditLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listAuditLogs(parseInt(page || '1'), parseInt(limit || '20'));
  }

  @Get('model-health')
  async modelHealth() { return this.adminService.modelHealth(); }
}
