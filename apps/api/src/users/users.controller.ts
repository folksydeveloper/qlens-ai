import { Controller, Get, Patch, Delete, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() timezone?: string;
}

export class ChangePasswordDto {
  @IsString() @MinLength(8) currentPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('me/change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @Delete('me')
  async deleteAccount(@Req() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }
}
