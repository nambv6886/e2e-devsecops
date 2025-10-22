import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { BloomFilterService } from '../shared/bloom-filter.service';
import { ResponseStatus } from '../../models/interfaces/response.status.model';
import { MessageCode } from '../../common/constants/message-code.constant';
import { UserRole } from '../../common/constants/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { GetListRequest } from '../../models/pagination/pagination.model';
import { HashUtils } from '../../common/utils/hash.utils';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<UserEntity>;
  let bloomFilterService: BloomFilterService;

  const mockRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockBloomFilterService = {
    addEmails: jest.fn(),
    addEmail: jest.fn(),
    mightExist: jest.fn(),
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
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
        {
          provide: BloomFilterService,
          useValue: mockBloomFilterService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    bloomFilterService = module.get<BloomFilterService>(BloomFilterService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should populate bloom filter with existing emails', async () => {
      const users = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
      ];
      mockRepository.find.mockResolvedValue(users);
      mockBloomFilterService.addEmails.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        select: ['email'],
      });
      expect(mockBloomFilterService.addEmails).toHaveBeenCalledWith([
        'user1@example.com',
        'user2@example.com',
      ]);
    });

    it('should handle empty user list', async () => {
      mockRepository.find.mockResolvedValue([]);

      await service.onModuleInit();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(mockBloomFilterService.addEmails).not.toHaveBeenCalled();
    });

    it('should not throw error when bloom filter population fails', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      mockBloomFilterService.mightExist.mockResolvedValue(false);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      mockBloomFilterService.addEmail.mockResolvedValue(undefined);

      const result = await service.create(createUserDto);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
      expect(mockBloomFilterService.mightExist).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockBloomFilterService.addEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
    });

    it('should return error when email already exists', async () => {
      mockBloomFilterService.mightExist.mockResolvedValue(true);
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(
        MessageCode.EMAIL_IS_EXISTED,
      );
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        email: createUserDto.email,
        isActive: true,
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create user when bloom filter indicates might exist but user does not exist', async () => {
      mockBloomFilterService.mightExist.mockResolvedValue(true);
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      mockBloomFilterService.addEmail.mockResolvedValue(undefined);

      const result = await service.create(createUserDto);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
    });

    it('should handle database errors gracefully', async () => {
      mockBloomFilterService.mightExist.mockResolvedValue(false);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await service.create(createUserDto);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(MessageCode.FAIL);
    });
  });

  describe('findAll', () => {
    const getListRequest: GetListRequest = {
      pageIndex: 0,
      pageSize: 10,
      orderBy: 'createdAt',
    };

    it('should return paginated list of users', async () => {
      const users = [mockUser];
      mockRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll(getListRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
      expect(result.users).toHaveLength(1);
      expect(result.totalItemCount).toBe(1);
      expect(result.pageIndex).toBe(0);
      expect(result.pageSize).toBe(10);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 10,
      });
    });

    it('should return empty list when no users found', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(getListRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.users).toHaveLength(0);
      expect(result.totalItemCount).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockRepository.findAndCount.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.findAll(getListRequest);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(MessageCode.FAIL);
      expect(result.users).toEqual([]);
      expect(result.totalItemCount).toBe(0);
    });
  });

  describe('getDetails', () => {
    it('should return user details when user exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getDetails(mockUser.id);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
        isActive: true,
      });
    });

    it('should return not found when user does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.getDetails('nonexistent-id');

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(MessageCode.NOT_FOUND);
      expect(result.user).toBeUndefined();
    });
  });

  describe('findOneById', () => {
    it('should return user when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOneById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
        isActive: true,
      });
    });

    it('should return null when user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOneById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    it('should return user when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
        isActive: true,
      });
    });

    it('should return null when user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOneByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      password: 'newPassword123',
    };

    it('should update user password successfully', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
        isActive: true,
      });
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should return not found when user does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.update('nonexistent-id', updateUserDto);

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(MessageCode.NOT_FOUND);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle update without password', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(mockUser.id, {});

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      const userToDelete = { ...mockUser };
      mockRepository.findOneBy.mockResolvedValue(userToDelete);
      mockRepository.save.mockResolvedValue({
        ...userToDelete,
        isActive: false,
      });

      const result = await service.remove(mockUser.id);

      expect(result.responseMessage.status).toBe(ResponseStatus.Success);
      expect(result.responseMessage.messageCode).toBe(MessageCode.SUCCESS);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
        isActive: true,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(userToDelete.isActive).toBe(false);
    });

    it('should return not found when user does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.remove('nonexistent-id');

      expect(result.responseMessage.status).toBe(ResponseStatus.Fail);
      expect(result.responseMessage.messageCode).toBe(MessageCode.NOT_FOUND);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
