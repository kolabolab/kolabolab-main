import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Startup } from './entities/startup.entity';

@Injectable()
export class StartupsService {
  constructor(
    @InjectRepository(Startup)
    private startupsRepository: Repository<Startup>,
  ) {}

  async findAll(query: any = {}): Promise<Startup[]> {
    const where: any = { isPublic: true };
    
    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }
    
    if (query.stage) {
      where.fundingStage = query.stage;
    }

    return this.startupsRepository.find({
      where,
      relations: ['founder'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async create(createStartupDto: any): Promise<Startup> {
    const startup = this.startupsRepository.create(createStartupDto);
    return await this.startupsRepository.save(startup) as unknown as Startup;
  }

  async findOne(id: string): Promise<Startup> {
    return this.startupsRepository.findOne({
      where: { id },
      relations: ['founder', 'collaborations', 'investments'],
    });
  }

  async update(id: string, updateStartupDto: any): Promise<Startup> {
    await this.startupsRepository.update(id, updateStartupDto);
    return this.findOne(id);
  }
}