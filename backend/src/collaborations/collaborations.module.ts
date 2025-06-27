import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaboration } from './entities/collaboration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collaboration])],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class CollaborationsModule {}