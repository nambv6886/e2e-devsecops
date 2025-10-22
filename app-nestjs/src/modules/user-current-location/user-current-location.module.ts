import { Module } from '@nestjs/common';
import { UserCurrentLocationService } from './user-current-location.service';
import { UserCurrentLocationController } from './user-current-location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCurrentLocationEntity } from './entities/user-current-location.entity';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCurrentLocationEntity]),
    SharedModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [UserCurrentLocationController],
  providers: [UserCurrentLocationService],
  exports: [UserCurrentLocationService],
})
export class UserCurrentLocationModule {}
