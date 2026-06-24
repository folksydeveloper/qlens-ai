import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async listActive() {
    return this.prisma.plan.findMany({
      where: { enabled: true },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        slug: true,
        displayName: true,
        price: true,
        billingCycle: true,
        dailyQuota: true,
        monthlyQuota: true,
        rpmLimit: true,
        tpmLimit: true,
        maxActiveKeys: true,
        allowedModels: true,
        priority: true,
        enabled: true,
      },
    });
  }
}
