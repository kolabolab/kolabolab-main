import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => {
  // Support both connection string (for cloud providers like Neon) and individual parameters
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'kolabolab',
    password: process.env.DB_PASSWORD || 'kolabolab_password',
    name: process.env.DB_NAME || 'kolabolab',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
  };
});