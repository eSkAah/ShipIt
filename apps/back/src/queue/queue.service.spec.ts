import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;

  const mockEmailQueue = {
    client: Promise.resolve({
      ping: jest.fn().mockResolvedValue('PONG'),
    }),
    add: jest.fn(),
    getJobs: jest.fn(),
  };

  const mockStripeQueue = {
    client: Promise.resolve({
      ping: jest.fn().mockResolvedValue('PONG'),
    }),
    add: jest.fn(),
    getJobs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getQueueToken('email'),
          useValue: mockEmailQueue,
        },
        {
          provide: getQueueToken('stripe'),
          useValue: mockStripeQueue,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isHealthy', () => {
    it('should return true when queue connection is healthy', async () => {
      const result = await service.isHealthy();

      expect(result).toBe(true);
    });

    it('should return false when queue connection fails', async () => {
      const failingQueue = {
        client: Promise.resolve({
          ping: jest.fn().mockRejectedValue(new Error('Connection failed')),
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          QueueService,
          {
            provide: getQueueToken('email'),
            useValue: failingQueue,
          },
          {
            provide: getQueueToken('stripe'),
            useValue: mockStripeQueue,
          },
        ],
      }).compile();

      const failingService = module.get<QueueService>(QueueService);
      const result = await failingService.isHealthy();

      expect(result).toBe(false);
    });

    it('should return false when client promise rejects', async () => {
      const failingQueue = {
        client: Promise.reject(new Error('Connection refused')),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          QueueService,
          {
            provide: getQueueToken('email'),
            useValue: failingQueue,
          },
          {
            provide: getQueueToken('stripe'),
            useValue: mockStripeQueue,
          },
        ],
      }).compile();

      const failingService = module.get<QueueService>(QueueService);
      const result = await failingService.isHealthy();

      expect(result).toBe(false);
    });
  });

  describe('getEmailQueue', () => {
    it('should return the email queue instance', () => {
      const result = service.getEmailQueue();

      expect(result).toBe(mockEmailQueue);
    });
  });

  describe('getStripeQueue', () => {
    it('should return the stripe queue instance', () => {
      const result = service.getStripeQueue();

      expect(result).toBe(mockStripeQueue);
    });
  });
});
