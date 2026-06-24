import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../common/prisma.service';

@Controller('public')
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Get('models')
  @Public()
  async models() {
    return this.prisma.model.findMany({
      where: { enabled: true },
      orderBy: { displayName: 'asc' },
      select: {
        id: true,
        publicModelId: true,
        displayName: true,
        description: true,
        compatibilityModes: true,
        contextLength: true,
        maxOutputTokens: true,
        category: true,
        costPerToken: true,
        enabled: true,
      },
    });
  }

  @Get('pricing')
  @Public()
  async pricing() {
    const plans = await this.prisma.plan.findMany({
      where: { enabled: true },
      orderBy: { price: 'asc' },
      select: { id: true, slug: true, displayName: true, price: true, billingCycle: true, dailyQuota: true, monthlyQuota: true },
    });

    const packages = await this.prisma.topUpPackage.findMany({
      where: { enabled: true },
      orderBy: { price: 'asc' },
    });

    const models = await this.prisma.model.findMany({
      where: { enabled: true },
      select: { publicModelId: true, displayName: true, costPerToken: true },
    });

    return { plans, packages, models };
  }
}
