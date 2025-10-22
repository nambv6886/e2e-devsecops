import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { MessageCode } from '../../../common/constants/message-code.constant';
import { ApiProperty } from '@nestjs/swagger';
import { EMAIL_REGEX } from '../../../common/constants/common';
import { IResponse } from '../../../models/interfaces/i-response';
import { ResponseMessage } from '../../../models/interfaces/response.message.model';
import { IPagedResponse } from '../../../models/interfaces/i-paged-response';
import { UserEntity } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: MessageCode.EMAIL_IS_REQUIRED })
  @Matches(EMAIL_REGEX, { message: MessageCode.EMAIL_IS_INVALID })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: MessageCode.PASSWORD_IS_REQUIRED })
  @MinLength(10, { message: MessageCode.PASSWORD_IS_INVALID_MIN_LENGTH })
  password: string;
}

export class CreateUserResponse implements IResponse {
  @ApiProperty()
  public responseMessage: ResponseMessage;
  @ApiProperty()
  public referenceUserId: number;
  constructor(fields?: Partial<CreateUserResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class UserInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;
  constructor(user?: UserEntity) {
    this.id = user?.id;
    this.email = user?.email;
    this.role = user?.role;
  }
}

export class GetUserResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;
  @ApiProperty()
  user: UserInfo;

  constructor(fields?: Partial<GetUserResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class UpdateUserResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;
  constructor(fields?: Partial<GetUserResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class DeleteUserResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;
  constructor(fields?: Partial<GetUserResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class GetUserListResponse implements IPagedResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;
  @ApiProperty()
  totalItemCount: number;
  @ApiProperty()
  pageIndex: number;
  @ApiProperty()
  pageSize: number;
  @ApiProperty()
  users: UserInfo[];

  constructor(fields?: Partial<GetUserListResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}
