import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  @Public()
  async list() {
    return this.plansService.listActive();
  }
}
