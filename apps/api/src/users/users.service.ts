import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true, role: true, status: true, riskScore: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const balance = await this.prisma.topUpLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    return { ...user, subscription, topUpBalance: balance._sum?.amount || 0 };
  }

  async updateProfile(userId: string, dto: any) {
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: { firstName: dto.firstName, lastName: dto.lastName, timezone: dto.timezone },
      create: { userId, firstName: dto.firstName, lastName: dto.lastName, timezone: dto.timezone || 'Asia/Jakarta' },
    });
    return { message: 'Profile updated', profile };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    const newHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { status: 'BANNED' } });
    return { message: 'Account deletion requested' };
  }
}
