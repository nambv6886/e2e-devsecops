import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserFavoriteDto } from './dto/create-user-favorite.dto';
import { UserFavoriteEntity } from './entities/user-favorite.entity';
import { ResponseMessage } from '../../models/interfaces/response.message.model';
import { ResponseStatus } from '../../models/interfaces/response.status.model';
import { MessageCode } from '../../common/constants/message-code.constant';
import {
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  GetFavoritesResponse,
  CheckFavoriteResponse,
} from './dto/favorite-responses.dto';
import { FavoriteInfo } from './dto/favorite-info.dto';

@Injectable()
export class UserFavoritesService {
  private readonly logger = new Logger(UserFavoritesService.name);

  constructor(
    @InjectRepository(UserFavoriteEntity)
    private readonly favoriteRepository: Repository<UserFavoriteEntity>,
  ) {}

  /**
   * Add a store to user's favorites
   */
  async addFavorite(
    userId: string,
    createDto: CreateUserFavoriteDto,
  ): Promise<AddFavoriteResponse> {
    try {
      const { storeId } = createDto;

      // Check if already favorited
      const existing = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          store: { id: storeId },
        },
      });

      if (existing) {
        return new AddFavoriteResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.FAIL,
          }),
        });
      }

      // Create new favorite
      const favorite = this.favoriteRepository.create({
        user: { id: userId } as any,
        store: { id: storeId } as any,
      });

      await this.favoriteRepository.save(favorite);

      // Fetch with relations
      const savedFavorite = await this.favoriteRepository.findOne({
        where: { id: favorite.id },
        relations: ['store', 'user'],
      });

      this.logger.log(`User ${userId} added store ${storeId} to favorites`);

      return new AddFavoriteResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        favorite: new FavoriteInfo(savedFavorite),
      });
    } catch (error) {
      this.logger.error('Error adding favorite:', error);
      return new AddFavoriteResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  /**
   * Remove a store from user's favorites
   */
  async removeFavorite(
    userId: string,
    storeId: string,
  ): Promise<RemoveFavoriteResponse> {
    try {
      const favorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          store: { id: storeId },
        },
      });

      if (!favorite) {
        return new RemoveFavoriteResponse({
          responseMessage: new ResponseMessage({
            status: ResponseStatus.Fail,
            messageCode: MessageCode.NOT_FOUND,
          }),
        });
      }

      await this.favoriteRepository.remove(favorite);

      this.logger.log(`User ${userId} removed store ${storeId} from favorites`);

      return new RemoveFavoriteResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
      });
    } catch (error) {
      this.logger.error('Error removing favorite:', error);
      return new RemoveFavoriteResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
      });
    }
  }

  /**
   * Get all favorite stores for a user with pagination
   */
  async getUserFavorites(
    userId: string,
    pageIndex: number = 1,
    pageSize: number = 10,
  ): Promise<GetFavoritesResponse> {
    try {
      const skip = (pageIndex - 1) * pageSize;

      const [favorites, totalCount] =
        await this.favoriteRepository.findAndCount({
          where: {
            user: { id: userId },
          },
          relations: ['store', 'user'],
          order: { createdAt: 'DESC' },
          skip,
          take: pageSize,
        });

      return new GetFavoritesResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        favorites: favorites.map((fav) => new FavoriteInfo(fav)),
        totalItemCount: totalCount,
        pageIndex,
        pageSize,
      });
    } catch (error) {
      this.logger.error('Error getting favorites:', error);
      return new GetFavoritesResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
        favorites: [],
        totalItemCount: 0,
        pageIndex,
        pageSize,
      });
    }
  }

  /**
   * Check if a store is in user's favorites
   */
  async checkFavorite(
    userId: string,
    storeId: string,
  ): Promise<CheckFavoriteResponse> {
    try {
      const favorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          store: { id: storeId },
        },
      });

      return new CheckFavoriteResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Success,
          messageCode: MessageCode.SUCCESS,
        }),
        isFavorite: !!favorite,
        favoriteId: favorite?.id,
      });
    } catch (error) {
      this.logger.error('Error checking favorite:', error);
      return new CheckFavoriteResponse({
        responseMessage: new ResponseMessage({
          status: ResponseStatus.Fail,
          messageCode: MessageCode.FAIL,
        }),
        isFavorite: false,
      });
    }
  }
}
