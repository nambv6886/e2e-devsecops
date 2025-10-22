import { forwardRef, Module } from '@nestjs/common';
import { UserFavoritesService } from './user-favorites.service';
import { UserFavoritesController } from './user-favorites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFavoriteEntity } from './entities/user-favorite.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { UserEntity } from '../users/entities/user.entity';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SharedModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([UserFavoriteEntity, StoreEntity, UserEntity]),
  ],
  controllers: [UserFavoritesController],
  providers: [UserFavoritesService],
  exports: [UserFavoritesService],
})
export class UserFavoritesModule {}
