import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HealthModule } from '../src/health/health.module';
import { PrismaService } from '../src/database/prisma.service';
import { QueueService } from '../src/queue/queue.service';
import { ConfigModule } from '../src/config/config.module';
import { LoggerModule } from '../src/logger';
import { getQueueToken } from '@nestjs/bullmq';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    appLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  };

  const mockQueueService = {
    isHealthy: jest.fn().mockResolvedValue(true),
  };

  const mockQueue = {
    client: Promise.resolve({
      ping: jest.fn().mockResolvedValue('PONG'),
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HealthModule, LoggerModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(QueueService)
      .useValue(mockQueueService)
      .overrideProvider(getQueueToken('email'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('stripe'))
      .useValue(mockQueue)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('/health/ready (GET)', () => {
    it('should return ready status when all services are healthy', () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);
      mockQueueService.isHealthy.mockResolvedValue(true);

      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
          expect(res.body).toHaveProperty('info');
        });
    });

    it('should return 503 when database is unhealthy', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const response = await request(app.getHttpServer()).get('/health/ready');

      // Health check must return 503 when database is down
      expect(response.status).toBe(503);
    });

    it('should return 503 when Redis is unhealthy', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);
      mockQueueService.isHealthy.mockResolvedValue(false);

      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(503);
    });
  });
});
