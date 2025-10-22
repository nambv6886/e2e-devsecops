import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { BloomFilterService } from './bloom-filter.service';
import { REDIS_CLIENT } from '../../common/constants/common';

describe('BloomFilterService', () => {
  let service: BloomFilterService;
  let redisClient: any;

  const mockRedisClient = {
    exists: jest.fn(),
    sendCommand: jest.fn(),
    del: jest.fn(),
    multi: jest.fn(),
  };

  const mockPipeline = {
    addCommand: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomFilterService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<BloomFilterService>(BloomFilterService);
    redisClient = module.get(REDIS_CLIENT);

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock Logger methods
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    // Setup default mock implementations
    mockRedisClient.multi.mockReturnValue(mockPipeline);
    mockPipeline.exec.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize bloom filter successfully when it does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);
      mockRedisClient.sendCommand.mockResolvedValue('OK');

      await service.onModuleInit();

      expect(mockRedisClient.exists).toHaveBeenCalledWith('user:email:bloom');
      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.RESERVE',
        'user:email:bloom',
        '0.001',
        '10000',
      ]);
    });

    it('should skip initialization if bloom filter already exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);

      await service.onModuleInit();

      expect(mockRedisClient.exists).toHaveBeenCalled();
      expect(mockRedisClient.sendCommand).not.toHaveBeenCalledWith(
        expect.arrayContaining(['BF.RESERVE']),
      );
    });

    it('should handle initialization errors gracefully', async () => {
      const error = new Error('Redis connection error');
      mockRedisClient.exists.mockRejectedValue(error);

      await service.onModuleInit();

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to initialize bloom filter',
        error,
      );
    });
  });

  describe('addEmail', () => {
    it('should add email to bloom filter successfully', async () => {
      mockRedisClient.sendCommand.mockResolvedValue(1);

      const result = await service.addEmail('test@example.com');

      expect(result).toBe(true);
      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.ADD',
        'user:email:bloom',
        'test@example.com',
      ]);
    });

    it('should normalize email before adding (lowercase)', async () => {
      mockRedisClient.sendCommand.mockResolvedValue(1);

      await service.addEmail('TEST@EXAMPLE.COM');

      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.ADD',
        'user:email:bloom',
        'test@example.com',
      ]);
    });

    it('should trim whitespace from email', async () => {
      mockRedisClient.sendCommand.mockResolvedValue(1);

      await service.addEmail('  test@example.com  ');

      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.ADD',
        'user:email:bloom',
        'test@example.com',
      ]);
    });

    it('should return false when email already exists', async () => {
      mockRedisClient.sendCommand.mockResolvedValue(0);

      const result = await service.addEmail('test@example.com');

      expect(result).toBe(false);
    });

    it('should handle errors when adding email', async () => {
      const error = new Error('Redis command error');
      mockRedisClient.sendCommand.mockRejectedValue(error);

      await expect(service.addEmail('test@example.com')).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('mightExist', () => {
    it('should return true when email exists in bloom filter', async () => {
      mockRedisClient.sendCommand.mockResolvedValue(1);

      const result = await service.mightExist('test@example.com');

      expect(result).toBe(true);
      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.EXISTS',
        'user:email:bloom',
        'test@example.com',
      ]);
    });

    it('should return false when email does not exist', async () => {
      mockRedisClient.sendCommand.mockResolvedValue(0);

      const result = await service.mightExist('notfound@example.com');

      expect(result).toBe(false);
    });

    it('should normalize email before checking (lowercase)', async () => {
      mockRedisClient.sendCommand.mockResolvedValue(1);

      await service.mightExist('TEST@EXAMPLE.COM');

      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.EXISTS',
        'user:email:bloom',
        'test@example.com',
      ]);
    });

    it('should trim whitespace from email', async () => {
      mockRedisClient.sendCommand.mockResolvedValue(1);

      await service.mightExist('  test@example.com  ');

      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.EXISTS',
        'user:email:bloom',
        'test@example.com',
      ]);
    });

    it('should return true on error (fail-safe)', async () => {
      const error = new Error('Redis command error');
      mockRedisClient.sendCommand.mockRejectedValue(error);

      const result = await service.mightExist('test@example.com');

      expect(result).toBe(true);
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('addEmails', () => {
    it('should add multiple emails successfully', async () => {
      const emails = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
      ];

      await service.addEmails(emails);

      expect(mockRedisClient.multi).toHaveBeenCalled();
      expect(mockPipeline.addCommand).toHaveBeenCalledTimes(3);
      expect(mockPipeline.addCommand).toHaveBeenCalledWith([
        'BF.ADD',
        'user:email:bloom',
        'user1@example.com',
      ]);
      expect(mockPipeline.addCommand).toHaveBeenCalledWith([
        'BF.ADD',
        'user:email:bloom',
        'user2@example.com',
      ]);
      expect(mockPipeline.addCommand).toHaveBeenCalledWith([
        'BF.ADD',
        'user:email:bloom',
        'user3@example.com',
      ]);
      expect(mockPipeline.exec).toHaveBeenCalled();
    });

    it('should normalize all emails before adding', async () => {
      const emails = ['USER1@EXAMPLE.COM', '  user2@example.com  '];

      await service.addEmails(emails);

      expect(mockPipeline.addCommand).toHaveBeenCalledWith([
        'BF.ADD',
        'user:email:bloom',
        'user1@example.com',
      ]);
      expect(mockPipeline.addCommand).toHaveBeenCalledWith([
        'BF.ADD',
        'user:email:bloom',
        'user2@example.com',
      ]);
    });

    it('should return early when emails array is empty', async () => {
      await service.addEmails([]);

      expect(mockRedisClient.multi).not.toHaveBeenCalled();
      expect(mockPipeline.exec).not.toHaveBeenCalled();
    });

    it('should handle errors when adding multiple emails', async () => {
      const error = new Error('Pipeline execution error');
      mockPipeline.exec.mockRejectedValue(error);
      const emails = ['user1@example.com', 'user2@example.com'];

      await expect(service.addEmails(emails)).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error adding multiple emails to bloom filter',
        error,
      );
    });

    it('should log success message after adding emails', async () => {
      const emails = ['user1@example.com', 'user2@example.com'];

      await service.addEmails(emails);

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Added 2 emails to bloom filter',
      );
    });
  });

  describe('getBloomFilterInfo', () => {
    it('should return bloom filter information successfully', async () => {
      const mockInfo = {
        capacity: 10000,
        size: 100,
        numberOfFilters: 1,
        numberOfItemsInserted: 50,
        expansionRate: 2,
      };
      mockRedisClient.sendCommand.mockResolvedValue(mockInfo);

      const result = await service.getBloomFilterInfo();

      expect(result).toEqual(mockInfo);
      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.INFO',
        'user:email:bloom',
      ]);
    });

    it('should return null on error', async () => {
      const error = new Error('Redis command error');
      mockRedisClient.sendCommand.mockRejectedValue(error);

      const result = await service.getBloomFilterInfo();

      expect(result).toBeNull();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error getting bloom filter info',
        error,
      );
    });
  });

  describe('resetBloomFilter', () => {
    it('should reset bloom filter successfully', async () => {
      mockRedisClient.del.mockResolvedValue(1);
      mockRedisClient.exists.mockResolvedValue(0);
      mockRedisClient.sendCommand.mockResolvedValue('OK');

      await service.resetBloomFilter();

      expect(mockRedisClient.del).toHaveBeenCalledWith('user:email:bloom');
      expect(mockRedisClient.exists).toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Bloom filter reset successfully',
      );
    });

    it('should reinitialize filter after deletion', async () => {
      mockRedisClient.del.mockResolvedValue(1);
      mockRedisClient.exists.mockResolvedValue(0);
      mockRedisClient.sendCommand.mockResolvedValue('OK');

      await service.resetBloomFilter();

      expect(mockRedisClient.del).toHaveBeenCalled();
      expect(mockRedisClient.exists).toHaveBeenCalled();
      expect(mockRedisClient.sendCommand).toHaveBeenCalledWith([
        'BF.RESERVE',
        'user:email:bloom',
        '0.001',
        '10000',
      ]);
    });

    it('should handle errors when resetting', async () => {
      const error = new Error('Redis delete error');
      mockRedisClient.del.mockRejectedValue(error);

      await expect(service.resetBloomFilter()).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error resetting bloom filter',
        error,
      );
    });
  });
});
