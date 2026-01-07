import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService, LogContext } from './logger.service';
import { PrismaService } from '../database/prisma.service';

describe('LoggerService', () => {
  let service: LoggerService;

  const mockPrismaService = {
    appLog: {
      create: jest.fn(),
    },
  };

  // Spy on console methods
  const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    debug: jest.spyOn(console, 'debug').mockImplementation(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);

    // Reset NODE_ENV for tests
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
  });

  describe('log / info', () => {
    it('should log message to console', () => {
      service.log('Test message');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Test message'));
    });

    it('should persist log to database', async () => {
      mockPrismaService.appLog.create.mockResolvedValue({});

      service.log('Test message');

      // Wait for async persistence
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrismaService.appLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          level: 'info',
          message: 'Test message',
        }),
      });
    });

    it('should include context in log', async () => {
      mockPrismaService.appLog.create.mockResolvedValue({});

      const context: LogContext = {
        userId: 'user-123',
        orgId: 'org-456',
        requestId: 'req-789',
        customField: 'value',
      };

      service.log('Test with context', context);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrismaService.appLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          orgId: 'org-456',
          requestId: 'req-789',
          context: { customField: 'value' },
        }),
      });
    });

    it('should include requestId in formatted message', () => {
      service.log('Test message', { requestId: 'req-123' });

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[req-123]'));
    });

    it('info should call log', () => {
      const logSpy = jest.spyOn(service, 'log');

      service.info('Info message', { userId: 'user-1' });

      expect(logSpy).toHaveBeenCalledWith('Info message', { userId: 'user-1' });
    });
  });

  describe('error', () => {
    it('should log error to console', () => {
      service.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Error message'));
    });

    it('should include stack trace in console output', () => {
      service.error('Error message', 'Stack trace line 1\nStack trace line 2');

      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Stack trace line 1'));
    });

    it('should persist error with trace in context', async () => {
      mockPrismaService.appLog.create.mockResolvedValue({});

      service.error('Error message', 'Stack trace', { userId: 'user-1' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrismaService.appLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          level: 'error',
          message: 'Error message',
          context: { trace: 'Stack trace' },
          userId: 'user-1',
        }),
      });
    });

    it('should handle error without trace', async () => {
      mockPrismaService.appLog.create.mockResolvedValue({});

      service.error('Error message');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrismaService.appLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          level: 'error',
          message: 'Error message',
        }),
      });
    });
  });

  describe('warn', () => {
    it('should log warning to console', () => {
      service.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('Warning message'));
    });

    it('should persist warning to database', async () => {
      mockPrismaService.appLog.create.mockResolvedValue({});

      service.warn('Warning message', { orgId: 'org-1' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrismaService.appLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          level: 'warn',
          message: 'Warning message',
          orgId: 'org-1',
        }),
      });
    });
  });

  describe('debug', () => {
    it('should log debug message in non-production environment', () => {
      process.env.NODE_ENV = 'development';

      service.debug('Debug message');

      expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));
    });

    it('should not log debug message to console in production', () => {
      process.env.NODE_ENV = 'production';

      service.debug('Debug message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should still persist debug log in production', async () => {
      process.env.NODE_ENV = 'production';
      mockPrismaService.appLog.create.mockResolvedValue({});

      service.debug('Debug message');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrismaService.appLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          level: 'debug',
          message: 'Debug message',
        }),
      });
    });
  });

  describe('verbose', () => {
    it('should call debug', () => {
      const debugSpy = jest.spyOn(service, 'debug');

      service.verbose('Verbose message', { requestId: 'req-1' });

      expect(debugSpy).toHaveBeenCalledWith('Verbose message', { requestId: 'req-1' });
    });
  });

  describe('error handling', () => {
    it('should not throw when database persistence fails', async () => {
      mockPrismaService.appLog.create.mockRejectedValue(new Error('DB error'));

      // Should not throw
      expect(() => service.log('Test message')).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should log error to console
      expect(consoleSpy.error).toHaveBeenCalledWith('Failed to persist log to database');
    });

    it('should handle empty context', async () => {
      mockPrismaService.appLog.create.mockResolvedValue({});

      service.log('Message without context');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrismaService.appLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          context: undefined,
        }),
      });
    });
  });

  describe('message formatting', () => {
    it('should include timestamp in message', () => {
      service.log('Test');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      );
    });

    it('should use "no-request-id" when requestId is not provided', () => {
      service.log('Test');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[no-request-id]'));
    });
  });
});
