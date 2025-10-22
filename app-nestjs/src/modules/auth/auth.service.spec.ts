import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserTokenService } from '../user-token/user-token.service';
import { EmailService } from '../shared/email.service';
import {
  REDIS_CLIENT,
  REDIS_KEY_FORGOT_PASSWORD,
  UserRole,
} from '../../common/constants/common';
import { ResponseStatus } from '../../models/interfaces/response.status.model';
import { MessageCode } from '../../common/constants/message-code.constant';
import { UserEntity } from '../users/entities/user.entity';
import {
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from './dto/auth.dto';
import { HashUtils } from '../../common/utils/hash.utils';
import { UserTokenEntity } from '../user-token/entities/user-token.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userTokenService: UserTokenService;
  let emailService: EmailService;
  let redisClient: any;

  const mockRedisClient = {
    hGet: jest.fn(),
    hSet: jest.fn(),
    SET: jest.fn(),
    get: jest.fn(),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserTokenService = {
    deleteResetPasswordToken: jest.fn(),
    saveUserToken: jest.fn(),
    findUserResetPasswordToken: jest.fn(),
  };

  const mockEmailService = {
    sendMailResetPassword: jest.fn(),
  };

  const mockUser: UserEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword',
    salt: 'randomSalt',
    role: UserRole.USER,
    isActive: true,
    passwordChangedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserTokenService,
          useValue: mockUserTokenService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userTokenService = module.get<UserTokenService>(UserTokenService);
    emailService = module.get<EmailService>(EmailService);
    redisClient = module.get(REDIS_CLIENT);

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        JWT_SECRET_KEY: 'test-secret-key',
        JWT_ACCESS_TOKEN_EXPIRES_TIME: '15m',
        JWT_REFRESH_TOKEN_EXPIRES_TIME: '7d',
        FORGOT_PASSWORD_WAIT_TIME_IN_SECONDS: '60',
        PASSWORD_RESET_TOKEN_LIFE_TIME_IN_SECONDS: '3600',
        BASE_URL: 'http://localhost:3000',
      };
      return config[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = HashUtils.hashPassword(
        loginRequest.password,
        mockUser.salt,
      );
      const userWithCorrectPassword = { ...mockUser, password: hashedPassword };

      mockUsersService.findOneByEmail.mockResolvedValue(
        userWithCorrectPassword,
      );
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');

      const result = await service.login(loginRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshAccessToken).toBe('refresh-token');
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        loginRequest.email,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should return not found when user does not exist', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.login(loginRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.NotFound);
      expect(result.responseMessage.messageCode).toBe(
        MessageCode.USER_NOT_FOUND,
      );
      expect(result.accessToken).toBeUndefined();
      expect(result.refreshAccessToken).toBeUndefined();
    });

    it('should return fail when password is incorrect', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.login(loginRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(
        MessageCode.INVALID_PASSWORD,
      );
      expect(result.accessToken).toBeUndefined();
      expect(result.refreshAccessToken).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      mockUsersService.findOneByEmail.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.login(loginRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(MessageCode.FAIL);
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordRequest: ForgotPasswordRequest = {
      email: 'test@example.com',
    };

    it('should send reset password email successfully', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      mockRedisClient.hGet.mockResolvedValue(null);
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockUserTokenService.deleteResetPasswordToken.mockResolvedValue(
        undefined,
      );
      mockUserTokenService.saveUserToken.mockResolvedValue(undefined);
      mockEmailService.sendMailResetPassword.mockReturnValue(undefined);

      const result = await service.forgotPassword(forgotPasswordRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
      expect(result.responseMessage.data).toHaveProperty('token');
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        forgotPasswordRequest.email,
      );
      expect(
        mockUserTokenService.deleteResetPasswordToken,
      ).toHaveBeenCalledWith(mockUser.id);
      expect(mockEmailService.sendMailResetPassword).toHaveBeenCalled();
    });

    it('should return fail when user does not exist', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(MessageCode.FAIL);
    });

    it('should enforce rate limiting when request is too frequent', async () => {
      const recentTimestamp = Date.now() - 30000; // 30 seconds ago
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      mockRedisClient.hGet.mockResolvedValue(recentTimestamp.toString());

      const result = await service.forgotPassword(forgotPasswordRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(
        MessageCode.ACCOUNT_FORGOT_PASSWORD_NEED_TO_WAIT,
      );
      expect(result.responseMessage.data).toBeGreaterThan(0);
    });

    it('should allow request after wait time has passed', async () => {
      const oldTimestamp = Date.now() - 120000; // 2 minutes ago
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      mockRedisClient.hGet.mockResolvedValue(oldTimestamp.toString());
      mockRedisClient.hSet.mockResolvedValue('OK');
      mockUserTokenService.deleteResetPasswordToken.mockResolvedValue(
        undefined,
      );
      mockUserTokenService.saveUserToken.mockResolvedValue(undefined);
      mockEmailService.sendMailResetPassword.mockReturnValue(undefined);

      const result = await service.forgotPassword(forgotPasswordRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
    });

    it('should handle errors gracefully', async () => {
      mockUsersService.findOneByEmail.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.forgotPassword(forgotPasswordRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(MessageCode.FAIL);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordRequest: ResetPasswordRequest = {
      token: 'valid-reset-token',
      password: 'newPassword123',
    };

    const mockUserToken: UserTokenEntity = {
      id: '1',
      userId: mockUser.id,
      rawToken: 'valid-reset-token',
      type: 'RESET_PASSWORD_TOKEN',
      isActive: true,
      expireTime: new Date(Date.now() + 3600000),
      user: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should reset password successfully', async () => {
      const decryptedPayload = {
        userId: mockUser.id,
        expire: Date.now() + 3600000, // 1 hour from now
      };

      jest.spyOn(HashUtils, 'decryptCode').mockReturnValue(decryptedPayload);
      jest.spyOn(HashUtils, 'hashPassword').mockReturnValue('differentHash');
      jest.spyOn(HashUtils, 'genRandomString').mockReturnValue('newSalt');

      mockUserTokenService.findUserResetPasswordToken.mockResolvedValue(
        mockUserToken,
      );
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockUsersService.update.mockResolvedValue({
        responseMessage: { status: ResponseStatus.Success },
      });
      mockUserTokenService.deleteResetPasswordToken.mockResolvedValue(
        undefined,
      );

      const result = await service.resetPassword(resetPasswordRequest);

      expect(result.status).toBe(ResponseStatus.Success);
      expect(result.messageCode).toBe(MessageCode.SUCCESS);
      expect(
        mockUserTokenService.findUserResetPasswordToken,
      ).toHaveBeenCalledWith(mockUser.id, resetPasswordRequest.token);
      expect(mockUsersService.update).toHaveBeenCalled();
      expect(
        mockUserTokenService.deleteResetPasswordToken,
      ).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return error when token is invalid', async () => {
      jest.spyOn(HashUtils, 'decryptCode').mockReturnValue(null);

      const result = await service.resetPassword(resetPasswordRequest);

      expect(result.status).toBe(ResponseStatus.Fail);
      expect(result.messageCode).toBe(MessageCode.DECRYPT_CODE_ERROR_MESSAGE);
    });

    it('should return error when token is expired', async () => {
      const expiredPayload = {
        userId: mockUser.id,
        expire: Date.now() - 3600000, // 1 hour ago
      };

      jest.spyOn(HashUtils, 'decryptCode').mockReturnValue(expiredPayload);

      const result = await service.resetPassword(resetPasswordRequest);

      expect(result.status).toBe(ResponseStatus.Fail);
      expect(result.messageCode).toBe(
        MessageCode.ACCOUNT_CODE_EXPIRED_LINK_MESSAGE,
      );
    });

    it('should return error when user token does not exist', async () => {
      const decryptedPayload = {
        userId: mockUser.id,
        expire: Date.now() + 3600000,
      };

      jest.spyOn(HashUtils, 'decryptCode').mockReturnValue(decryptedPayload);
      mockUserTokenService.findUserResetPasswordToken.mockResolvedValue(null);

      const result = await service.resetPassword(resetPasswordRequest);

      expect(result.status).toBe(ResponseStatus.Fail);
      expect(result.messageCode).toBe(
        MessageCode.ACCOUNT_RESET_PASSWORD_INVALID_RESET_TOKEN_MESSAGE,
      );
    });

    it('should return error when new password matches old password', async () => {
      const decryptedPayload = {
        userId: mockUser.id,
        expire: Date.now() + 3600000,
      };

      jest.spyOn(HashUtils, 'decryptCode').mockReturnValue(decryptedPayload);
      jest.spyOn(HashUtils, 'hashPassword').mockReturnValue(mockUser.password);

      mockUserTokenService.findUserResetPasswordToken.mockResolvedValue(
        mockUserToken,
      );
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await service.resetPassword(resetPasswordRequest);

      expect(result.status).toBe(ResponseStatus.Fail);
      expect(result.messageCode).toBe(
        MessageCode.ACCOUNT_RESET_PASSWORD_INVALID_NEW_PASSWORD_MESSAGE,
      );
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(HashUtils, 'decryptCode').mockImplementation(() => {
        throw new Error('Decryption error');
      });

      const result = await service.resetPassword(resetPasswordRequest);

      expect(result.status).toBe(ResponseStatus.Fail);
      expect(result.messageCode).toBe(MessageCode.FAIL);
    });
  });

  describe('deactiveAccessToken', () => {
    it('should deactivate valid token', () => {
      const token = 'Bearer valid-jwt-token';
      mockRedisClient.SET.mockResolvedValue('OK');

      service.deactiveAccessToken(token);

      expect(mockRedisClient.SET).toHaveBeenCalledWith(
        'valid-jwt-token',
        'deactivated',
        { EX: 3600 },
      );
    });

    it('should handle null token', () => {
      service.deactiveAccessToken(null);

      expect(mockRedisClient.SET).not.toHaveBeenCalled();
    });

    it('should handle undefined token', () => {
      service.deactiveAccessToken(undefined);

      expect(mockRedisClient.SET).not.toHaveBeenCalled();
    });

    it('should handle non-string token', () => {
      service.deactiveAccessToken(123 as any);

      expect(mockRedisClient.SET).not.toHaveBeenCalled();
    });
  });

  describe('isTokenDeactivate', () => {
    it('should return false for valid active token', async () => {
      const token = 'valid-jwt-token';
      mockRedisClient.get.mockResolvedValue(null);
      mockJwtService.verify.mockReturnValue(true);

      const result = await service.isTokenDeactivate(token);

      expect(result).toBe(false);
      expect(mockRedisClient.get).toHaveBeenCalledWith(token);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should return true for deactivated token', async () => {
      const token = 'deactivated-token';
      mockRedisClient.get.mockResolvedValue('deactivated');
      mockJwtService.verify.mockReturnValue(true);

      const result = await service.isTokenDeactivate(token);

      expect(result).toBe(true);
    });

    it('should return true for invalid token', async () => {
      const token = 'invalid-token';
      mockRedisClient.get.mockResolvedValue(null);
      mockJwtService.verify.mockReturnValue(false);

      const result = await service.isTokenDeactivate(token);

      expect(result).toBe(true);
    });

    it('should return true for null token', async () => {
      const result = await service.isTokenDeactivate(null);

      expect(result).toBe(true);
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('should return true for undefined token', async () => {
      const result = await service.isTokenDeactivate(undefined);

      expect(result).toBe(true);
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('should return true for non-string token', async () => {
      const result = await service.isTokenDeactivate(123 as any);

      expect(result).toBe(true);
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const token = 'valid-token';
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.isTokenDeactivate(token);

      expect(result).toBe(true);
    });
  });
});
