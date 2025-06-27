import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Load environment variables
config();

const configService = new ConfigService();

// Support both connection string (for cloud providers like Neon) and individual parameters
const createDataSourceConfig = () => {
  const baseConfig = {
    type: 'postgres' as const,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    subscribers: [__dirname + '/subscribers/*{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  };

  const databaseUrl = configService.get('DATABASE_URL');
  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,
    };
  }

  return {
    ...baseConfig,
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'kolabolab'),
    password: configService.get('DB_PASSWORD', 'kolabolab_password'),
    database: configService.get('DB_NAME', 'kolabolab'),
  };
};

export const AppDataSource = new DataSource(createDataSourceConfig());