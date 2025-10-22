import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { seedUsers } from './data/user.seed';
import { seedStores } from './data/store.seed';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {}

  async seed(): Promise<void> {
    try {
      this.logger.log('🌱 Starting database seeding...');

      // Check if data already exists
      const userCount = await this.userRepository.count();
      const storeCount = await this.storeRepository.count();

      if (userCount > 0 || storeCount > 0) {
        this.logger.log(
          `⚠️  Database already contains data (${userCount} users, ${storeCount} stores). Skipping seeding.`,
        );
        return;
      }

      await this.seedUsers();
      await this.seedStores();

      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Error during database seeding:', error.message);
      throw error;
    }
  }

  private async seedUsers(): Promise<void> {
    this.logger.log('👤 Seeding users...');
    let successCount = 0;

    for (const userData of seedUsers) {
      try {
        const existingUser = await this.userRepository.findOne({
          where: { email: userData.email },
        });

        if (!existingUser) {
          await this.userRepository.save(userData);
          successCount++;
          this.logger.debug(`  ✓ Created user: ${userData.email}`);
        }
      } catch (error) {
        this.logger.error(
          `  ✗ Failed to create user ${userData.email}:`,
          error.message,
        );
      }
    }

    this.logger.log(`  📊 Successfully created ${successCount} users`);
  }

  private async seedStores(): Promise<void> {
    this.logger.log('🏪 Seeding stores...');
    let successCount = 0;

    for (const storeData of seedStores) {
      try {
        const { latitude, longitude, ...rest } = storeData;

        // Create store using query builder to properly set the location POINT
        await this.storeRepository
          .createQueryBuilder()
          .insert()
          .into(StoreEntity)
          .values({
            ...rest,
            latitude,
            longitude,
            location: () =>
              `ST_GeomFromText('POINT(${latitude} ${longitude})', 4326)`,
            isActive: true,
          } as any)
          .execute();

        successCount++;
        this.logger.debug(`  ✓ Created store: ${storeData.name}`);
      } catch (error) {
        this.logger.error(
          `  ✗ Failed to create store ${storeData.name}:`,
          error.message,
        );
      }
    }

    this.logger.log(`  📊 Successfully created ${successCount} stores`);
  }

  async clearDatabase(): Promise<void> {
    this.logger.warn('🗑️  Clearing database...');

    await this.storeRepository.delete({});
    await this.userRepository.delete({});

    this.logger.log('✅ Database cleared successfully!');
  }
}
