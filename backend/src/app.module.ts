import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// App controller
import { AppController } from './app.controller';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StartupsModule } from './startups/startups.module';
import { CollaborationsModule } from './collaborations/collaborations.module';
import { SearchModule } from './search/search.module';

// Entities
import { User } from './users/entities/user.entity';
import { Startup } from './startups/entities/startup.entity';
import { Collaboration } from './collaborations/entities/collaboration.entity';
import { Investment } from './startups/entities/investment.entity';
import { Message } from './collaborations/entities/message.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'postgres'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'kolabolab'),
        password: configService.get('DB_PASSWORD', 'kolabolab123'),
        database: configService.get('DB_NAME', 'kolabolab'),
        entities: [User, Startup, Collaboration, Investment, Message],
        synchronize: true, // Enable for development to auto-create tables
        logging: configService.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // JWT Global Configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'kolabolab-jwt-secret'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
      global: true,
    }),

    // Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Feature modules
    AuthModule,
    UsersModule,
    StartupsModule,
    CollaborationsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}