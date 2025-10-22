import { ApiProperty } from '@nestjs/swagger';
import { UserFavoriteEntity } from '../entities/user-favorite.entity';
import { StoreInfo } from '../../stores/dto/store-info.dto';

export class FavoriteInfo {
  @ApiProperty({
    description: 'Favorite ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'uuid-string',
  })
  userId: string;

  @ApiProperty({
    description: 'Store information',
    type: StoreInfo,
  })
  store: StoreInfo;

  @ApiProperty({
    description: 'Date when store was added to favorites',
  })
  createdAt: Date;

  constructor(favorite?: UserFavoriteEntity) {
    if (favorite) {
      this.id = favorite.id;
      this.userId = favorite.user?.id;
      this.store = favorite.store ? new StoreInfo(favorite.store) : null;
      this.createdAt = favorite.createdAt;
    }
  }
}
