import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { User } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadAvatar: jest.fn(),
    deleteBlob: jest.fn(),
  };

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    phone: null,
    address: null,
    emailVerified: true,
    avatarUrl: null,
    language: 'en',
    theme: 'system',
    notificationsEnabled: true,
    isSuperAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile without password hash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-123');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('Test');
      expect(result.lastName).toBe('User');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and return without password hash', async () => {
      const updatedUser = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'Name',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', {
        firstName: 'Updated',
        lastName: 'Name',
      });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          firstName: 'Updated',
          lastName: 'Name',
        },
      });
    });

    it('should update language preference', async () => {
      const updatedUser = { ...mockUser, language: 'fr' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', { language: 'fr' });

      expect(result.language).toBe('fr');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { language: 'fr' },
      });
    });

    it('should update theme preference', async () => {
      const updatedUser = { ...mockUser, theme: 'dark' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', { theme: 'dark' });

      expect(result.theme).toBe('dark');
    });

    it('should update notifications enabled', async () => {
      const updatedUser = { ...mockUser, notificationsEnabled: false };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', { notificationsEnabled: false });

      expect(result.notificationsEnabled).toBe(false);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent-user', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadAvatar', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    it('should upload avatar and return URL', async () => {
      const avatarUrl = 'https://storage.azure.com/avatars/user-123.jpg';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockStorageService.uploadAvatar.mockResolvedValue({ url: avatarUrl });
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, avatarUrl });

      const result = await service.uploadAvatar('user-123', mockFile);

      expect(result.avatarUrl).toBe(avatarUrl);
      expect(mockStorageService.uploadAvatar).toHaveBeenCalledWith(mockFile, 'user-123');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { avatarUrl },
      });
    });

    it('should delete old avatar before uploading new one', async () => {
      const oldAvatarUrl = 'https://storage.azure.com/avatars/old-avatar.jpg';
      const newAvatarUrl = 'https://storage.azure.com/avatars/new-avatar.jpg';
      mockPrismaService.user.findUnique.mockResolvedValue({ ...mockUser, avatarUrl: oldAvatarUrl });
      mockStorageService.uploadAvatar.mockResolvedValue({ url: newAvatarUrl });
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, avatarUrl: newAvatarUrl });

      await service.uploadAvatar('user-123', mockFile);

      expect(mockStorageService.deleteBlob).toHaveBeenCalledWith(oldAvatarUrl);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.uploadAvatar('nonexistent-user', mockFile)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar and update user', async () => {
      const avatarUrl = 'https://storage.azure.com/avatars/avatar.jpg';
      mockPrismaService.user.findUnique.mockResolvedValue({ ...mockUser, avatarUrl });
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, avatarUrl: null });

      await service.deleteAvatar('user-123');

      expect(mockStorageService.deleteBlob).toHaveBeenCalledWith(avatarUrl);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { avatarUrl: null },
      });
    });

    it('should do nothing if user has no avatar', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.deleteAvatar('user-123');

      expect(mockStorageService.deleteBlob).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAvatar('nonexistent-user')).rejects.toThrow(NotFoundException);
    });
  });
});
