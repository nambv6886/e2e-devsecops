import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { SearchStoresDto } from './dto/search-stores.dto';
import { SearchFromUserLocationDto } from './dto/search-from-user-location.dto';
import { StoreEntity } from './entities/store.entity';
import { StoreResponseDto } from './dto/store-response.dto';
import { SearchStoresResponseDto } from './dto/search-stores-response.dto';
import { RedisService } from '../shared/redis.service';
import { UserCurrentLocationService } from '../user-current-location/user-current-location.service';
import { ResponseMessage } from '../../models/interfaces/response.message.model';
import { ResponseStatus } from '../../models/interfaces/response.status.model';
import { MessageCode } from '../../common/constants/message-code.constant';
import {
  CreateStoreResponse,
  GetStoreResponse,
  UpdateStoreResponse,
  DeleteStoreResponse,
  GetStoreListResponse,
  SearchStoresResponse,
} from './dto/store-responses.dto';
import { StoreInfo } from './dto/store-info.dto';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);
  private readonly CACHE_TTL = 5 * 60; // 5 minutes in seconds
  private readonly CACHE_PREFIX = 'stores:search:';

  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    private readonly redisService: RedisService,
    private readonly userLocationService: UserCurrentLocationService,
  ) {}

  /**
   * Create a new store
   */
  async create(createStoreDto: CreateStoreDto): Promise<CreateStoreResponse> {
    try {
      const { latitude, longitude, ...restDto } = createStoreDto;

      // Create store with location using query builder
      const result = await this.storeRepository
        .createQueryBuilder()
        .insert()
        .into(StoreEntity)
        .values({
          ...restDto,
          latitude,
          longitude,
          location: () =>
            `ST_GeomFromText('POINT(${latitude} ${longitude})', 4326)`,
        })
        .execute();

      // Fetch the newly created store
      const store = await this.storeRepository.findOne({
        where: { id: result.identifiers[0].id },
        select: [
          'id',
          'name',
          'type',
          'address',
          'latitude',
          'longitude',
          'rating',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      });

      this.logger.log(`Store created with ID: ${store.id}`);
      return new CreateStoreResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        store: new StoreInfo(store),
      });
    } catch (error) {
      this.logger.error('Error creating store:', error);
      return new CreateStoreResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  /**
   * Search for stores from the authenticated user's current location
   */
  async searchFromUserLocation(
    userId: string,
    searchDto: SearchFromUserLocationDto,
  ): Promise<SearchStoresResponse> {
    try {
      // Get user's current location
      const userLocation = await this.userLocationService.getLocation(userId);

      // Construct full search DTO with user's location
      const fullSearchDto: SearchStoresDto = {
        latitude: userLocation.location.latitude,
        longitude: userLocation.location.longitude,
        radius: searchDto.radius,
        name: searchDto.name,
        type: searchDto.type,
        pageIndex: searchDto.pageIndex,
        pageSize: searchDto.pageSize,
      };

      // Use the regular search method
      return this.searchStores(fullSearchDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new SearchStoresResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.NOT_FOUND,
          }),
          stores: [],
          totalItemCount: 0,
          pageIndex: searchDto.pageIndex || 1,
          pageSize: searchDto.pageSize || 10,
          centerLatitude: 0,
          centerLongitude: 0,
          radiusKm: searchDto.radius || 5,
        });
      }
      this.logger.error(
        `Error searching stores from user location ${userId}:`,
        error,
      );
      return new SearchStoresResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
        stores: [],
        totalItemCount: 0,
        pageIndex: searchDto.pageIndex || 1,
        pageSize: searchDto.pageSize || 10,
        centerLatitude: 0,
        centerLongitude: 0,
        radiusKm: searchDto.radius || 5,
      });
    }
  }

  /**
   * Search for stores within a radius with optional filters
   * Uses geospatial queries and caching
   */
  async searchStores(
    searchDto: SearchStoresDto,
  ): Promise<SearchStoresResponse> {
    const { latitude, longitude, radius, name, type, pageIndex, pageSize } =
      searchDto;

    // Generate cache key based on search parameters
    const cacheKey = this.generateCacheKey(searchDto);

    try {
      // Try to get from cache first
      const cachedResult = await this.getCachedSearchResult(cacheKey);
      if (cachedResult) {
        this.logger.debug('Cache hit for search query');
        return cachedResult;
      }

      this.logger.debug('Cache miss for search query, querying database');

      // Build the base query using QueryBuilder
      // ST_Distance_Sphere calculates distance in meters between two points
      const radiusInMeters = radius * 1000;
      const skip = (pageIndex - 1) * pageSize;

      let query = this.storeRepository
        .createQueryBuilder('store')
        .select([
          'store.id',
          'store.name',
          'store.type',
          'store.address',
          'store.latitude',
          'store.longitude',
          'store.rating',
          'store.isActive',
          'store.createdAt',
          'store.updatedAt',
        ])
        .addSelect(
          `ST_Distance_Sphere(
            store.location,
            ST_GeomFromText('POINT(${latitude} ${longitude})', 4326)
          )`,
          'distance',
        )
        .where(
          `ST_Distance_Sphere(
            store.location,
            ST_GeomFromText('POINT(${latitude} ${longitude})', 4326)
          ) <= :radius`,
          { radius: radiusInMeters },
        )
        .andWhere('store.isActive = :isActive', { isActive: true });

      // Add optional filters
      if (name) {
        query = query.andWhere('store.name LIKE :name', {
          name: `%${name}%`,
        });
      }

      if (type) {
        query = query.andWhere('store.type = :type', { type });
      }

      // Get total count
      const totalCount = await query.getCount();

      // Apply pagination and ordering
      const stores = await query
        .orderBy('distance', 'ASC')
        .skip(skip)
        .take(pageSize)
        .getRawMany();

      // Map results to DTOs
      const storeInfos: StoreInfo[] = stores.map((store) => {
        const storeEntity = {
          id: store.store_id,
          name: store.store_name,
          type: store.store_type,
          address: store.store_address,
          latitude: store.store_latitude,
          longitude: store.store_longitude,
          rating: store.store_rating,
          isActive: store.store_isActive,
          createdAt: store.store_createdAt,
          updatedAt: store.store_updatedAt,
        } as StoreEntity;

        const storeInfo = new StoreInfo(storeEntity);
        storeInfo.distance = Math.round(parseFloat(store.distance));
        return storeInfo;
      });

      const response: SearchStoresResponse = new SearchStoresResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        stores: storeInfos,
        totalItemCount: totalCount,
        pageIndex,
        pageSize,
        centerLatitude: latitude,
        centerLongitude: longitude,
        radiusKm: radius,
      });

      // Cache the result
      await this.cacheSearchResult(cacheKey, response);

      this.logger.log(
        `Found ${totalCount} stores within ${radius}km of (${latitude}, ${longitude})`,
      );

      return response;
    } catch (error) {
      this.logger.error('Error searching stores:', error);
      return new SearchStoresResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
        stores: [],
        totalItemCount: 0,
        pageIndex: pageIndex,
        pageSize: pageSize,
        centerLatitude: latitude,
        centerLongitude: longitude,
        radiusKm: radius,
      });
    }
  }

  /**
   * Find all stores with pagination
   */
  async findAll(
    pageIndex: number = 1,
    pageSize: number = 10,
  ): Promise<GetStoreListResponse> {
    try {
      const skip = (pageIndex - 1) * pageSize;

      const [stores, totalCount] = await this.storeRepository.findAndCount({
        where: { isActive: true },
        select: [
          'id',
          'name',
          'type',
          'address',
          'latitude',
          'longitude',
          'rating',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
        skip,
        take: pageSize,
        order: { createdAt: 'DESC' },
      });

      return new GetStoreListResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        stores: stores.map((store) => new StoreInfo(store)),
        totalItemCount: totalCount,
        pageIndex,
        pageSize,
      });
    } catch (error) {
      this.logger.error('Error finding all stores:', error);
      return new GetStoreListResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
        stores: [],
        totalItemCount: 0,
        pageIndex,
        pageSize,
      });
    }
  }

  /**
   * Find a single store by ID
   */
  async findOne(id: string): Promise<GetStoreResponse> {
    try {
      const store = await this.storeRepository.findOne({
        where: { id },
        select: [
          'id',
          'name',
          'type',
          'address',
          'latitude',
          'longitude',
          'rating',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      });

      if (!store) {
        return new GetStoreResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.NOT_FOUND,
          }),
        });
      }

      return new GetStoreResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        store: new StoreInfo(store),
      });
    } catch (error) {
      this.logger.error(`Error finding store ${id}:`, error);
      return new GetStoreResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  /**
   * Update a store
   */
  async update(
    id: string,
    updateStoreDto: UpdateStoreDto,
  ): Promise<UpdateStoreResponse> {
    try {
      const store = await this.storeRepository.findOne({
        where: { id },
        select: ['id'],
      });

      if (!store) {
        return new UpdateStoreResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.NOT_FOUND,
          }),
        });
      }

      const { latitude, longitude, ...restDto } = updateStoreDto;

      // If location is being updated, use query builder
      if (latitude !== undefined && longitude !== undefined) {
        await this.storeRepository
          .createQueryBuilder()
          .update(StoreEntity)
          .set({
            ...restDto,
            latitude,
            longitude,
            location: () =>
              `ST_GeomFromText('POINT(${latitude} ${longitude})', 4326)`,
          })
          .where('id = :id', { id })
          .execute();
      } else {
        // Otherwise use normal update
        await this.storeRepository.update(id, restDto);
      }

      // Fetch the updated store
      const updatedStore = await this.storeRepository.findOne({
        where: { id },
        select: [
          'id',
          'name',
          'type',
          'address',
          'latitude',
          'longitude',
          'rating',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      });

      this.logger.log(`Store ${id} updated successfully`);
      return new UpdateStoreResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        store: new StoreInfo(updatedStore),
      });
    } catch (error) {
      this.logger.error(`Error updating store ${id}:`, error);
      return new UpdateStoreResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  /**
   * Soft delete a store (set isActive to false)
   */
  async remove(id: string): Promise<DeleteStoreResponse> {
    try {
      const store = await this.storeRepository.findOne({
        where: { id },
        select: ['id'],
      });

      if (!store) {
        return new DeleteStoreResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.NOT_FOUND,
          }),
        });
      }

      await this.storeRepository.update(id, { isActive: false });

      this.logger.log(`Store ${id} deactivated successfully`);
      return new DeleteStoreResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
      });
    } catch (error) {
      this.logger.error(`Error removing store ${id}:`, error);
      return new DeleteStoreResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  /**
   * Generate cache key for search parameters
   */
  private generateCacheKey(searchDto: SearchStoresDto): string {
    try {
      const { latitude, longitude, radius, name, type, pageIndex, pageSize } =
        searchDto;
      const params = [
        latitude ? `lat:${Number(latitude).toFixed(6)}` : '',
        longitude ? `lng:${Number(longitude).toFixed(6)}` : '',
        radius ? `r:${radius}` : '',
        name ? `n:${name}` : '',
        type ? `t:${type}` : '',
        pageIndex ? `pi:${pageIndex}` : '',
        pageSize ? `ps:${pageSize}` : '',
      ];
      return `${this.CACHE_PREFIX}${params}`;
    } catch (error) {
      this.logger.warn('Error generating cache key:', error);
    }
  }

  /**
   * Cache search results
   */
  private async cacheSearchResult(
    key: string,
    result: SearchStoresResponse,
  ): Promise<void> {
    try {
      const cacheValue = JSON.stringify(result);
      await this.redisService.set(key, cacheValue, this.CACHE_TTL);
    } catch (error) {
      this.logger.warn('Failed to cache search result:', error);
    }
  }

  /**
   * Get cached search result
   */
  private async getCachedSearchResult(
    key: string,
  ): Promise<SearchStoresResponse | null> {
    try {
      const cachedValue = await this.redisService.get(key);
      if (!cachedValue) {
        return null;
      }
      return JSON.parse(cachedValue);
    } catch (error) {
      this.logger.warn('Error reading cache:', error);
      return null;
    }
  }
}
