import { Injectable, Logger } from '@nestjs/common';

// tslint:disable-next-line: no-var-requires
const ms = require('ms');

import { UserTokenEntity } from './entities/user-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenType } from '../../common/constants/common';

@Injectable()
export class UserTokenService {
  constructor(
    @InjectRepository(UserTokenEntity) private readonly userTokenRepository: Repository<UserTokenEntity>,
  ) {
  }

  public async saveUserToken(userId: string, rawToken: string, expiredIn: string): Promise<UserTokenEntity> {
    try {
      const expireTime = new Date(Date.now() + ms(expiredIn));

      const userToken = this.userTokenRepository.create({
        userId: userId,
        type: TokenType.RESET_PASSWORD_TOKEN,
        rawToken: rawToken,
        expireTime: expireTime,
      });
      await this.userTokenRepository.save(userToken);
      return userToken;
    }
    catch (error) {
      Logger.error(`Error when saveUserToken: ${error.message}`);
    }
  }

  public async findUserResetPasswordToken(userId: string, resetPasswordToken: string): Promise<UserTokenEntity> {
    try {
      return this.userTokenRepository.findOneBy({
        userId, 
        type: TokenType.RESET_PASSWORD_TOKEN,
        rawToken: resetPasswordToken,
        isActive: true,
      });
    }
    catch (error) {
      Logger.error(`Error when findUserResetPasswordToken: ${error.message}`);
    }
  }

  public async deleteResetPasswordToken(userId: string){
    try {
      return this.userTokenRepository.update({
        userId,
        type: TokenType.RESET_PASSWORD_TOKEN,
        isActive: true,
      }, {
        isActive: false,
      });
    } catch (error) {
      Logger.error(`Error when deleteResetPasswordToken: ${error.message}`);
    }
  }
}