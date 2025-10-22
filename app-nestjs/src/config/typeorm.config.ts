import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import 'dotenv/config';

const baseConfig = {
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nestjs_dev',
  entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  retryAttempts: 5,
  retryDelay: 2000,
  // migraionsRun: true
};

// Export configuration for NestJS
export const typeOrmConfig = {
  ...baseConfig,
  synchronize: false,
};

// Export configuration for TypeORM CLI
export const dataSourceConfig = new DataSource(baseConfig as DataSourceOptions);
