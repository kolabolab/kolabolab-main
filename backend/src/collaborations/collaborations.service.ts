import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaboration } from './entities/collaboration.entity';

@Injectable()
export class CollaborationsService {
  constructor(
    @InjectRepository(Collaboration)
    private collaborationsRepository: Repository<Collaboration>,
  ) {}

  async findAll(): Promise<Collaboration[]> {
    return this.collaborationsRepository.find({
      relations: ['startup', 'collaborator'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createCollaborationDto: any): Promise<Collaboration> {
    const collaboration = this.collaborationsRepository.create(createCollaborationDto);
    return await this.collaborationsRepository.save(collaboration) as unknown as Collaboration;
  }
}