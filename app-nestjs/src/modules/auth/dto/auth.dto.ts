import { IResponse } from '../../../models/interfaces/i-response';
import { ResponseMessage } from '../../../models/interfaces/response.message.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { MessageCode } from '../../../common/constants/message-code.constant';
import { EMAIL_REGEX } from '../../../common/constants/common';
import { Matches } from 'class-validator';

export class LoginRequest {
  @ApiProperty()
  @IsNotEmpty({ message: MessageCode.EMAIL_IS_REQUIRED })
  @Matches(EMAIL_REGEX, { message: MessageCode.EMAIL_IS_INVALID })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: MessageCode.PASSWORD_IS_REQUIRED })
  password: string;
}

export class LoginResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshAccessToken: string;

  constructor(fields?: Partial<LoginResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class ForgotPasswordRequest {
  @ApiProperty()
  @IsNotEmpty({ message: MessageCode.EMAIL_IS_REQUIRED })
  @Matches(EMAIL_REGEX, { message: MessageCode.EMAIL_IS_INVALID })
  email: string;
}

export class ForgotPasswordResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;
  constructor(fields?: Partial<LoginResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class PasswordResetTokenPayload {
  public userId: string;
  public expire: number;

  constructor(fields?: Partial<PasswordResetTokenPayload>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class ResetPasswordRequest {
  @ApiProperty()
  @IsNotEmpty({ message: MessageCode.ACCOUNT_TOKEN_REQUIRED })
  public token: string;

  @ApiProperty()
  @IsNotEmpty({ message: MessageCode.ACCOUNT_PASSWORD_REQUIRED })
  @MinLength(10, { message: MessageCode.REGISTER_INVALID_PASSWORD_LENGTH })
  public password: string;

  constructor(fields?: Partial<ResetPasswordRequest>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class RegisterRequest {
  @IsNotEmpty({ message: MessageCode.EMAIL_IS_REQUIRED })
  // @IsEmail({}, { message: Resource.REGISTER_EMAIL_INVALID })
  @Matches(EMAIL_REGEX, {
    message: MessageCode.EMAIL_IS_INVALID,
    always: true,
  })
  @ApiProperty()
  public email: string;

  @IsNotEmpty({ message: MessageCode.PASSWORD_IS_REQUIRED })
  @MinLength(10, { message: MessageCode.PASSWORD_IS_INVALID_MIN_LENGTH })
  @ApiProperty()
  public password: string;

  constructor(fields?: Partial<RegisterRequest>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}
