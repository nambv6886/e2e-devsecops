import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { ResponseMessage } from '../../models/interfaces/response.message.model';
import { ResponseStatus } from '../../models/interfaces/response.status.model';

import {
  CreateUserDto,
  CreateUserResponse,
  GetUserListResponse,
  GetUserResponse,
  UpdateUserDto,
  UserInfo,
  UpdateUserResponse,
} from './dto/user.dto';
import { GetListRequest } from '../../models/pagination/pagination.model';
import { UserEntity } from './entities/user.entity';
import { CommonUtils } from '../../common/utils/common.utils';
import { MessageCode } from '../../common/constants/message-code.constant';
import { HashUtils } from '../../common/utils/hash.utils';
import { UserRole } from '../../common/constants/common';
import { BloomFilterService } from '../shared/bloom-filter.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly bloomFilterService: BloomFilterService,
  ) {}

  async onModuleInit() {
    // Populate bloom filter with existing emails on startup
    await this.populateBloomFilter();
  }

  /**
   * Populate bloom filter with all existing user emails
   * This is called on application startup to ensure the bloom filter is in sync
   */
  private async populateBloomFilter(): Promise<void> {
    try {
      this.logger.log(
        'Starting to populate bloom filter with existing emails...',
      );

      // Get all active user emails from database
      const users = await this.usersRepository.find({
        where: { isActive: true },
        select: ['email'],
      });

      if (users.length > 0) {
        const emails = users.map((user) => user.email);
        await this.bloomFilterService.addEmails(emails);
        this.logger.log(
          `Populated bloom filter with ${emails.length} existing emails`,
        );
      } else {
        this.logger.log('No existing emails to populate');
      }
    } catch (error) {
      this.logger.error('Error populating bloom filter', error);
      // Don't throw error to prevent app startup failure
    }
  }

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const mightExist = await this.bloomFilterService.mightExist(
        createUserDto.email,
      );

      if (mightExist) {
        this.logger.debug(
          `Bloom filter indicates email might exist: ${createUserDto.email}`,
        );
        const user = await this.usersRepository.findOneBy({
          email: createUserDto.email,
          isActive: true,
        });

        if (CommonUtils.isNotNullOrUndefined(user)) {
          return new CreateUserResponse({
            responseMessage: new ResponseMessage({
              status: ResponseStatus.Fail,
              messageCode: MessageCode.EMAIL_IS_EXISTED,
            }),
          });
        }
      } else {
        this.logger.debug(
          `Bloom filter confirms email doesn't exist: ${createUserDto.email}`,
        );
      }

      const salt = HashUtils.genRandomString(20);
      const hashedPassword = HashUtils.hashPassword(
        createUserDto.password,
        salt,
      );
      const newUser = this.usersRepository.create({
        email: createUserDto.email,
        password: hashedPassword,
        salt,
        role: UserRole.USER,
      });
      await this.usersRepository.save(newUser);

      await this.bloomFilterService.addEmail(createUserDto.email);
      this.logger.log(
        `User created and added to bloom filter: ${createUserDto.email}`,
      );

      return new CreateUserResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
      });
    } catch (error) {
      this.logger.error('Error creating user', error);
      return new CreateUserResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  async findAll(getListRequest: GetListRequest): Promise<GetUserListResponse> {
    try {
      const [users, count] = await this.usersRepository.findAndCount({
        where: {
          isActive: true,
        },
        skip: getListRequest.pageIndex,
        take: getListRequest.pageSize,
      });

      const userList = users.map((user) => {
        return new UserInfo(user);
      });

      return new GetUserListResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        users: userList,
        totalItemCount: count,
        pageIndex: getListRequest.pageIndex,
        pageSize: getListRequest.pageSize,
      });
    } catch (error) {
      Logger.error(error);
      return new GetUserListResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
        users: [],
        totalItemCount: 0,
      });
    }
  }

  async getDetails(id: string): Promise<GetUserResponse> {
    const user = await this.usersRepository.findOneBy({ id, isActive: true });
    if (CommonUtils.isNullOrUndefined(user)) {
      return new GetUserResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.NOT_FOUND,
        }),
      });
    }

    const userInfo = new UserInfo(user);
    return new GetUserResponse({
      responseMessage: new ResponseMessage({
        status: ResponseStatus.Success,
        messageCode: MessageCode.SUCCESS,
      }),
      user: userInfo,
    });
  }

  async findOneById(id: string): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ id, isActive: true });
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    return await this.usersRepository.findOneBy({ email, isActive: true });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    const user = await this.usersRepository.findOneBy({ id, isActive: true });
    if (CommonUtils.isNullOrUndefined(user)) {
      return new UpdateUserResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.NOT_FOUND,
        }),
      });
    }

    const { password } = updateUserDto;
    const hashedPassword = password
      ? HashUtils.hashPassword(password, user.salt)
      : undefined;
    user.password = hashedPassword;
    const userUpdated = await this.usersRepository.update(
      { id, isActive: true },
      user,
    );
    return new UpdateUserResponse({
      responseMessage: new ResponseMessage({
        status: ResponseStatus.Success,
        messageCode: MessageCode.SUCCESS,
      }),
    });
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({ id, isActive: true });
    if (CommonUtils.isNullOrUndefined(user)) {
      return new UpdateUserResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.NOT_FOUND,
        }),
      });
    }
    user.isActive = false;
    await this.usersRepository.save(user);
    return new UpdateUserResponse({
      responseMessage: new ResponseMessage({
        status: ResponseStatus.Success,
        messageCode: MessageCode.SUCCESS,
      }),
    });
  }
}
