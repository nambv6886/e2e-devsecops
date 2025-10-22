import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { UserTokenService } from './user-token.service';
import { UserTokenEntity } from './entities/user-token.entity';
import { TokenType } from '../../common/constants/common';

describe('UserTokenService', () => {
  let service: UserTokenService;
  let repository: Repository<UserTokenEntity>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
  };

  const mockUserToken: UserTokenEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-123',
    type: TokenType.RESET_PASSWORD_TOKEN,
    rawToken: 'sample-reset-token',
    expireTime: new Date(Date.now() + 3600000),
    isActive: true,
    user: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTokenService,
        {
          provide: getRepositoryToken(UserTokenEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserTokenService>(UserTokenService);
    repository = module.get<Repository<UserTokenEntity>>(
      getRepositoryToken(UserTokenEntity),
    );

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock Logger.error to suppress error output in tests
    jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveUserToken', () => {
    it('should save a user token successfully', async () => {
      const userId = 'user-123';
      const rawToken = 'reset-token-abc123';
      const expiredIn = '1h';

      mockRepository.create.mockReturnValue(mockUserToken);
      mockRepository.save.mockResolvedValue(mockUserToken);

      const result = await service.saveUserToken(userId, rawToken, expiredIn);

      expect(result).toEqual(mockUserToken);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: userId,
        type: TokenType.RESET_PASSWORD_TOKEN,
        rawToken: rawToken,
        expireTime: expect.any(Date),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUserToken);
    });

    it('should create token with correct expiration time for hours', async () => {
      const userId = 'user-123';
      const rawToken = 'reset-token-abc123';
      const expiredIn = '2h';

      const createdToken = {
        ...mockUserToken,
        expireTime: new Date(Date.now() + 2 * 3600000),
      };

      mockRepository.create.mockReturnValue(createdToken);
      mockRepository.save.mockResolvedValue(createdToken);

      const result = await service.saveUserToken(userId, rawToken, expiredIn);

      expect(result).toEqual(createdToken);
      expect(mockRepository.create).toHaveBeenCalled();
      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.expireTime).toBeInstanceOf(Date);
    });

    it('should create token with correct expiration time for days', async () => {
      const userId = 'user-123';
      const rawToken = 'reset-token-abc123';
      const expiredIn = '1d';

      mockRepository.create.mockReturnValue(mockUserToken);
      mockRepository.save.mockResolvedValue(mockUserToken);

      const result = await service.saveUserToken(userId, rawToken, expiredIn);

      expect(result).toEqual(mockUserToken);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';
      const rawToken = 'reset-token-abc123';
      const expiredIn = '1h';

      mockRepository.create.mockReturnValue(mockUserToken);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await service.saveUserToken(userId, rawToken, expiredIn);

      expect(result).toBeUndefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle create errors gracefully', async () => {
      const userId = 'user-123';
      const rawToken = 'reset-token-abc123';
      const expiredIn = '1h';

      mockRepository.create.mockImplementation(() => {
        throw new Error('Create error');
      });

      const result = await service.saveUserToken(userId, rawToken, expiredIn);

      expect(result).toBeUndefined();
    });
  });

  describe('findUserResetPasswordToken', () => {
    it('should find a user reset password token successfully', async () => {
      const userId = 'user-123';
      const resetPasswordToken = 'reset-token-abc123';

      mockRepository.findOneBy.mockResolvedValue(mockUserToken);

      const result = await service.findUserResetPasswordToken(
        userId,
        resetPasswordToken,
      );

      expect(result).toEqual(mockUserToken);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        userId,
        type: TokenType.RESET_PASSWORD_TOKEN,
        rawToken: resetPasswordToken,
        isActive: true,
      });
    });

    it('should return null when token is not found', async () => {
      const userId = 'user-123';
      const resetPasswordToken = 'nonexistent-token';

      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findUserResetPasswordToken(
        userId,
        resetPasswordToken,
      );

      expect(result).toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        userId,
        type: TokenType.RESET_PASSWORD_TOKEN,
        rawToken: resetPasswordToken,
        isActive: true,
      });
    });

    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';
      const resetPasswordToken = 'reset-token-abc123';

      mockRepository.findOneBy.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await service.findUserResetPasswordToken(
        userId,
        resetPasswordToken,
      );

      expect(result).toBeUndefined();
      expect(mockRepository.findOneBy).toHaveBeenCalled();
    });

    it('should only find active tokens', async () => {
      const userId = 'user-123';
      const resetPasswordToken = 'reset-token-abc123';

      mockRepository.findOneBy.mockResolvedValue(mockUserToken);

      await service.findUserResetPasswordToken(userId, resetPasswordToken);

      const callArgs = mockRepository.findOneBy.mock.calls[0][0];
      expect(callArgs.isActive).toBe(true);
    });

    it('should only find reset password token type', async () => {
      const userId = 'user-123';
      const resetPasswordToken = 'reset-token-abc123';

      mockRepository.findOneBy.mockResolvedValue(mockUserToken);

      await service.findUserResetPasswordToken(userId, resetPasswordToken);

      const callArgs = mockRepository.findOneBy.mock.calls[0][0];
      expect(callArgs.type).toBe(TokenType.RESET_PASSWORD_TOKEN);
    });
  });

  describe('deleteResetPasswordToken', () => {
    it('should soft delete reset password tokens successfully', async () => {
      const userId = 'user-123';
      const updateResult = { affected: 1, raw: [], generatedMaps: [] };

      mockRepository.update.mockResolvedValue(updateResult);

      const result = await service.deleteResetPasswordToken(userId);

      expect(result).toEqual(updateResult);
      expect(mockRepository.update).toHaveBeenCalledWith(
        {
          userId,
          type: TokenType.RESET_PASSWORD_TOKEN,
          isActive: true,
        },
        {
          isActive: false,
        },
      );
    });

    it('should return update result when no tokens found', async () => {
      const userId = 'user-without-tokens';
      const updateResult = { affected: 0, raw: [], generatedMaps: [] };

      mockRepository.update.mockResolvedValue(updateResult);

      const result = await service.deleteResetPasswordToken(userId);

      expect(result).toEqual(updateResult);
      expect(mockRepository.update).toHaveBeenCalledWith(
        {
          userId,
          type: TokenType.RESET_PASSWORD_TOKEN,
          isActive: true,
        },
        {
          isActive: false,
        },
      );
    });

    it('should update multiple tokens if user has several active tokens', async () => {
      const userId = 'user-123';
      const updateResult = { affected: 3, raw: [], generatedMaps: [] };

      mockRepository.update.mockResolvedValue(updateResult);

      const result = await service.deleteResetPasswordToken(userId);

      expect(result).toEqual(updateResult);
      expect(result.affected).toBe(3);
    });

    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';

      mockRepository.update.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await service.deleteResetPasswordToken(userId);

      expect(result).toBeUndefined();
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should only delete active tokens', async () => {
      const userId = 'user-123';
      const updateResult = { affected: 1, raw: [], generatedMaps: [] };

      mockRepository.update.mockResolvedValue(updateResult);

      await service.deleteResetPasswordToken(userId);

      const whereClause = mockRepository.update.mock.calls[0][0];
      expect(whereClause.isActive).toBe(true);
    });

    it('should only delete reset password token type', async () => {
      const userId = 'user-123';
      const updateResult = { affected: 1, raw: [], generatedMaps: [] };

      mockRepository.update.mockResolvedValue(updateResult);

      await service.deleteResetPasswordToken(userId);

      const whereClause = mockRepository.update.mock.calls[0][0];
      expect(whereClause.type).toBe(TokenType.RESET_PASSWORD_TOKEN);
    });
  });
});
