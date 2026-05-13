import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StartupsModule } from './startups/startups.module';
import { CollaborationsModule } from './collaborations/collaborations.module';
import { InvestmentsModule } from './investments/investments.module';
import { AppController } from './app.controller';
import { DatabaseConfig } from './config/database.config';
import { JwtConfig } from './config/jwt.config';
import { User } from './users/entities/user.entity';
import { Startup } from './startups/entities/startup.entity';
import { Collaboration } from './collaborations/entities/collaboration.entity';
import { Investment } from './investments/entities/investment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [DatabaseConfig, JwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'kolabolab'),
        password: configService.get('DB_PASSWORD', 'kolabolab_password'),
        database: configService.get('DB_NAME', 'kolabolab'),
        entities: [User, Startup, Collaboration, Investment],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'fallback-secret'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '7d') },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    StartupsModule,
    CollaborationsModule,
    InvestmentsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
