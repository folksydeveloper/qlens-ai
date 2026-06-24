import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { JWT_REFRESH_SECRET } from './jwt.constants';

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
    const user = await this.prisma.user.create({ data: { email, passwordHash } });

    const freePlan = await this.prisma.plan.findFirst({ where: { slug: 'free' } });
    if (!freePlan) throw new BadRequestException('Free plan not configured');

    await this.prisma.subscription.create({ data: { userId: user.id, planId: freePlan.id, status: 'ACTIVE' } });

    const verifyToken = this.jwtService.sign({ sub: user.id, type: 'email_verify' }, { expiresIn: '24h' });
    const response: any = { message: 'Registration successful. Please verify your email.', user: { id: user.id, email: user.email } };
    if (process.env.NODE_ENV !== 'production') response.devVerifyToken = verifyToken;
    return response;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account restricted');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d', secret: JWT_REFRESH_SECRET });

    await this.prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token) as any;
      if (decoded.type !== 'email_verify') throw new BadRequestException('Invalid token type');
      await this.prisma.user.update({ where: { id: decoded.sub }, data: { emailVerified: true } });
      return { message: 'Email verified successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, { secret: JWT_REFRESH_SECRET }) as any;
      const session = await this.prisma.session.findUnique({ where: { refreshToken } });
      if (!session || session.expiresAt < new Date()) throw new UnauthorizedException('Invalid refresh token');
      const user = await this.prisma.user.findUnique({ where: { id: decoded.sub }, select: { id: true, email: true, role: true, status: true } });
      if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('User not found or inactive');
      const newAccessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' });
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { userId, refreshToken } });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If the email exists, a reset link has been sent' };
    const resetToken = this.jwtService.sign({ sub: user.id, type: 'password_reset' }, { expiresIn: '1h' });
    const response: any = { message: 'If the email exists, a reset link has been sent' };
    if (process.env.NODE_ENV !== 'production') response.devResetToken = resetToken;
    return response;
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token) as any;
      if (decoded.type !== 'password_reset') throw new BadRequestException('Invalid token type');
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await this.prisma.user.update({ where: { id: decoded.sub }, data: { passwordHash } });
      await this.prisma.session.deleteMany({ where: { userId: decoded.sub } });
      return { message: 'Password reset successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}
