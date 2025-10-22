import {
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { MessageCode } from '../../../common/constants/message-code.constant';

export class UserToken {
  public userId: string;

  public type: string;

  public key: string;

  public rawToken: string;

  public createTime: Date;

  public expireTime: Date;

  constructor(fields?: Partial<UserToken>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }

}