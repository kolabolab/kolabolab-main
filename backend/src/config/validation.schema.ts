import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  FRONTEND_URL: Joi.string().uri().required(),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_DB: Joi.number().default(0),
  REDIS_KEY_PREFIX: Joi.string().default('kolabolab:'),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Email (Resend)
  RESEND_API_KEY: Joi.string()
    .pattern(/^re_[a-zA-Z0-9_-]+$/)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  FROM_EMAIL: Joi.string().email().default('noreply@kolabolab.com'),
  FROM_NAME: Joi.string().default('KolaboLab Team'),

  // OAuth (Optional for development)
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),
  
  LINKEDIN_CLIENT_ID: Joi.string().optional(),
  LINKEDIN_CLIENT_SECRET: Joi.string().optional(),
  LINKEDIN_CALLBACK_URL: Joi.string().uri().optional(),
  
  GITHUB_CLIENT_ID: Joi.string().optional(),
  GITHUB_CLIENT_SECRET: Joi.string().optional(),
  GITHUB_CALLBACK_URL: Joi.string().uri().optional(),

  // File Upload
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  UPLOAD_PATH: Joi.string().default('uploads'),
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // Search (Optional)
  ELASTICSEARCH_HOST: Joi.string().default('localhost'),
  ELASTICSEARCH_PORT: Joi.number().port().default(9200),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
});