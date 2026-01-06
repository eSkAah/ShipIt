import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigService } from '../config/config.service';

describe('StorageService', () => {
  let service: StorageService;

  const mockConfigService = {
    azureStorageConnectionString: '', // Empty to test validation without Azure
    azureStorageAvatarsContainer: 'avatars',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  describe('uploadAvatar', () => {
    it('should throw BadRequestException when no file is provided', async () => {
      await expect(service.uploadAvatar(null as any, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid mime type', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.gif',
        mimetype: 'image/gif',
        size: 1024,
      } as Express.Multer.File;

      await expect(service.uploadAvatar(mockFile, 'user-123')).rejects.toThrow('Invalid file type');
    });

    it('should throw BadRequestException for file too large', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
      } as Express.Multer.File;

      await expect(service.uploadAvatar(mockFile, 'user-123')).rejects.toThrow('File too large');
    });

    it('should throw BadRequestException when storage is not configured', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      await expect(service.uploadAvatar(mockFile, 'user-123')).rejects.toThrow(
        'Storage service not configured',
      );
    });

    it('should accept valid JPEG file', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      // Should not throw validation error, will fail on storage not configured
      await expect(service.uploadAvatar(mockFile, 'user-123')).rejects.toThrow(
        'Storage service not configured',
      );
    });

    it('should accept valid PNG file', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;

      await expect(service.uploadAvatar(mockFile, 'user-123')).rejects.toThrow(
        'Storage service not configured',
      );
    });

    it('should accept valid WebP file', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.webp',
        mimetype: 'image/webp',
        size: 1024,
      } as Express.Multer.File;

      await expect(service.uploadAvatar(mockFile, 'user-123')).rejects.toThrow(
        'Storage service not configured',
      );
    });
  });

  describe('deleteBlob', () => {
    it('should not throw when storage is not configured', async () => {
      await expect(
        service.deleteBlob('https://storage.azure.com/avatars/test.jpg'),
      ).resolves.not.toThrow();
    });

    it('should not throw when blobUrl is empty', async () => {
      await expect(service.deleteBlob('')).resolves.not.toThrow();
    });
  });
});
