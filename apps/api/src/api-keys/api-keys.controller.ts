import { Controller, Get, Post, Patch, Delete, Body, Req, Param, UseGuards } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Get()
  async listKeys(@Req() req: any) {
    return this.apiKeysService.listKeys(req.user.id);
  }

  @Post()
  async createKey(@Req() req: any, @Body() dto: any) {
    return this.apiKeysService.createKey(req.user.id, dto);
  }

  @Patch(':id')
  async updateKey(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.apiKeysService.updateKey(req.user.id, id, dto);
  }

  @Delete(':id')
  async revokeKey(@Req() req: any, @Param('id') id: string) {
    return this.apiKeysService.revokeKey(req.user.id, id);
  }
}
