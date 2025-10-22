import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      this.client = createClient({
        url: redisUrl,
      }) as RedisClientType;

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.logger.log('Redis Client Ready');
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis client', error);
      throw error;
    }
  }

  /**
   * Set a value in Redis with optional TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set a value in Redis with options
   */
  async setWithOptions(
    key: string,
    value: string,
    options: { NX?: boolean; EX?: number },
  ): Promise<string | null> {
    try {
      const result = await this.client.set(key, value, options);
      if (typeof result === 'string') {
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error setting key ${key} with options:`, error);
      throw error;
    }
  }

  /**
   * Get a value from Redis
   */
  async get(key: string): Promise<string | null> {
    try {
      const result = await this.client.get(key);
      if (typeof result === 'string') {
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Acquire a distributed lock
   * Returns true if lock acquired, false otherwise
   */
  async acquireLock(
    lockKey: string,
    ttlSeconds: number = 10,
  ): Promise<boolean> {
    try {
      // SET NX (only set if not exists) with expiration
      const result = await this.setWithOptions(lockKey, '1', {
        NX: true,
        EX: ttlSeconds,
      });
      return result === 'OK';
    } catch (error) {
      this.logger.error(`Error acquiring lock ${lockKey}:`, error);
      throw error;
    }
  }

  /**
   * Release a distributed lock
   */
  async releaseLock(lockKey: string): Promise<void> {
    try {
      await this.client.del(lockKey);
    } catch (error) {
      this.logger.error(`Error releasing lock ${lockKey}:`, error);
      throw error;
    }
  }

  /**
   * Execute a function with distributed lock
   */
  async withLock<T>(
    lockKey: string,
    fn: () => Promise<T>,
    options: {
      ttlSeconds?: number;
      retryTimes?: number;
      retryDelayMs?: number;
    } = {},
  ): Promise<T> {
    const { ttlSeconds = 10, retryTimes = 3, retryDelayMs = 100 } = options;

    let attempt = 0;
    while (attempt < retryTimes) {
      const acquired = await this.acquireLock(lockKey, ttlSeconds);

      if (acquired) {
        try {
          return await fn();
        } finally {
          await this.releaseLock(lockKey);
        }
      }

      attempt++;
      if (attempt < retryTimes) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    throw new Error(
      `Failed to acquire lock ${lockKey} after ${retryTimes} attempts`,
    );
  }

  /**
   * Set multiple fields in a hash
   */
  async hSet(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hSet(key, field, value);
    } catch (error) {
      this.logger.error(`Error setting hash field ${key}:${field}:`, error);
      throw error;
    }
  }

  /**
   * Get a field from a hash
   */
  async hGet(key: string, field: string): Promise<string | undefined> {
    try {
      const result = await this.client.hGet(key, field);
      if (typeof result === 'string') {
        return result;
      }
      return undefined;
    } catch (error) {
      this.logger.error(`Error getting hash field ${key}:${field}:`, error);
      throw error;
    }
  }

  /**
   * Get all fields from a hash
   */
  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      this.logger.error(`Error getting all hash fields ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set TTL for a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get client for advanced operations
   */
  getClient(): RedisClientType {
    return this.client;
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.client.quit();
      this.logger.log('Redis Client Disconnected');
    }
  }
}
