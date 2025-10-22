import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { EmailService } from './email.service';
import { BloomFilterService } from './bloom-filter.service';

@Module({
  imports: [],
  controllers: [],
  providers: [RedisService, EmailService, BloomFilterService],
  exports: [RedisService, EmailService, BloomFilterService],
})
export class SharedModule {}
