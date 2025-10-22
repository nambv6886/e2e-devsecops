import { Module } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ExceptionsFilterFilter } from './common/filters/http-exception.filter';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { StoresModule } from './modules/stores/stores.module';
import { UserCurrentLocationModule } from './modules/user-current-location/user-current-location.module';
import { UserFavoritesModule } from './modules/user-favorites/user-favorites.module';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from './config/config.service';
import { SeederModule } from './modules/seeder/seeder.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configSchema,
      isGlobal: true,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (1 minute)
        limit: 10, // Max requests per ttl window
      },
    ]),
    TypeOrmModule.forRoot(typeOrmConfig as TypeOrmModuleOptions),
    UsersModule,
    AuthModule,
    StoresModule,
    UserCurrentLocationModule,
    UserFavoritesModule,
    SeederModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: ExceptionsFilterFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
