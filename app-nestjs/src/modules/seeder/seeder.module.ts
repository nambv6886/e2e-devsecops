import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, StoreEntity]), UsersModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
