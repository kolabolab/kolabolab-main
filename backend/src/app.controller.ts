import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  @Get()
  getHello(): string {
    return 'KolaboLab API is running!';
  }

  @Get('health')
  async getHealth() {
    try {
      const dbStatus = this.dataSource.isInitialized;
      const dbQuery = await this.dataSource.query('SELECT 1');
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          connected: dbStatus,
          query_test: dbQuery.length > 0 ? 'ok' : 'failed'
        },
        services: {
          api: 'ok',
          auth: 'ok'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error.message
        }
      };
    }
  }
}