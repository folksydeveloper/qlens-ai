import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AbuseService {
  constructor(private prisma: PrismaService) {}

  async calculateRiskScore(userId: string): Promise<number> {
    let score = 0;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return 0;

    const domain = user.email.split('@')[1]?.toLowerCase();
    const disposableDomains = ['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com', 'sharklasers.com', 'yopmail.com'];
    if (domain && disposableDomains.includes(domain)) score += 30;

    if (domain) {
      const recentCount = await this.prisma.user.count({
        where: { email: { endsWith: `@${domain}` }, createdAt: { gte: new Date(Date.now() - 86400000) } },
      });
      if (recentCount > 5) score += 20;
      if (recentCount > 10) score += 30;
    }

    const keys = await this.prisma.apiKey.findMany({ where: { userId, status: 'ACTIVE' } });
    for (const key of keys) {
      const uniqueIpHashes = await this.prisma.usageLog.groupBy({
        by: ['ipHash'],
        where: { apiKeyId: key.id, ipHash: { not: null }, timestamp: { gte: new Date(Date.now() - 3600000) } },
      });
      if (uniqueIpHashes.length > 5) score += 20;
      if (uniqueIpHashes.length > 10) score += 30;
    }

    const recentLogs = await this.prisma.usageLog.count({
      where: { userId, timestamp: { gte: new Date(Date.now() - 300000) } },
    });
    if (recentLogs > 100) score += 15;

    return Math.min(score, 100);
  }

  async detectAbuseSignals(): Promise<AbuseSignal[]> {
    const signals: AbuseSignal[] = [];

    const recentUsers = await this.prisma.user.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
      select: { email: true },
    });
    const domainCounts: Record<string, number> = {};
    for (const u of recentUsers) {
      const domain = u.email.split('@')[1];
      if (domain) domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }
    for (const [domain, count] of Object.entries(domainCounts)) {
      if (count > 5) signals.push({ type: 'BULK_REGISTRATION', severity: count > 10 ? 'HIGH' : 'MEDIUM', details: `${count} accounts from @${domain} in 24h` });
    }

    const keys = await this.prisma.apiKey.findMany({ where: { status: 'ACTIVE' }, select: { id: true } });
    for (const key of keys) {
      const ipHashes = await this.prisma.usageLog.groupBy({
        by: ['ipHash'],
        where: { apiKeyId: key.id, ipHash: { not: null }, timestamp: { gte: new Date(Date.now() - 3600000) } },
      });
      if (ipHashes.length > 5) signals.push({ type: 'SHARED_KEY', severity: ipHashes.length > 10 ? 'HIGH' : 'MEDIUM', details: `API key ${key.id.slice(0, 8)} used from ${ipHashes.length} IP hashes in 1h` });
    }

    const recentLogs = await this.prisma.usageLog.findMany({
      where: { timestamp: { gte: new Date(Date.now() - 300000) } },
      select: { userId: true },
    });
    const userCounts: Record<string, number> = {};
    for (const log of recentLogs) userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    for (const [userId, count] of Object.entries(userCounts)) {
      if (count > 100) signals.push({ type: 'RATE_ABUSE', severity: 'HIGH', details: `User ${userId.slice(0, 8)} sent ${count} requests in 5 min` });
    }

    const quotaAttempts = await this.prisma.usageLog.count({
      where: { status: 'QUOTA_EXCEEDED', timestamp: { gte: new Date(Date.now() - 3600000) } },
    });
    if (quotaAttempts > 50) signals.push({ type: 'QUOTA_BYPASS', severity: 'MEDIUM', details: `${quotaAttempts} quota-exceeded requests in 1h` });

    return signals;
  }

  async createAlert(alertType: string, severity: string, details: string, userId?: string) {
    return this.prisma.abuseAlert.create({
      data: { alertType, severity, details, userId: userId || 'system' },
    });
  }

  async listAlerts(resolved?: boolean) {
    return this.prisma.abuseAlert.findMany({
      where: resolved !== undefined ? { resolved } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async resolveAlert(id: string, resolvedBy: string) {
    await this.prisma.abuseAlert.update({ where: { id }, data: { resolved: true, resolvedBy, resolvedAt: new Date() } });
    return { message: 'Alert resolved' };
  }

  async autoThrottle(userId: string): Promise<boolean> {
    const score = await this.calculateRiskScore(userId);
    if (score >= 80) {
      await this.prisma.user.update({ where: { id: userId }, data: { riskScore: score, status: 'SUSPENDED' } });
      await this.createAlert('AUTO_SUSPEND', 'HIGH', `User auto-suspended (risk score: ${score})`, userId);
      return true;
    }
    await this.prisma.user.update({ where: { id: userId }, data: { riskScore: score } });
    return false;
  }
}

interface AbuseSignal {
  type: string;
  severity: string;
  details: string;
}
