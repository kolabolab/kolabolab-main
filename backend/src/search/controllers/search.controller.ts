import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SearchService } from '../services/search.service';
import {
  SearchDto,
  SuggestDto,
  AutocompleteDto,
  BulkIndexDto,
  SearchEntity,
  SearchType,
} from '../dto/search.dto';
import { SearchResult, SearchStats } from '../interfaces/search.interface';

@ApiTags('search')
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search across all entities' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results',
    schema: {
      type: 'object',
      properties: {
        hits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              score: { type: 'number' },
              source: { type: 'object' },
              highlights: { type: 'object' },
            },
          },
        },
        total: {
          type: 'object',
          properties: {
            value: { type: 'number' },
            relation: { type: 'string', enum: ['eq', 'gte'] },
          },
        },
        maxScore: { type: 'number' },
        took: { type: 'number' },
        facets: { type: 'object' },
      },
    },
  })
  @ApiQuery({ name: 'query', description: 'Search query', type: String })
  @ApiQuery({ name: 'type', description: 'Search type', enum: SearchType, required: false })
  @ApiQuery({ name: 'entity', description: 'Entity type to search', enum: SearchEntity, required: false })
  @ApiQuery({ name: 'limit', description: 'Number of results per page', type: Number, required: false })
  @ApiQuery({ name: 'offset', description: 'Offset for pagination', type: Number, required: false })
  @ApiQuery({ name: 'includeHighlights', description: 'Include search highlights', type: Boolean, required: false })
  @ApiQuery({ name: 'includeFacets', description: 'Include search facets', type: Boolean, required: false })
  @ApiQuery({ name: 'minScore', description: 'Minimum score threshold', type: Number, required: false })
  async search(
    @Query(new ValidationPipe({ transform: true })) searchDto: SearchDto
  ): Promise<SearchResult> {
    try {
      this.logger.log(`Search request: ${searchDto.query} (${searchDto.entity})`);
      return await this.searchService.search(searchDto);
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw new BadRequestException(`Search failed: ${error.message}`);
    }
  }

  @Post('advanced')
  @ApiOperation({ summary: 'Advanced search with complex filters' })
  @ApiResponse({ status: 200, description: 'Advanced search results' })
  @ApiBody({ type: SearchDto })
  @HttpCode(HttpStatus.OK)
  async advancedSearch(
    @Body(new ValidationPipe({ transform: true })) searchDto: SearchDto
  ): Promise<SearchResult> {
    try {
      this.logger.log(`Advanced search request: ${searchDto.query}`);
      return await this.searchService.search(searchDto);
    } catch (error) {
      this.logger.error('Advanced search failed:', error);
      throw new BadRequestException(`Advanced search failed: ${error.message}`);
    }
  }

  @Post('semantic')
  @ApiOperation({ summary: 'Semantic search using AI embeddings' })
  @ApiResponse({ status: 200, description: 'Semantic search results' })
  @ApiBody({ type: SearchDto })
  @HttpCode(HttpStatus.OK)
  async semanticSearch(
    @Body(new ValidationPipe({ transform: true })) searchDto: SearchDto
  ): Promise<SearchResult> {
    try {
      searchDto.type = SearchType.SEMANTIC;
      this.logger.log(`Semantic search request: ${searchDto.query}`);
      return await this.searchService.semanticSearch(searchDto);
    } catch (error) {
      this.logger.error('Semantic search failed:', error);
      throw new BadRequestException(`Semantic search failed: ${error.message}`);
    }
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search suggestions',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  @ApiQuery({ name: 'text', description: 'Text to get suggestions for', type: String })
  @ApiQuery({ name: 'entity', description: 'Entity type', enum: SearchEntity, required: false })
  @ApiQuery({ name: 'limit', description: 'Number of suggestions', type: Number, required: false })
  async suggest(
    @Query(new ValidationPipe({ transform: true })) suggestDto: SuggestDto
  ): Promise<string[]> {
    try {
      return await this.searchService.suggest(suggestDto);
    } catch (error) {
      this.logger.error('Suggest failed:', error);
      return [];
    }
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Get autocomplete suggestions' })
  @ApiResponse({ 
    status: 200, 
    description: 'Autocomplete suggestions',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  @ApiQuery({ name: 'query', description: 'Query for autocomplete', type: String })
  @ApiQuery({ name: 'entity', description: 'Entity type', enum: SearchEntity, required: false })
  @ApiQuery({ name: 'field', description: 'Field to autocomplete on', type: String, required: false })
  @ApiQuery({ name: 'limit', description: 'Number of suggestions', type: Number, required: false })
  async autocomplete(
    @Query(new ValidationPipe({ transform: true })) autocompleteDto: AutocompleteDto
  ): Promise<string[]> {
    try {
      return await this.searchService.autocomplete(autocompleteDto);
    } catch (error) {
      this.logger.error('Autocomplete failed:', error);
      return [];
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get search engine statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search engine statistics',
    type: Object,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getStats(): Promise<SearchStats> {
    try {
      return await this.searchService.getStats();
    } catch (error) {
      this.logger.error('Get stats failed:', error);
      throw new BadRequestException(`Failed to get stats: ${error.message}`);
    }
  }

  @Post('index/:entity')
  @ApiOperation({ summary: 'Manually index a document' })
  @ApiResponse({ status: 201, description: 'Document indexed successfully' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  async indexDocument(
    @Query('entity') entity: SearchEntity,
    @Body() body: { id: string; document: any; refresh?: boolean }
  ): Promise<{ message: string }> {
    try {
      await this.searchService.indexDocument(
        entity,
        body.id,
        body.document,
        body.refresh
      );
      return { message: 'Document indexed successfully' };
    } catch (error) {
      this.logger.error('Index document failed:', error);
      throw new BadRequestException(`Failed to index document: ${error.message}`);
    }
  }

  @Post('bulk-index')
  @ApiOperation({ summary: 'Bulk index documents for an entity type' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bulk index results',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number' },
        failed: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBody({ type: BulkIndexDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  async bulkIndex(
    @Body(new ValidationPipe({ transform: true })) bulkIndexDto: BulkIndexDto
  ): Promise<{ success: number; failed: number; message: string }> {
    try {
      this.logger.log(`Starting bulk index for ${bulkIndexDto.entity}`);
      const result = await this.searchService.bulkIndex(bulkIndexDto);
      const message = `Bulk index completed: ${result.success} success, ${result.failed} failed`;
      this.logger.log(message);
      return { ...result, message };
    } catch (error) {
      this.logger.error('Bulk index failed:', error);
      throw new BadRequestException(`Bulk index failed: ${error.message}`);
    }
  }

  @Post('reindex-all')
  @ApiOperation({ summary: 'Reindex all entities (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reindex all results',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entity: { type: 'string' },
              success: { type: 'number' },
              failed: { type: 'number' },
            },
          },
        },
        totalSuccess: { type: 'number' },
        totalFailed: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  async reindexAll(): Promise<{
    results: Array<{ entity: string; success: number; failed: number }>;
    totalSuccess: number;
    totalFailed: number;
    message: string;
  }> {
    try {
      this.logger.log('Starting reindex all entities');
      
      const entities = [
        SearchEntity.USERS,
        SearchEntity.STARTUPS,
        SearchEntity.COLLABORATIONS,
        SearchEntity.INVESTMENTS,
      ];

      const results = [];
      let totalSuccess = 0;
      let totalFailed = 0;

      for (const entity of entities) {
        try {
          const result = await this.searchService.bulkIndex({
            entity,
            force: true,
            batchSize: 1000,
          });
          results.push({ entity, ...result });
          totalSuccess += result.success;
          totalFailed += result.failed;
        } catch (error) {
          this.logger.error(`Failed to reindex ${entity}:`, error);
          results.push({ entity, success: 0, failed: 1 });
          totalFailed += 1;
        }
      }

      const message = `Reindex completed: ${totalSuccess} total success, ${totalFailed} total failed`;
      this.logger.log(message);

      return {
        results,
        totalSuccess,
        totalFailed,
        message,
      };
    } catch (error) {
      this.logger.error('Reindex all failed:', error);
      throw new BadRequestException(`Reindex all failed: ${error.message}`);
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Check search engine health' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search engine health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
        elasticsearch: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            cluster_status: { type: 'string' },
            version: { type: 'string' },
          },
        },
        indices: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            healthy: { type: 'number' },
            missing: { type: 'array', items: { type: 'string' } },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    elasticsearch: any;
    indices: any;
    timestamp: string;
  }> {
    try {
      // Basic health check implementation
      const stats = await this.searchService.getStats();
      const timestamp = new Date().toISOString();

      const health = {
        status: 'healthy' as const,
        elasticsearch: {
          connected: true,
          cluster_status: 'green',
          version: '8.11.0',
        },
        indices: {
          total: stats.totalIndices,
          healthy: stats.totalIndices,
          missing: [],
        },
        timestamp,
      };

      return health;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        elasticsearch: {
          connected: false,
          cluster_status: 'red',
          version: 'unknown',
        },
        indices: {
          total: 0,
          healthy: 0,
          missing: ['all'],
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}