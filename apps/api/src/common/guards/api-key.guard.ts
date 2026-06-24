import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { createHash } from 'crypto';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('API key required');
    }

    const apiKey = authHeader.substring(7);

    if (!apiKey.startsWith('qlens-sk-')) {
      throw new UnauthorizedException('Invalid API key format');
    }

    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const keyPrefix = apiKey.substring(0, 10);

    const key = await this.prisma.apiKey.findFirst({
      where: {
        keyHash,
        keyPrefix,
        status: 'ACTIVE',
      },
      include: {
        user: {
          include: {
            subscriptions: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    // Update lastUsedAt
    await this.prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });

    request.apiKey = key;
    request.user = key.user;

    return true;
  }
}
