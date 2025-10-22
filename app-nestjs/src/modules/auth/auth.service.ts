import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  JwtPayload,
  LoginRequest,
  LoginResponse,
  PasswordResetTokenPayload,
  ResetPasswordRequest,
} from './dto/auth.dto';
import { ResponseMessage } from '../../models/interfaces/response.message.model';
import { ResponseStatus } from '../../models/interfaces/response.status.model';
import { UserEntity } from '../users/entities/user.entity';
import { MessageCode } from '../../common/constants/message-code.constant';
import { REDIS_KEY_FORGOT_PASSWORD } from '../../common/constants/common';
import { CommonUtils } from '../../common/utils/common.utils';
import { HashUtils } from '../../common/utils/hash.utils';
import { UserTokenService } from '../user-token/user-token.service';
import { EmailService } from '../shared/email.service';
import { UserTokenEntity } from '../user-token/entities/user-token.entity';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../shared/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly userTokenService: UserTokenService,
    private readonly emailService: EmailService,
  ) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
      const user = await this.usersService.findOneByEmail(loginRequest.email);
      if (!user) {
        return new LoginResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.NotFound,
            messageCode: MessageCode.USER_NOT_FOUND,
          }),
        });
      }

      const passwordIsMatched =
        user.password ===
        HashUtils.hashPassword(loginRequest.password, user.salt);
      if (!passwordIsMatched) {
        // Login fail with invalid password
        return new LoginResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.INVALID_PASSWORD,
          }),
        });
      }

      const payload: JwtPayload = {
        email: user.email,
        userId: user.id,
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME'),
      });
      const refreshAccessToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME'),
      });

      return new LoginResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        accessToken,
        refreshAccessToken,
      });
    } catch (error) {
      Logger.error(error);
      return new LoginResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  async forgotPassword(
    forgotPasswordRequest: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    try {
      const user = await this.usersService.findOneByEmail(
        forgotPasswordRequest.email,
      );
      if (!user) {
        return new ForgotPasswordResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.FAIL,
          }),
        });
      }

      const keyCacheRequest = `${forgotPasswordRequest.email}`;
      const result = await this.redisService.hGet(
        REDIS_KEY_FORGOT_PASSWORD,
        keyCacheRequest,
      );
      let isWaiting: boolean = false;
      let diffTime: number = 0;
      const FORGOT_PASSWORD_WAIT_TIME_IN_SECONDS =
        +this.configService.get('FORGOT_PASSWORD_WAIT_TIME_IN_SECONDS') || 60;

      if (result !== null && result !== undefined) {
        diffTime = CommonUtils.diffTotalSeconds(
          new Date(Date.now()),
          new Date(+result),
        );
        isWaiting = diffTime < FORGOT_PASSWORD_WAIT_TIME_IN_SECONDS;
      }

      if (isWaiting) {
        return new ForgotPasswordResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.ACCOUNT_FORGOT_PASSWORD_NEED_TO_WAIT,
            data: FORGOT_PASSWORD_WAIT_TIME_IN_SECONDS - diffTime,
          }),
        });
      }

      await this.redisService.hSet(
        REDIS_KEY_FORGOT_PASSWORD,
        keyCacheRequest,
        Date.now().toString(),
      );
      const payload = new PasswordResetTokenPayload({
        userId: user.id,
        expire:
          Date.now() +
          +this.configService.get('PASSWORD_RESET_TOKEN_LIFE_TIME_IN_SECONDS') *
            1000,
      });

      // Clean all old token before create a new token
      await this.userTokenService.deleteResetPasswordToken(user.id);
      const passwordResetToken = HashUtils.encryptCode(payload);

      await this.userTokenService.saveUserToken(
        user.id,
        passwordResetToken,
        (+payload.expire / (1000 * 3600 * 24)).toString(),
      );

      const baseURL = this.configService.get('BASE_URL');
      const verifyUrl = `${baseURL}/auth/reset-password?token=${passwordResetToken}`;

      this.emailService.sendMailResetPassword(user.email, verifyUrl);

      return new ForgotPasswordResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
          data: {
            token: passwordResetToken,
          },
        }),
      });
    } catch (error) {
      Logger.error(error);
      return new ForgotPasswordResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResponseMessage> {
    try {
      const decrypted: PasswordResetTokenPayload = HashUtils.decryptCode(
        request.token,
      );

      if (CommonUtils.isNullOrUndefined(decrypted)) {
        return new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.DECRYPT_CODE_ERROR_MESSAGE,
        });
      }

      if (decrypted.expire < Date.now()) {
        return new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.ACCOUNT_CODE_EXPIRED_LINK_MESSAGE,
        });
      }

      const userId = decrypted.userId;

      const userToken: UserTokenEntity =
        await this.userTokenService.findUserResetPasswordToken(
          userId,
          request.token,
        );

      if (!userToken) {
        return new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode:
            MessageCode.ACCOUNT_RESET_PASSWORD_INVALID_RESET_TOKEN_MESSAGE,
        });
      }

      const user: UserEntity = await this.usersService.findOneById(userId);
      const isMatchedPassword =
        HashUtils.hashPassword(request.password, user.salt) === user.password;

      if (isMatchedPassword) {
        return new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode:
            MessageCode.ACCOUNT_RESET_PASSWORD_INVALID_NEW_PASSWORD_MESSAGE,
        });
      }

      const salt = HashUtils.genRandomString(20);
      const newPassword = HashUtils.hashPassword(request.password, salt);

      user.password = newPassword;
      user.salt = salt;
      // Set passwordChangedAt to invalidate all existing JWT tokens
      user.passwordChangedAt = new Date();
      await this.usersService.update(user.id, user);

      // Clean token after reset password is success
      await this.userTokenService.deleteResetPasswordToken(userId);

      return new ResponseMessage({
        status: ResponseStatus.Success,
        messageCode: MessageCode.SUCCESS,
      });
    } catch (error) {
      Logger.error(error.message);
      return new ResponseMessage({
        status: ResponseStatus.Fail,
        messageCode: MessageCode.FAIL,
      });
    }
  }

  public async deactiveAccessToken(token: string): Promise<void> {
    if (!token || typeof token !== 'string') {
      return;
    }
    token = token.substring(7).trim();
    await this.redisService.set(token, 'deactivated', 3600);
  }

  public async isTokenDeactivate(token: string): Promise<boolean> {
    try {
      if (!token || typeof token !== 'string') {
        return true;
      }

      const tokenInCache = await this.redisService.get(token);
      const isVerify = this.jwtService.verify(token);
      if (tokenInCache || !isVerify) {
        return true;
      }
      return false;
    } catch (error) {
      Logger.error(`[AuthService]: ${JSON.stringify(error.message)}`);
      return true;
    }
  }
}
