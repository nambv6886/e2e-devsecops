import { ApiProperty } from '@nestjs/swagger';
import { IResponse } from '../../../models/interfaces/i-response';
import { IPagedResponse } from '../../../models/interfaces/i-paged-response';
import { ResponseMessage } from '../../../models/interfaces/response.message.model';
import { FavoriteInfo } from './favorite-info.dto';

export class AddFavoriteResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  favorite: FavoriteInfo;

  constructor(fields?: Partial<AddFavoriteResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class RemoveFavoriteResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  constructor(fields?: Partial<RemoveFavoriteResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class GetFavoritesResponse implements IPagedResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  totalItemCount: number;

  @ApiProperty()
  pageIndex: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ type: [FavoriteInfo] })
  favorites: FavoriteInfo[];

  constructor(fields?: Partial<GetFavoritesResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class CheckFavoriteResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty({
    description: 'Whether the store is in favorites',
  })
  isFavorite: boolean;

  @ApiProperty({
    description: 'Favorite ID if exists',
    required: false,
  })
  favoriteId?: string;

  constructor(fields?: Partial<CheckFavoriteResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}
