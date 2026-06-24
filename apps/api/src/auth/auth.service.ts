import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash },
    });

    // Create free trial subscription
    const freePlan = await this.prisma.plan.findFirst({ where: { slug: 'free' } });
    if (!freePlan) throw new BadRequestException('Free plan not configured');

    await this.prisma.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: 'ACTIVE',
      },
    });

    // Generate verification token
    const verifyToken = this.jwtService.sign(
      { sub: user.id, type: 'email_verify' },
      { expiresIn: '24h' },
    );

    return {
      message: 'Registration successful. Please verify your email.',
      verifyToken, // In production, send via email
      user: { id: user.id, email: user.email },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'qlens-refresh-secret-dev',
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token) as any;
      if (decoded.type !== 'email_verify') {
        throw new BadRequestException('Invalid token type');
      }
      await this.prisma.user.update({
        where: { id: decoded.sub },
        data: { emailVerified: true },
      });
      return { message: 'Email verified successfully' };
    } catch (e) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'qlens-refresh-secret-dev',
      }) as any;

      const session = await this.prisma.session.findUnique({
        where: { refreshToken },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });

      if (!user) throw new UnauthorizedException('User not found');

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: '15m' },
      );

      return { accessToken: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.session.deleteMany({
      where: { userId, refreshToken },
    });
    return { message: 'Logged out successfully' };
  }
}
