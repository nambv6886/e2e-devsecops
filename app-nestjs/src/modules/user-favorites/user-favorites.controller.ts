import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserFavoritesService } from './user-favorites.service';
import { CreateUserFavoriteDto } from './dto/create-user-favorite.dto';
import {
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  GetFavoritesResponse,
  CheckFavoriteResponse,
} from './dto/favorite-responses.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../users/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserFavoritesController {
  private readonly logger = new Logger(UserFavoritesController.name);

  constructor(private readonly userFavoritesService: UserFavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a store to favorites',
    description: "Add a store to the authenticated user's favorites list",
  })
  @ApiResponse({
    status: 201,
    description: 'Store added to favorites successfully',
    type: AddFavoriteResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Store already in favorites',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async addFavorite(
    @Body() createDto: CreateUserFavoriteDto,
    @CurrentUser() user: UserEntity,
  ): Promise<AddFavoriteResponse> {
    const userId = user.id;
    this.logger.log(`User ${userId} adding store to favorites`);
    return this.userFavoritesService.addFavorite(userId, createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all favorite stores',
    description:
      'Get all favorite stores for the authenticated user with pagination',
  })
  @ApiQuery({ name: 'pageIndex', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Favorites retrieved successfully',
    type: GetFavoritesResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserFavorites(
    @CurrentUser() user: UserEntity,
    @Query('pageIndex') pageIndex?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<GetFavoritesResponse> {
    const userId = user.id;
    this.logger.log(`User ${userId} retrieving favorites`);
    return this.userFavoritesService.getUserFavorites(
      userId,
      pageIndex ? +pageIndex : 1,
      pageSize ? +pageSize : 10,
    );
  }

  @Get('check/:storeId')
  @ApiOperation({
    summary: 'Check if a store is in favorites',
    description:
      "Check if a specific store is in the authenticated user's favorites",
  })
  @ApiParam({
    name: 'storeId',
    description: 'Store ID to check',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Check completed successfully',
    type: CheckFavoriteResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async checkFavorite(
    @Param('storeId') storeId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<CheckFavoriteResponse> {
    const userId = user.id;
    this.logger.log(`User ${userId} checking favorite for store ${storeId}`);
    return this.userFavoritesService.checkFavorite(userId, storeId);
  }

  @Delete(':storeId')
  @ApiOperation({
    summary: 'Remove a store from favorites',
    description: "Remove a store from the authenticated user's favorites list",
  })
  @ApiParam({
    name: 'storeId',
    description: 'Store ID to remove from favorites',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Store removed from favorites successfully',
    type: RemoveFavoriteResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Store not in favorites',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async removeFavorite(
    @Param('storeId') storeId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<RemoveFavoriteResponse> {
    const userId = user.id;
    this.logger.log(`User ${userId} removing store ${storeId} from favorites`);
    return this.userFavoritesService.removeFavorite(userId, storeId);
  }
}
