import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AbuseService {
  constructor(private prisma: PrismaService) {}

  async calculateRiskScore(email: string): Promise<number> {
    let score = 0;
    const domain = email.split('@')[1];
    const disposableDomains = ['tempmail.com','throwaway.email','guerrillamail.com','mailinator.com'];
    if (disposableDomains.includes(domain)) score += 30;
    const recentCount = await this.prisma.user.count({ where: { email: { contains: domain }, createdAt: { gte: new Date(Date.now() - 86400000) } } });
    if (recentCount > 5) score += 20;
    if (recentCount > 10) score += 30;
    return Math.min(score, 100);
  }

  async listAlerts() {
    return this.prisma.abuseAlert.findMany({ where: { resolved: false }, orderBy: { createdAt: 'desc' } });
  }

  async resolveAlert(id: string, resolvedBy: string) {
    await this.prisma.abuseAlert.update({ where: { id }, data: { resolved: true, resolvedBy, resolvedAt: new Date() } });
    return { message: 'Alert resolved' };
  }
}
