import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search across platform' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, description: 'Search type (startups, users, collaborations)' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags' })
  search(@Query() query: any) {
    return this.searchService.search(query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: 200, description: 'Search suggestions retrieved' })
  @ApiQuery({ name: 'q', description: 'Partial search query' })
  suggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }
}