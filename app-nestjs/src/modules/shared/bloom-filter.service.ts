import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class BloomFilterService implements OnModuleInit {
  private readonly logger = new Logger(BloomFilterService.name);
  private readonly USER_EMAIL_BLOOM_FILTER = 'user:email:bloom';

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    try {
      await this.initializeBloomFilter();
      this.logger.log('Bloom filter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize bloom filter', error);
    }
  }

  private async initializeBloomFilter(): Promise<void> {
    try {
      const exists = await this.redisService
        .getClient()
        .exists(this.USER_EMAIL_BLOOM_FILTER);

      if (!exists) {
        // Reserve bloom filter with initial capacity and error rate
        await this.redisService.getClient().sendCommand([
          'BF.RESERVE',
          this.USER_EMAIL_BLOOM_FILTER,
          '0.001', // error rate (1%)
          '10000', // initial capacity
        ]);
        this.logger.log(
          `Bloom filter created with capacity 10000 and error rate 0.001`,
        );
      } else {
        this.logger.log('Bloom filter already exists');
      }
    } catch (error) {
      this.logger.error('Error initializing bloom filter:', error);
      throw error;
    }
  }

  async addEmail(email: string): Promise<boolean> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const result = await this.redisService
        .getClient()
        .sendCommand(['BF.ADD', this.USER_EMAIL_BLOOM_FILTER, normalizedEmail]);

      return Number(result) === 1;
    } catch (error) {
      this.logger.error(`Error adding email to bloom filter: ${email}`, error);
      throw error;
    }
  }

  async mightExist(email: string): Promise<boolean> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const result = await this.redisService
        .getClient()
        .sendCommand([
          'BF.EXISTS',
          this.USER_EMAIL_BLOOM_FILTER,
          normalizedEmail,
        ]);

      return Number(result) === 1;
    } catch (error) {
      this.logger.error(
        `Error checking email in bloom filter: ${email}`,
        error,
      );
      return true;
    }
  }

  async addEmails(emails: string[]): Promise<void> {
    try {
      if (emails.length === 0) {
        return;
      }

      const normalizedEmails = emails.map((email) =>
        email.toLowerCase().trim(),
      );

      // Use pipeline for better performance
      const pipeline = this.redisService.getClient().multi();

      for (const email of normalizedEmails) {
        pipeline.addCommand(['BF.ADD', this.USER_EMAIL_BLOOM_FILTER, email]);
      }

      await pipeline.exec();
      this.logger.log(`Added ${emails.length} emails to bloom filter`);
    } catch (error) {
      this.logger.error('Error adding multiple emails to bloom filter', error);
      throw error;
    }
  }

  async getBloomFilterInfo(): Promise<any> {
    try {
      const info = await this.redisService
        .getClient()
        .sendCommand(['BF.INFO', this.USER_EMAIL_BLOOM_FILTER]);
      return info;
    } catch (error) {
      this.logger.error('Error getting bloom filter info', error);
      return null;
    }
  }

  async resetBloomFilter(): Promise<void> {
    try {
      await this.redisService.getClient().del(this.USER_EMAIL_BLOOM_FILTER);
      await this.initializeBloomFilter();
      this.logger.log('Bloom filter reset successfully');
    } catch (error) {
      this.logger.error('Error resetting bloom filter', error);
      throw error;
    }
  }
}
