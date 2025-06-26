import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StartupsService } from './startups.service';

@ApiTags('startups')
@Controller('startups')
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all startups' })
  @ApiResponse({ status: 200, description: 'Startups retrieved successfully' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiQuery({ name: 'stage', required: false, description: 'Funding stage filter' })
  @ApiQuery({ name: 'tags', required: false, description: 'Tags filter' })
  findAll(@Query() query: any) {
    return this.startupsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new startup' })
  @ApiResponse({ status: 201, description: 'Startup created successfully' })
  create(@Body() createStartupDto: any) {
    return this.startupsService.create(createStartupDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get startup by ID' })
  @ApiResponse({ status: 200, description: 'Startup retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.startupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update startup' })
  @ApiResponse({ status: 200, description: 'Startup updated successfully' })
  update(@Param('id') id: string, @Body() updateStartupDto: any) {
    return this.startupsService.update(id, updateStartupDto);
  }
}