import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { SearchStoresDto } from './dto/search-stores.dto';
import { SearchFromUserLocationDto } from './dto/search-from-user-location.dto';
import { StoreResponseDto } from './dto/store-response.dto';
import { SearchStoresResponseDto } from './dto/search-stores-response.dto';
import {
  CreateStoreResponse,
  GetStoreResponse,
  UpdateStoreResponse,
  DeleteStoreResponse,
  GetStoreListResponse,
  SearchStoresResponse,
} from './dto/store-responses.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../users/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for stores within a radius',
    description:
      'Search for stores within a specified radius from a location. ' +
      'Supports filtering by store name and type. Results include distance from search center.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stores found successfully',
    type: SearchStoresResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchStores(
    @Body() searchDto: SearchStoresDto,
  ): Promise<SearchStoresResponse> {
    return this.storesService.searchStores(searchDto);
  }

  @Post('search/nearby')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for stores near your current location',
    description:
      'Search for stores within a specified radius from your saved current location. ' +
      'Requires authentication. The location is automatically retrieved from your profile. ' +
      'Make sure to update your location first using the user-current-location endpoints.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stores found successfully',
    type: SearchStoresResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'User location not found. Update your location first.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchNearby(
    @Request() req,
    @Body() searchDto: SearchFromUserLocationDto,
    @CurrentUser() user: UserEntity,
  ): Promise<SearchStoresResponse> {
    return this.storesService.searchFromUserLocation(user.id, searchDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({
    status: 201,
    description: 'Store created successfully',
    type: CreateStoreResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createStoreDto: CreateStoreDto,
  ): Promise<CreateStoreResponse> {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores with pagination' })
  @ApiQuery({ name: 'pageIndex', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Stores retrieved successfully',
    type: GetStoreListResponse,
  })
  async findAll(
    @Query('pageIndex') pageIndex?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<GetStoreListResponse> {
    return this.storesService.findAll(
      pageIndex ? +pageIndex : 1,
      pageSize ? +pageSize : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiResponse({
    status: 200,
    description: 'Store found',
    type: GetStoreResponse,
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findOne(@Param('id') id: string): Promise<GetStoreResponse> {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a store' })
  @ApiResponse({
    status: 200,
    description: 'Store updated successfully',
    type: UpdateStoreResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<UpdateStoreResponse> {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a store (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Store deleted successfully',
    type: DeleteStoreResponse,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async remove(@Param('id') id: string): Promise<DeleteStoreResponse> {
    return this.storesService.remove(id);
  }
}
