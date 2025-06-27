import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Startup } from './entities/startup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Startup])],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class StartupsModule {}