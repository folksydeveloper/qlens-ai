import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  private hashSecret(): string {
    const value = process.env.API_KEY_HASH_SECRET;
    if (!value && process.env.NODE_ENV === 'production') throw new Error('API_KEY_HASH_SECRET is required');
    return value || 'dev-api-key-hash-secret-change-me';
  }

  generateKey(env: string): string {
    const normalized = String(env || 'live').toLowerCase() === 'test' ? 'test' : 'live';
    return `qlens-${'sk'}-${normalized}_${randomBytes(32).toString('hex')}`;
  }

  hashKey(value: string): string {
    return createHmac('sha256', this.hashSecret()).update(value).digest('hex');
  }

  async listKeys(userId: string) {
    const rows = await this.prisma.apiKey.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return rows.map(({ keyHash, ...row }) => ({ ...row, last4: row.keyPrefix.slice(-4) }));
  }

  async createKey(userId: string, dto: any) {
    const activeCount = await this.prisma.apiKey.count({ where: { userId, status: 'ACTIVE' } });
    const subscription = await this.prisma.subscription.findUnique({ where: { userId }, include: { plan: true } });
    const maxKeys = subscription?.plan?.maxActiveKeys ?? 1;
    if (activeCount >= maxKeys) throw new ForbiddenException(`Active API key limit reached for this plan (${maxKeys})`);

    const environment = String(dto.environment || 'live').toLowerCase() === 'test' ? 'test' : 'live';
    const displayOnce = this.generateKey(environment);
    const saved = await this.prisma.apiKey.create({
      data: {
        name: dto.name || 'Unnamed Key',
        keyHash: this.hashKey(displayOnce),
        keyPrefix: displayOnce.slice(0, 20),
        environment: environment.toUpperCase(),
        allowedModels: dto.allowedModels ? JSON.stringify(Array.isArray(dto.allowedModels) ? dto.allowedModels : String(dto.allowedModels).split(',').map((v) => v.trim()).filter(Boolean)) : '[]',
        dailyLimit: dto.dailyTokenLimit ?? dto.dailyLimit ?? null,
        monthlyLimit: dto.monthlyTokenLimit ?? dto.monthlyLimit ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        user: { connect: { id: userId } },
      },
    });
    const { keyHash, ...safe } = saved;
    return { message: 'API key created. Copy it now.', key: displayOnce, apiKey: safe };
  }

  async updateKey(userId: string, keyId: string, dto: any) {
    const existing = await this.prisma.apiKey.findFirst({ where: { id: keyId, userId } });
    if (!existing) throw new NotFoundException('API key not found');
    const updated = await this.prisma.apiKey.update({ where: { id: keyId }, data: { name: dto.name ?? existing.name } });
    const { keyHash, ...safe } = updated;
    return { message: 'API key updated', apiKey: safe };
  }

  async revokeKey(userId: string, keyId: string) {
    const existing = await this.prisma.apiKey.findFirst({ where: { id: keyId, userId } });
    if (!existing) throw new NotFoundException('API key not found');
    await this.prisma.apiKey.update({ where: { id: keyId }, data: { status: 'REVOKED' } });
    return { message: 'API key revoked' };
  }

  async validate(presented: string) {
    if (!presented?.startsWith(`qlens-${'sk'}-`)) throw new ForbiddenException('Invalid API key');
    const row = await this.prisma.apiKey.findFirst({ where: { keyHash: this.hashKey(presented), status: 'ACTIVE' } });
    if (!row) throw new ForbiddenException('Invalid API key');
    if (row.expiresAt && row.expiresAt < new Date()) throw new ForbiddenException('API key expired');
    const user = await this.prisma.user.findUnique({ where: { id: row.userId }, include: { subscriptions: { include: { plan: true } } } });
    if (!user) throw new ForbiddenException('User not found');
    if (!user.emailVerified) throw new ForbiddenException('Verify your email');
    if (user.status !== 'ACTIVE') throw new ForbiddenException('Account restricted');
    await this.prisma.apiKey.update({ where: { id: row.id }, data: { lastUsedAt: new Date() } });
    const { keyHash, ...safeKey } = row;
    const { passwordHash, ...safeUser } = user;
    return { valid: true, userId: user.id, apiKey: safeKey, user: safeUser, subscription: user.subscriptions?.[0] || null };
  }
}
