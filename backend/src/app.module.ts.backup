import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StartupsModule } from './startups/startups.module';
import { CollaborationsModule } from './collaborations/collaborations.module';
import { InvestmentsModule } from './investments/investments.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';

// Configuration
import { DatabaseConfig } from './config/database.config';
import { JwtConfig } from './config/jwt.config';
import { RedisConfig } from './config/redis.config';
import { ElasticsearchConfig } from './config/elasticsearch.config';

// Controllers
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [DatabaseConfig, JwtConfig, RedisConfig, ElasticsearchConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => {
        const baseConfig = {
          type: 'postgres' as const,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('database.synchronize'),
          logging: configService.get('database.logging'),
          ssl: configService.get('database.ssl'),
          retryAttempts: 3,
          retryDelay: 3000,
        };

        // Support connection string (for cloud providers like Neon)
        const databaseUrl = configService.get('database.url');
        if (databaseUrl) {
          return {
            ...baseConfig,
            url: databaseUrl as string,
          };
        }

        // Fall back to individual parameters
        return {
          ...baseConfig,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
        };
      },
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Event Emitter
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    StartupsModule,
    CollaborationsModule,
    InvestmentsModule,
    SearchModule,
    NotificationsModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}