import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateUserDto,
  CreateUserResponse,
  DeleteUserResponse,
  GetUserListResponse,
  GetUserResponse,
  UpdateUserDto,
  UpdateUserResponse,
} from './dto/user.dto';
import { GetListRequest } from '../../models/pagination/pagination.model';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    description: 'create user',
  })
  @ApiResponse({
    status: 200,
    type: CreateUserResponse,
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({
    description: 'get list user',
  })
  @ApiResponse({
    status: 200,
    type: GetUserListResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query() getListRequest: GetListRequest,
  ): Promise<GetUserListResponse> {
    return this.usersService.findAll(getListRequest);
  }

  @ApiOperation({
    description: 'get user by id',
  })
  @ApiResponse({
    status: 200,
    type: GetUserResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<GetUserResponse> {
    return this.usersService.getDetails(id);
  }

  @ApiOperation({
    description: 'update user',
  })
  @ApiResponse({
    status: 200,
    type: UpdateUserResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({
    description: 'delete user',
  })
  @ApiResponse({
    status: 200,
    type: DeleteUserResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
