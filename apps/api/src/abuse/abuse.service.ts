import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AbuseService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────
  // Risk Scoring
  // ─────────────────────────────────────────────
  async calculateRiskScore(userId: string): Promise<number> {
    let score = 0;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return 0;

    // Disposable email check
    const domain = user.email.split('@')[1]?.toLowerCase();
    const disposableDomains = ['tempmail.com','throwaway.email','guerrillamail.com','mailinator.com','sharklasers.com','yopmail.com'];
    if (disposableDomains.includes(domain)) score += 30;

    // Bulk account detection: same domain, many accounts in 24h
    const recentCount = await this.prisma.user.count({
      where: { email: { endsWith: `@${domain}` }, createdAt: { gte: new Date(Date.now() - 86400000) } },
    });
    if (recentCount > 5) score += 20;
    if (recentCount > 10) score += 30;

    // Same IP registration check
    const ip = user.lastLoginIp;
    if (ip) {
      const sameIpCount = await this.prisma.user.count({
        where: { lastLoginIp: ip, createdAt: { gte: new Date(Date.now() - 86400000) } },
      });
      if (sameIpCount > 3) score += 25;
    }

    // API key sharing detection: key used from many IPs
    const keys = await this.prisma.apiKey.findMany({ where: { userId } });
    for (const key of keys) {
      const uniqueIPs = await this.prisma.usageLog.groupBy({
        by: ['ipAddress'],
        where: { apiKeyId: key.id, ipAddress: { not: null } },
      });
      if (uniqueIPs.length > 5) score += 20;
    }

    // Rapid request pattern (rate abuse)
    const recentLogs = await this.prisma.usageLog.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 300000) } }, // 5 min
    });
    if (recentLogs > 100) score += 15;

    return Math.min(score, 100);
  }

  // ─────────────────────────────────────────────
  // Abuse Detection Signals
  // ─────────────────────────────────────────────
  async detectAbuseSignals(): Promise<AbuseSignal[]> {
    const signals: AbuseSignal[] = [];

    // 1. Bulk registration detection — find domains with many recent accounts
    const recentUsers = await this.prisma.user.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
      select: { email: true },
    });
    const domainCounts: Record<string, number> = {};
    for (const u of recentUsers) {
      const d = u.email.split('@')[1];
      if (d) domainCounts[d] = (domainCounts[d] || 0) + 1;
    }
    for (const [domain, cnt] of Object.entries(domainCounts)) {
      if (cnt > 5) {
        signals.push({
          type: 'BULK_REGISTRATION',
          severity: cnt > 10 ? 'HIGH' : 'MEDIUM',
          details: `${cnt} accounts from @${domain} in 24h`,
        });
      }
    }

    // 2. Shared key detection
    const keys = await this.prisma.apiKey.findMany({ where: { isActive: true }, select: { id: true } });
    for (const key of keys) {
      const ipCount = await this.prisma.usageLog.groupBy({
        by: ['ipAddress'],
        where: { apiKeyId: key.id, ipAddress: { not: null }, createdAt: { gte: new Date(Date.now() - 3600000) } },
      });
      if (ipCount.length > 5) {
        signals.push({
          type: 'SHARED_KEY',
          severity: ipCount.length > 10 ? 'HIGH' : 'MEDIUM',
          details: `API key ${key.id.slice(0, 8)} used from ${ipCount.length} IPs in 1h`,
        });
      }
    }

    // 3. Rate abuse detection
    const recentLogs = await this.prisma.usageLog.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 300000) } },
      select: { userId: true },
    });
    const userCounts: Record<string, number> = {};
    for (const log of recentLogs) {
      if (log.userId) userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    }
    for (const [userId, cnt] of Object.entries(userCounts)) {
      if (cnt > 100) {
        signals.push({
          type: 'RATE_ABUSE',
          severity: 'HIGH',
          details: `User ${userId.slice(0, 8)} sent ${cnt} requests in 5 min`,
        });
      }
    }

    // 4. Quota manipulation attempts
    const quotaAttempts = await this.prisma.usageLog.count({
      where: { status: 'QUOTA_EXCEEDED', createdAt: { gte: new Date(Date.now() - 3600000) } },
    });
    if (quotaAttempts > 50) {
      signals.push({
        type: 'QUOTA_BYPASS',
        severity: 'MEDIUM',
        details: `${quotaAttempts} quota-exceeded requests in 1h`,
      });
    }

    return signals;
  }

  // ─────────────────────────────────────────────
  // Alert Management
  // ─────────────────────────────────────────────
  async createAlert(type: string, severity: string, details: string, userId?: string) {
    return this.prisma.abuseAlert.create({
      data: { type, severity, details, userId },
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
    await this.prisma.abuseAlert.update({
      where: { id },
      data: { resolved: true, resolvedBy, resolvedAt: new Date() },
    });
    return { message: 'Alert resolved' };
  }

  // ─────────────────────────────────────────────
  // Auto-actions
  // ─────────────────────────────────────────────
  async autoThrottle(userId: string): Promise<boolean> {
    const score = await this.calculateRiskScore(userId);
    if (score >= 80) {
      await this.prisma.user.update({ where: { id: userId }, data: { riskScore: score, status: 'SUSPENDED' } });
      await this.createAlert('AUTO_SUSPEND', 'HIGH', `User auto-suspended (risk score: ${score})`, userId);
      return true;
    }
    if (score >= 50) {
      await this.prisma.user.update({ where: { id: userId }, data: { riskScore: score } });
      return false;
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
