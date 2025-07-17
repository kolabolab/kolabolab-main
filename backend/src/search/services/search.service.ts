import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Startup } from '../../startups/entities/startup.entity';
import { Collaboration } from '../../collaborations/entities/collaboration.entity';
import { Investment } from '../../investments/entities/investment.entity';

import {
  SearchDto,
  SuggestDto,
  AutocompleteDto,
  BulkIndexDto,
  SearchType,
  SearchEntity,
} from '../dto/search.dto';

import {
  SearchResult,
  SearchHit,
  SearchMapping,
  IndexableDocument,
  SearchStats,
  VectorSearchQuery,
  SemanticSearchOptions,
} from '../interfaces/search.interface';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  // Index names
  private readonly indices = {
    users: 'kolabolab_users',
    startups: 'kolabolab_startups',
    collaborations: 'kolabolab_collaborations',
    investments: 'kolabolab_investments',
  };

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
    @InjectRepository(Collaboration)
    private readonly collaborationRepository: Repository<Collaboration>,
    @InjectRepository(Investment)
    private readonly investmentRepository: Repository<Investment>,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureConnection();
      await this.createIndicesIfNotExist();
      this.logger.log('Search service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize search service', error);
    }
  }

  private async ensureConnection(): Promise<void> {
    try {
      const client = this.elasticsearchService.getClient();
      const health = await client.cluster.health();
      this.logger.log(`Elasticsearch connection successful`);
    } catch (error) {
      throw new Error(`Failed to connect to Elasticsearch: ${error.message}`);
    }
  }

  private async createIndicesIfNotExist(): Promise<void> {
    const mappings = this.getSearchMappings();
    const client = this.elasticsearchService.getClient();

    for (const [entityType, indexName] of Object.entries(this.indices)) {
      try {
        const exists = await client.indices.exists({ index: indexName });
        
        if (!exists) {
          await client.indices.create({
            index: indexName,
            body: mappings[entityType as keyof typeof mappings],
          } as any);
          this.logger.log(`Created index: ${indexName}`);
        }
      } catch (error) {
        this.logger.error(`Failed to create index ${indexName}:`, error);
      }
    }
  }

  async search(searchDto: SearchDto): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const query = this.buildSearchQuery(searchDto);
      const indices = this.getTargetIndices(searchDto.entity);

      const client = this.elasticsearchService.getClient();
      const response = await client.search({
        index: indices,
        body: query,
        size: searchDto.limit,
        from: searchDto.offset,
      });

      const result = this.transformSearchResponse(response, searchDto);
      result.took = Date.now() - startTime;

      this.logger.debug(`Search completed in ${result.took}ms`, {
        query: searchDto.query,
        entity: searchDto.entity,
        total: result.total.value,
      });

      return result;
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw new BadRequestException(`Search failed: ${error.message}`);
    }
  }

  async semanticSearch(
    searchDto: SearchDto,
    options: SemanticSearchOptions = {}
  ): Promise<SearchResult> {
    if (searchDto.type !== SearchType.SEMANTIC && searchDto.type !== SearchType.HYBRID) {
      throw new BadRequestException('Semantic search requires SEMANTIC or HYBRID search type');
    }

    // For development, we'll simulate semantic search with enhanced text matching
    // In production, this would use actual vector embeddings
    const enhancedQuery = {
      ...searchDto,
      query: this.enhanceQueryForSemanticSearch(searchDto.query),
    };

    return this.search(enhancedQuery);
  }

  async suggest(suggestDto: SuggestDto): Promise<string[]> {
    try {
      const indices = this.getTargetIndices(suggestDto.entity);
      
      const client = this.elasticsearchService.getClient();
      const response = await client.search({
        index: indices,
        body: {
          suggest: {
            text_suggest: {
              text: suggestDto.text,
              term: {
                field: 'name',
                size: suggestDto.limit,
              },
            },
            phrase_suggest: {
              text: suggestDto.text,
              phrase: {
                field: 'description',
                size: suggestDto.limit,
                max_errors: 2,
              },
            },
          },
        },
      } as any);

      const suggestions: string[] = [];
      
      if (response.suggest?.text_suggest) {
        response.suggest.text_suggest.forEach((suggest: any) => {
          suggest.options?.forEach((option: any) => {
            if (!suggestions.includes(option.text)) {
              suggestions.push(option.text);
            }
          });
        });
      }

      if (response.suggest?.phrase_suggest) {
        response.suggest.phrase_suggest.forEach((suggest: any) => {
          suggest.options?.forEach((option: any) => {
            if (!suggestions.includes(option.text)) {
              suggestions.push(option.text);
            }
          });
        });
      }

      return suggestions.slice(0, suggestDto.limit);
    } catch (error) {
      this.logger.error('Suggest failed:', error);
      return [];
    }
  }

  async autocomplete(autocompleteDto: AutocompleteDto): Promise<string[]> {
    try {
      const indices = this.getTargetIndices(autocompleteDto.entity);
      
      const client = this.elasticsearchService.getClient();
      const response = await client.search({
        index: indices,
        body: {
          query: {
            bool: {
              should: [
                {
                  match_phrase_prefix: {
                    [autocompleteDto.field]: {
                      query: autocompleteDto.query,
                      max_expansions: 10,
                    },
                  },
                },
                {
                  wildcard: {
                    [`${autocompleteDto.field}.keyword`]: `*${autocompleteDto.query}*`,
                  },
                },
              ],
            },
          },
          _source: [autocompleteDto.field],
          size: autocompleteDto.limit,
        },
      } as any);

      const suggestions = response.hits.hits
        .map((hit: any) => hit._source[autocompleteDto.field])
        .filter((value: string, index: number, array: string[]) => 
          value && array.indexOf(value) === index
        );

      return suggestions.slice(0, autocompleteDto.limit);
    } catch (error) {
      this.logger.error('Autocomplete failed:', error);
      return [];
    }
  }

  async indexDocument(
    entity: SearchEntity,
    id: string,
    document: any,
    refresh = false
  ): Promise<void> {
    try {
      const indexName = this.indices[entity as keyof typeof this.indices];
      if (!indexName) {
        throw new Error(`Invalid entity type: ${entity}`);
      }

      const transformedDoc = this.transformDocumentForIndexing(entity, document);

      const client = this.elasticsearchService.getClient();
      await client.index({
        index: indexName,
        id,
        body: transformedDoc,
        refresh: refresh ? 'wait_for' : false,
      });

      this.logger.debug(`Indexed document: ${entity}:${id}`);
    } catch (error) {
      this.logger.error(`Failed to index document ${entity}:${id}:`, error);
      throw error;
    }
  }

  async removeDocument(entity: SearchEntity, id: string): Promise<void> {
    try {
      const indexName = this.indices[entity as keyof typeof this.indices];
      if (!indexName) {
        throw new Error(`Invalid entity type: ${entity}`);
      }

      const client = this.elasticsearchService.getClient();
      await client.delete({
        index: indexName,
        id,
      });

      this.logger.debug(`Removed document: ${entity}:${id}`);
    } catch (error) {
      if (error.meta?.statusCode !== 404) {
        this.logger.error(`Failed to remove document ${entity}:${id}:`, error);
        throw error;
      }
    }
  }

  async bulkIndex(bulkIndexDto: BulkIndexDto): Promise<{ success: number; failed: number }> {
    const { entity, batchSize, force } = bulkIndexDto;
    
    let success = 0;
    let failed = 0;

    try {
      const repository = this.getRepository(entity);
      const total = await repository.count();
      
      this.logger.log(`Starting bulk index for ${entity}: ${total} documents`);

      for (let offset = 0; offset < total; offset += batchSize) {
        const entities = await repository.find({
          skip: offset,
          take: batchSize,
        });

        const body = [];
        for (const entityDoc of entities) {
          const indexName = this.indices[entity as keyof typeof this.indices];
          body.push({
            index: {
              _index: indexName,
              _id: entityDoc.id,
            },
          });
          body.push(this.transformDocumentForIndexing(entity, entityDoc));
        }

        if (body.length > 0) {
          const client = this.elasticsearchService.getClient();
          const response = await client.bulk({ body });
          
          response.items.forEach((item: any) => {
            if (item.index?.error) {
              failed++;
              this.logger.error('Bulk index error:', item.index.error);
            } else {
              success++;
            }
          });
        }

        this.logger.log(`Bulk index progress: ${offset + entities.length}/${total}`);
      }

      this.logger.log(`Bulk index completed: ${success} success, ${failed} failed`);
      return { success, failed };
    } catch (error) {
      this.logger.error('Bulk index failed:', error);
      throw error;
    }
  }

  async getStats(): Promise<SearchStats> {
    try {
      // For simplicity, we'll create mock stats since cluster.stats may not be available
      const client = this.elasticsearchService.getClient();
      const indicesStats = await client.indices.stats();

      const indices: Record<string, any> = {};
      
      for (const [name, indexName] of Object.entries(this.indices)) {
        const indexStat = indicesStats.indices?.[indexName];
        if (indexStat) {
          indices[name] = {
            documentCount: indexStat.total?.docs?.count || 0,
            size: this.formatBytes(indexStat.total?.store?.size_in_bytes || 0),
            health: 'green', // Simplified for now
          };
        }
      }

      return {
        totalDocuments: Object.values(indices).reduce((sum: number, idx: any) => sum + idx.documentCount, 0),
        totalIndices: Object.keys(this.indices).length,
        totalSize: this.formatBytes(Object.values(indices).reduce((sum: number, idx: any) => {
          return sum + parseInt(idx.size.replace(/[^\d]/g, '') || '0');
        }, 0) * 1024), // Rough estimate
        indices,
        performance: {
          averageQueryTime: 0, // Would need to track this over time
          slowQueries: 0,
          errorRate: 0,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get search stats:', error);
      throw error;
    }
  }

  private buildSearchQuery(searchDto: SearchDto): any {
    const { query, type, filters, sort, includeHighlights, includeFacets } = searchDto;

    const searchQuery: any = {
      query: this.buildQueryClause(query, type, filters),
    };

    if (includeHighlights) {
      searchQuery.highlight = this.buildHighlightClause();
    }

    if (includeFacets) {
      searchQuery.aggs = this.buildAggregationsClause();
    }

    if (sort?.field && sort.field !== '_score') {
      searchQuery.sort = [{ [sort.field]: { order: sort.order } }];
    }

    return searchQuery;
  }

  private buildQueryClause(query: string, type: SearchType, filters?: any): any {
    const mustClauses = [];
    const shouldClauses = [];
    const filterClauses = [];

    // Main text search
    switch (type) {
      case SearchType.FULL_TEXT:
        mustClauses.push({
          multi_match: {
            query,
            fields: [
              'name^3',
              'title^3',
              'description^2',
              'skills',
              'tags',
              'industry',
              'location',
            ],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        });
        break;

      case SearchType.FUZZY:
        mustClauses.push({
          multi_match: {
            query,
            fields: [
              'name^3',
              'title^3',
              'description^2',
              'skills',
              'tags',
            ],
            fuzziness: 2,
            prefix_length: 1,
          },
        });
        break;

      case SearchType.SEMANTIC:
      case SearchType.HYBRID:
        // Enhanced text matching for semantic feel
        mustClauses.push({
          bool: {
            should: [
              {
                multi_match: {
                  query,
                  fields: [
                    'name^3',
                    'title^3',
                    'description^2',
                    'skills^2',
                    'tags^2',
                  ],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                },
              },
              {
                multi_match: {
                  query,
                  fields: [
                    'description',
                    'longDescription',
                    'summary',
                  ],
                  type: 'phrase',
                  boost: 1.5,
                },
              },
            ],
            minimum_should_match: 1,
          },
        });
        break;

      default:
        mustClauses.push({
          multi_match: {
            query,
            fields: ['name^3', 'title^3', 'description^2'],
            type: 'best_fields',
          },
        });
    }

    // Apply filters
    if (filters) {
      if (filters.skills?.length) {
        filterClauses.push({
          terms: { 'skills.keyword': filters.skills },
        });
      }

      if (filters.roles?.length) {
        filterClauses.push({
          terms: { 'roles.keyword': filters.roles },
        });
      }

      if (filters.industries?.length) {
        filterClauses.push({
          terms: { 'industry.keyword': filters.industries },
        });
      }

      if (filters.locations?.length) {
        filterClauses.push({
          terms: { 'location.keyword': filters.locations },
        });
      }

      if (filters.fundingStages?.length) {
        filterClauses.push({
          terms: { 'fundingStage.keyword': filters.fundingStages },
        });
      }

      if (filters.minFunding !== undefined || filters.maxFunding !== undefined) {
        const rangeQuery: any = {};
        if (filters.minFunding !== undefined) rangeQuery.gte = filters.minFunding;
        if (filters.maxFunding !== undefined) rangeQuery.lte = filters.maxFunding;
        filterClauses.push({ range: { funding: rangeQuery } });
      }

      if (filters.remoteOnly) {
        filterClauses.push({ term: { isRemote: true } });
      }

      if (filters.verifiedOnly) {
        filterClauses.push({ term: { isVerified: true } });
      }

      if (filters.tags?.length) {
        filterClauses.push({
          terms: { 'tags.keyword': filters.tags },
        });
      }

      if (filters.dateFrom || filters.dateTo) {
        const rangeQuery: any = {};
        if (filters.dateFrom) rangeQuery.gte = filters.dateFrom;
        if (filters.dateTo) rangeQuery.lte = filters.dateTo;
        filterClauses.push({ range: { createdAt: rangeQuery } });
      }
    }

    return {
      bool: {
        must: mustClauses,
        should: shouldClauses,
        filter: filterClauses,
        minimum_should_match: shouldClauses.length > 0 ? 1 : 0,
      },
    };
  }

  private buildHighlightClause(): any {
    return {
      fields: {
        name: {},
        title: {},
        description: { fragment_size: 150, number_of_fragments: 3 },
        skills: {},
        tags: {},
      },
      pre_tags: ['<mark>'],
      post_tags: ['</mark>'],
    };
  }

  private buildAggregationsClause(): any {
    return {
      skills: {
        terms: { field: 'skills.keyword', size: 20 },
      },
      roles: {
        terms: { field: 'roles.keyword', size: 20 },
      },
      industries: {
        terms: { field: 'industry.keyword', size: 20 },
      },
      locations: {
        terms: { field: 'location.keyword', size: 20 },
      },
      fundingStages: {
        terms: { field: 'fundingStage.keyword', size: 10 },
      },
      tags: {
        terms: { field: 'tags.keyword', size: 30 },
      },
    };
  }

  private getTargetIndices(entity: SearchEntity): string[] {
    if (entity === SearchEntity.ALL) {
      return Object.values(this.indices);
    }
    
    const indexName = this.indices[entity as keyof typeof this.indices];
    return indexName ? [indexName] : [];
  }

  private transformSearchResponse(response: any, searchDto: SearchDto): SearchResult {
    const hits: SearchHit[] = response.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      source: hit._source,
      highlights: hit.highlight,
    }));

    const result: SearchResult = {
      hits,
      total: {
        value: response.hits.total.value,
        relation: response.hits.total.relation,
      },
      maxScore: response.hits.max_score || 0,
      took: response.took,
      query: searchDto.query,
      filters: searchDto.filters,
    };

    // Add facets if aggregations are present
    if (response.aggregations) {
      result.facets = this.transformAggregations(response.aggregations);
    }

    return result;
  }

  private transformAggregations(aggregations: any): any {
    const facets: any = {};

    Object.keys(aggregations).forEach(key => {
      const agg = aggregations[key];
      if (agg.buckets) {
        facets[key] = agg.buckets.map((bucket: any) => ({
          key: bucket.key,
          count: bucket.doc_count,
        }));
      }
    });

    return facets;
  }

  private transformDocumentForIndexing(entity: SearchEntity, document: any): any {
    const base = {
      id: document.id,
      createdAt: document.created_at || document.createdAt,
      updatedAt: document.updated_at || document.updatedAt,
    };

    switch (entity) {
      case SearchEntity.USERS:
        return {
          ...base,
          name: `${document.firstName} ${document.lastName}`.trim(),
          firstName: document.firstName,
          lastName: document.lastName,
          email: document.email,
          username: document.username,
          bio: document.bio || document.description,
          skills: document.skills || [],
          roles: document.roles || [],
          location: document.location,
          isVerified: document.isEmailVerified || false,
          avatar: document.avatar,
          linkedinProfile: document.linkedinProfile,
          githubProfile: document.githubProfile,
          tags: document.tags || [],
        };

      case SearchEntity.STARTUPS:
        return {
          ...base,
          name: document.name,
          title: document.name,
          description: document.description,
          longDescription: document.longDescription,
          industry: document.industry,
          location: document.location,
          website: document.website,
          fundingStage: document.fundingStage,
          funding: document.totalFunding || 0,
          employees: document.employeeCount || 0,
          skills: document.skillsNeeded || [],
          tags: document.tags || [],
          isRemote: document.isRemote || false,
          isVerified: document.isVerified || false,
          logo: document.logo,
          foundedDate: document.foundedDate,
        };

      case SearchEntity.COLLABORATIONS:
        return {
          ...base,
          title: document.role || 'Collaboration',
          description: document.description,
          role: document.role,
          type: document.type,
          status: document.status,
          skills: document.skills_required || [],
          hoursPerWeek: document.hours_per_week,
          compensation: document.compensation,
          isRemote: true, // Assume remote by default for collaborations
          startDate: document.start_date,
          endDate: document.end_date,
        };

      case SearchEntity.INVESTMENTS:
        return {
          ...base,
          title: `${document.type} Investment`,
          amount: document.amount,
          type: document.type,
          stage: document.stage,
          description: document.description || `${document.type} investment of $${document.amount}`,
          currency: document.currency || 'USD',
          valuation: document.valuation,
          equity: document.equity,
        };

      default:
        return base;
    }
  }

  private getRepository(entity: SearchEntity): Repository<any> {
    switch (entity) {
      case SearchEntity.USERS:
        return this.userRepository;
      case SearchEntity.STARTUPS:
        return this.startupRepository;
      case SearchEntity.COLLABORATIONS:
        return this.collaborationRepository;
      case SearchEntity.INVESTMENTS:
        return this.investmentRepository;
      default:
        throw new Error(`No repository found for entity: ${entity}`);
    }
  }

  private enhanceQueryForSemanticSearch(query: string): string {
    // Simple semantic enhancement - in production, this would use NLP
    const synonyms = {
      'developer': 'developer programmer coder engineer',
      'startup': 'startup company business venture',
      'funding': 'funding investment capital money',
      'remote': 'remote distributed virtual online',
      'AI': 'AI ML machine learning artificial intelligence',
      'web': 'web frontend backend full-stack',
    };

    let enhancedQuery = query;
    Object.entries(synonyms).forEach(([term, expansion]) => {
      if (query.toLowerCase().includes(term.toLowerCase())) {
        enhancedQuery += ` ${expansion}`;
      }
    });

    return enhancedQuery;
  }

  private getSearchMappings(): Record<string, SearchMapping> {
    const commonProperties = {
      id: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    };

    return {
      users: {
        properties: {
          ...commonProperties,
          name: {
            type: 'text',
            analyzer: 'standard',
            fields: { keyword: { type: 'keyword' } },
          },
          firstName: { type: 'text' },
          lastName: { type: 'text' },
          email: { type: 'keyword' },
          username: { type: 'keyword' },
          bio: { type: 'text', analyzer: 'standard' },
          skills: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          roles: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          location: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          isVerified: { type: 'boolean' },
          tags: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
        },
        settings: {
          analysis: {
            analyzer: {
              standard: {
                type: 'standard',
                stopwords: '_english_',
              },
            },
          },
          number_of_shards: 1,
          number_of_replicas: 0,
          refresh_interval: '1s',
        },
      },
      startups: {
        properties: {
          ...commonProperties,
          name: {
            type: 'text',
            analyzer: 'standard',
            fields: { keyword: { type: 'keyword' } },
          },
          title: {
            type: 'text',
            analyzer: 'standard',
            fields: { keyword: { type: 'keyword' } },
          },
          description: { type: 'text', analyzer: 'standard' },
          longDescription: { type: 'text', analyzer: 'standard' },
          industry: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          location: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          fundingStage: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          funding: { type: 'long' },
          employees: { type: 'integer' },
          skills: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          tags: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          isRemote: { type: 'boolean' },
          isVerified: { type: 'boolean' },
          foundedDate: { type: 'date' },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          refresh_interval: '1s',
        },
      },
      collaborations: {
        properties: {
          ...commonProperties,
          title: {
            type: 'text',
            analyzer: 'standard',
            fields: { keyword: { type: 'keyword' } },
          },
          description: { type: 'text', analyzer: 'standard' },
          role: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          type: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          status: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          skills: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          hoursPerWeek: { type: 'integer' },
          compensation: { type: 'long' },
          isRemote: { type: 'boolean' },
          startDate: { type: 'date' },
          endDate: { type: 'date' },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          refresh_interval: '1s',
        },
      },
      investments: {
        properties: {
          ...commonProperties,
          title: {
            type: 'text',
            analyzer: 'standard',
            fields: { keyword: { type: 'keyword' } },
          },
          description: { type: 'text', analyzer: 'standard' },
          amount: { type: 'long' },
          type: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          stage: {
            type: 'text',
            fields: { keyword: { type: 'keyword' } },
          },
          currency: { type: 'keyword' },
          valuation: { type: 'long' },
          equity: { type: 'float' },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          refresh_interval: '1s',
        },
      },
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}