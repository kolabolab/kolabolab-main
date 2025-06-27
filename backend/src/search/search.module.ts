import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { User } from '../users/entities/user.entity';
import { Startup } from '../startups/entities/startup.entity';
import { Collaboration } from '../collaborations/entities/collaboration.entity';
import { Investment } from '../investments/entities/investment.entity';

// Services
import { SearchService } from './services/search.service';
import { IndexingService } from './services/indexing.service';

// Controllers
import { SearchController } from './controllers/search.controller';

// Configuration
import { ElasticsearchConfig } from '../config/elasticsearch.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Startup, Collaboration, Investment]),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        node: configService.get('elasticsearch.node'),
        auth: configService.get('elasticsearch.auth'),
        tls: configService.get('elasticsearch.tls'),
        requestTimeout: configService.get('elasticsearch.requestTimeout'),
        pingTimeout: configService.get('elasticsearch.pingTimeout'),
        sniffOnStart: configService.get('elasticsearch.sniffOnStart'),
        sniffInterval: configService.get('elasticsearch.sniffInterval'),
        sniffOnConnectionFault: configService.get('elasticsearch.sniffOnConnectionFault'),
        compression: configService.get('elasticsearch.compression'),
        maxRetries: configService.get('elasticsearch.maxRetries'),
        retryDelay: configService.get('elasticsearch.retryDelay'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule,
    ScheduleModule,
  ],
  providers: [SearchService, IndexingService],
  controllers: [SearchController],
  exports: [SearchService, IndexingService],
})
export class SearchModule {}