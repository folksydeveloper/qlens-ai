import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  generateKey(env: string): string {
    const random = randomBytes(24).toString('hex');
    return `qlens-sk-${env}_${random}`;
  }

  hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  async listKeys(userId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return keys.map(k => ({ ...k, keyHash: undefined, last4: k.keyPrefix.slice(-4) }));
  }

  async createKey(userId: string, dto: any) {
    const rawKey = this.generateKey(dto.environment || 'live');
    const keyHash = this.hashKey(rawKey);
    const keyPrefix = rawKey.slice(0, 20) + '...';
    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: dto.name || 'Unnamed Key',
        keyHash,
        keyPrefix,
        environment: dto.environment || 'live',
        allowedModels: '',
        user: { connect: { id: userId } },
      },
    });
    return { message: 'API key created. Copy it now.', key: rawKey, apiKey: { ...apiKey, keyHash: undefined } };
  }

  async updateKey(userId: string, keyId: string, dto: any) {
    const key = await this.prisma.apiKey.findFirst({ where: { id: keyId, userId } });
    if (!key) throw new NotFoundException('API key not found');
    const updated = await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { name: dto.name ?? key.name },
    });
    return { message: 'API key updated', apiKey: updated };
  }

  async revokeKey(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({ where: { id: keyId, userId } });
    if (!key) throw new NotFoundException('API key not found');
    await this.prisma.apiKey.update({ where: { id: keyId }, data: { status: 'REVOKED' } });
    return { message: 'API key revoked' };
  }

  async validate(rawKey: string) {
    const keyHash = this.hashKey(rawKey);
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash, status: 'ACTIVE' },
    });
    if (!apiKey) throw new ForbiddenException('Invalid API key');

    const user = await this.prisma.user.findUnique({
      where: { id: apiKey.userId },
      include: { subscriptions: { include: { plan: true } } },
    });
    if (!user) throw new ForbiddenException('User not found');
    if (!user.emailVerified) throw new ForbiddenException('Verify your email');
    if (user.status !== 'ACTIVE') throw new ForbiddenException('Account restricted');

    return { ...apiKey, user };
  }
}
