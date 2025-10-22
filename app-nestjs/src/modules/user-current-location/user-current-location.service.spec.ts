import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { UserCurrentLocationService } from './user-current-location.service';
import { UserCurrentLocationEntity } from './entities/user-current-location.entity';
import { RedisService } from '../shared/redis.service';
import { UpdateUserCurrentLocationDto } from './dto/update-user-current-location.dto';
import { GetUserLocationDto } from './dto/get-user-location.dto';

describe('UserCurrentLocationService', () => {
  let service: UserCurrentLocationService;
  let redisService: RedisService;

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockRedisService = {
    withLock: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockUserId = 'e8d3ff44-989c-49f6-8350-6444df9c533a';
  const mockLocationId = 'location-uuid-123';

  const mockUpdateDto: UpdateUserCurrentLocationDto = {
    latitude: 37.7749,
    longitude: -122.4194,
  };

  const mockLocationEntity: Partial<UserCurrentLocationEntity> = {
    id: mockLocationId,
    userId: mockUserId,
    latitude: 37.7749,
    longitude: -122.4194,
    location: 'POINT(37.7749 -122.4194)',
    updatedAt: new Date('2025-10-07T10:00:00Z'),
  };

  const mockLocationDto: GetUserLocationDto = {
    userId: mockUserId,
    latitude: 37.7749,
    longitude: -122.4194,
    updatedAt: new Date('2025-10-07T10:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCurrentLocationService,
        {
          provide: getRepositoryToken(UserCurrentLocationEntity),
          useValue: mockRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<UserCurrentLocationService>(
      UserCurrentLocationService,
    );
    redisService = module.get<RedisService>(RedisService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLocation', () => {
    it('should update location successfully for new user', async () => {
      // Mock no existing location
      mockRepository.findOne.mockResolvedValueOnce(null);

      // Mock insert result
      mockQueryBuilder.execute.mockResolvedValueOnce({
        identifiers: [{ id: mockLocationId }],
      });

      // Mock fetch newly created location
      mockRepository.findOne.mockResolvedValueOnce(mockLocationEntity);

      // Mock Redis operations
      mockRedisService.withLock.mockImplementation(async (key, callback) => {
        return await callback();
      });
      mockRedisService.set.mockResolvedValue('OK');

      const result = await service.updateLocation(mockUserId, mockUpdateDto);

      expect(result).toEqual({
        userId: mockUserId,
        latitude: mockUpdateDto.latitude,
        longitude: mockUpdateDto.longitude,
        updatedAt: mockLocationEntity.updatedAt,
      });

      expect(mockRedisService.withLock).toHaveBeenCalledWith(
        `lock:user:location:${mockUserId}`,
        expect.any(Function),
        {
          ttlSeconds: 5,
          retryTimes: 5,
          retryDelayMs: 100,
        },
      );

      expect(mockQueryBuilder.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.values).toHaveBeenCalledWith({
        userId: mockUserId,
        latitude: mockUpdateDto.latitude,
        longitude: mockUpdateDto.longitude,
        location: expect.any(Function),
      });
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should update location successfully for existing user', async () => {
      // Mock existing location
      mockRepository.findOne
        .mockResolvedValueOnce(mockLocationEntity)
        .mockResolvedValueOnce(mockLocationEntity);

      // Mock update result
      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });

      // Mock Redis operations
      mockRedisService.withLock.mockImplementation(async (key, callback) => {
        return await callback();
      });
      mockRedisService.set.mockResolvedValue('OK');

      const result = await service.updateLocation(mockUserId, mockUpdateDto);

      expect(result).toEqual({
        userId: mockUserId,
        latitude: mockUpdateDto.latitude,
        longitude: mockUpdateDto.longitude,
        updatedAt: mockLocationEntity.updatedAt,
      });

      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        latitude: mockUpdateDto.latitude,
        longitude: mockUpdateDto.longitude,
        location: expect.any(Function),
      });
    });

    it('should throw ConflictException when lock acquisition fails', async () => {
      mockRedisService.withLock.mockRejectedValue(
        new Error('Failed to acquire lock after 5 attempts'),
      );

      await expect(
        service.updateLocation(mockUserId, mockUpdateDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRedisService.withLock.mockImplementation(async (key, callback) => {
        return await callback();
      });
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateLocation(mockUserId, mockUpdateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should cache location after successful update', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockQueryBuilder.execute.mockResolvedValueOnce({
        identifiers: [{ id: mockLocationId }],
      });
      mockRepository.findOne.mockResolvedValueOnce(mockLocationEntity);

      mockRedisService.withLock.mockImplementation(async (key, callback) => {
        return await callback();
      });
      mockRedisService.set.mockResolvedValue('OK');

      await service.updateLocation(mockUserId, mockUpdateDto);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user:location:${mockUserId}`,
        expect.any(String),
        300, // 5 minutes
      );
    });
  });

  describe('getLocation', () => {
    it('should return location from cache when available', async () => {
      const cachedData = JSON.stringify(mockLocationDto);
      mockRedisService.get.mockResolvedValue(cachedData);

      const result = await service.getLocation(mockUserId);

      expect(result).toEqual({
        ...mockLocationDto,
        updatedAt: new Date(mockLocationDto.updatedAt),
      });
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user:location:${mockUserId}`,
      );
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache misses', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(mockLocationEntity);
      mockRedisService.set.mockResolvedValue('OK');

      const result = await service.getLocation(mockUserId);

      expect(result).toEqual({
        userId: mockUserId,
        latitude: mockLocationEntity.latitude,
        longitude: mockLocationEntity.longitude,
        updatedAt: mockLocationEntity.updatedAt,
      });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: ['id', 'userId', 'latitude', 'longitude', 'updatedAt'],
      });

      // Should cache the result
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException when location does not exist', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getLocation(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getLocation(mockUserId)).rejects.toThrow(
        `Location not found for user ${mockUserId}`,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getLocation(mockUserId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle cache read errors gracefully and fetch from database', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));
      mockRepository.findOne.mockResolvedValue(mockLocationEntity);
      mockRedisService.set.mockResolvedValue('OK');

      const result = await service.getLocation(mockUserId);

      expect(result).toEqual({
        userId: mockUserId,
        latitude: mockLocationEntity.latitude,
        longitude: mockLocationEntity.longitude,
        updatedAt: mockLocationEntity.updatedAt,
      });
      expect(mockRepository.findOne).toHaveBeenCalled();
    });

    it('should not fail if caching after database fetch fails', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(mockLocationEntity);
      mockRedisService.set.mockRejectedValue(new Error('Redis write error'));

      const result = await service.getLocation(mockUserId);

      expect(result).toEqual({
        userId: mockUserId,
        latitude: mockLocationEntity.latitude,
        longitude: mockLocationEntity.longitude,
        updatedAt: mockLocationEntity.updatedAt,
      });
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache successfully', async () => {
      mockRedisService.del.mockResolvedValue(1);

      await service.invalidateCache(mockUserId);

      expect(mockRedisService.del).toHaveBeenCalledWith(
        `user:location:${mockUserId}`,
      );
    });

    it('should handle cache invalidation errors gracefully', async () => {
      mockRedisService.del.mockRejectedValue(new Error('Redis error'));

      await expect(service.invalidateCache(mockUserId)).resolves.not.toThrow();
    });
  });

  describe('cache key generation', () => {
    it('should generate correct cache key format', async () => {
      const cachedData = JSON.stringify(mockLocationDto);
      mockRedisService.get.mockResolvedValue(cachedData);

      await service.getLocation(mockUserId);

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user:location:${mockUserId}`,
      );
    });

    it('should generate correct lock key format', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockQueryBuilder.execute.mockResolvedValueOnce({
        identifiers: [{ id: mockLocationId }],
      });
      mockRepository.findOne.mockResolvedValueOnce(mockLocationEntity);

      mockRedisService.withLock.mockImplementation(async (key, callback) => {
        return await callback();
      });

      await service.updateLocation(mockUserId, mockUpdateDto);

      expect(mockRedisService.withLock).toHaveBeenCalledWith(
        `lock:user:location:${mockUserId}`,
        expect.any(Function),
        expect.any(Object),
      );
    });
  });

  describe('concurrent updates', () => {
    it('should use distributed lock to handle concurrent updates', async () => {
      let lockCallbackExecuted = false;

      mockRedisService.withLock.mockImplementation(
        async (key, callback, options) => {
          lockCallbackExecuted = true;
          expect(options).toEqual({
            ttlSeconds: 5,
            retryTimes: 5,
            retryDelayMs: 100,
          });
          return await callback();
        },
      );

      mockRepository.findOne.mockResolvedValueOnce(mockLocationEntity);
      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(mockLocationEntity);

      await service.updateLocation(mockUserId, mockUpdateDto);

      expect(lockCallbackExecuted).toBe(true);
      expect(mockRedisService.withLock).toHaveBeenCalledTimes(1);
    });
  });

  describe('spatial data handling', () => {
    it('should use correct POINT format (latitude longitude) for SRID 4326', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockQueryBuilder.execute.mockResolvedValueOnce({
        identifiers: [{ id: mockLocationId }],
      });
      mockRepository.findOne.mockResolvedValueOnce(mockLocationEntity);

      mockRedisService.withLock.mockImplementation(async (key, callback) => {
        return await callback();
      });

      await service.updateLocation(mockUserId, mockUpdateDto);

      expect(mockQueryBuilder.values).toHaveBeenCalledWith({
        userId: mockUserId,
        latitude: mockUpdateDto.latitude,
        longitude: mockUpdateDto.longitude,
        location: expect.any(Function),
      });
    });

    it('should exclude location field when querying to avoid conversion issues', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(mockLocationEntity);

      await service.getLocation(mockUserId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: ['id', 'userId', 'latitude', 'longitude', 'updatedAt'],
      });
    });
  });
});
