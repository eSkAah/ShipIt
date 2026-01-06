import { Injectable, BadRequestException } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ConfigService } from '../config/config.service';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  blobName: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class StorageService {
  private containerClient: ContainerClient | null = null;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  private initializeClient(): void {
    const connectionString = this.configService.azureStorageConnectionString;
    if (!connectionString) {
      console.warn('Azure Storage connection string not configured. File uploads will fail.');
      return;
    }

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerName = this.configService.azureStorageAvatarsContainer;
      this.containerClient = blobServiceClient.getContainerClient(containerName);
    } catch (error) {
      console.error('Failed to initialize Azure Storage client:', error);
    }
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    this.validateFile(file);

    if (!this.containerClient) {
      throw new BadRequestException('Storage service not configured');
    }

    const extension = this.getFileExtension(file.mimetype);
    const blobName = `avatars/${userId}/${uuidv4()}.${extension}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return {
      url: blockBlobClient.url,
      blobName,
    };
  }

  async deleteBlob(blobUrl: string): Promise<void> {
    if (!this.containerClient || !blobUrl) {
      return;
    }

    try {
      // Extract blob name from URL
      const url = new URL(blobUrl);
      const pathParts = url.pathname.split('/');
      // Remove container name from path to get blob name
      const containerName = this.configService.azureStorageAvatarsContainer;
      const containerIndex = pathParts.indexOf(containerName);
      if (containerIndex === -1) {
        return;
      }
      const blobName = pathParts.slice(containerIndex + 1).join('/');

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      console.error('Failed to delete blob:', error);
      // Don't throw - deletion failures shouldn't block the main operation
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  private getFileExtension(mimetype: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return mimeToExt[mimetype] || 'jpg';
  }
}
