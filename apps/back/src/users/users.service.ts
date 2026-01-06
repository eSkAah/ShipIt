import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address as object }),
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.theme !== undefined && { theme: dto.theme }),
        ...(dto.notificationsEnabled !== undefined && {
          notificationsEnabled: dto.notificationsEnabled,
        }),
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      await this.storageService.deleteBlob(user.avatarUrl);
    }

    // Upload new avatar
    const { url } = await this.storageService.uploadAvatar(file, userId);

    // Update user with new avatar URL
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    });

    return { avatarUrl: url };
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarUrl) {
      await this.storageService.deleteBlob(user.avatarUrl);
      await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
      });
    }
  }
}
