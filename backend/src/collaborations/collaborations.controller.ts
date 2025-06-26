import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CollaborationsService } from './collaborations.service';

@ApiTags('collaborations')
@Controller('collaborations')
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all collaborations' })
  @ApiResponse({ status: 200, description: 'Collaborations retrieved successfully' })
  findAll() {
    return this.collaborationsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create collaboration request' })
  @ApiResponse({ status: 201, description: 'Collaboration request created' })
  create(@Body() createCollaborationDto: any) {
    return this.collaborationsService.create(createCollaborationDto);
  }
}