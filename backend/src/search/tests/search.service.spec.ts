import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SearchService } from '../services/search.service';
import { User } from '../../users/entities/user.entity';
import { Startup } from '../../startups/entities/startup.entity';
import { Collaboration } from '../../collaborations/entities/collaboration.entity';
import { Investment } from '../../investments/entities/investment.entity';
import { SearchType, SearchEntity } from '../dto/search.dto';

describe('SearchService', () => {
  let service: SearchService;
  let elasticsearchService: ElasticsearchService;
  let mockClient: any;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    mockClient = {
      cluster: {
        health: jest.fn().mockResolvedValue({ status: 'green' }),
        stats: jest.fn().mockResolvedValue({
          indices: {
            count: 4,
            store: { size_in_bytes: 1024000 },
          },
        }),
      },
      indices: {
        exists: jest.fn().mockResolvedValue(false),
        create: jest.fn().mockResolvedValue({}),
        stats: jest.fn().mockResolvedValue({
          indices: {
            kolabolab_users: {
              total: {
                docs: { count: 100 },
                store: { size_in_bytes: 256000 },
              },
            },
            kolabolab_startups: {
              total: {
                docs: { count: 50 },
                store: { size_in_bytes: 128000 },
              },
            },
          },
        }),
      },
      search: jest.fn(),
      index: jest.fn().mockResolvedValue({ _id: 'test-id' }),
      delete: jest.fn().mockResolvedValue({ _id: 'test-id' }),
      bulk: jest.fn().mockResolvedValue({
        items: [
          { index: { _id: '1', status: 201 } },
          { index: { _id: '2', status: 201 } },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: ElasticsearchService,
          useValue: {
            ping: mockClient.cluster.health,
            search: mockClient.search,
            index: mockClient.index,
            delete: mockClient.delete,
            bulk: mockClient.bulk,
            indices: mockClient.indices,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                'elasticsearch.node': 'http://localhost:9200',
                'elasticsearch.requestTimeout': 30000,
                'elasticsearch.pingTimeout': 3000,
              };
              return config[key];
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Startup),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Collaboration),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Investment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize successfully', async () => {
      await service.onModuleInit();
      expect(mockClient.cluster.health).toHaveBeenCalled();
      expect(mockClient.indices.exists).toHaveBeenCalledTimes(4);
    });

    it('should create indices if they do not exist', async () => {
      mockClient.indices.exists.mockResolvedValue(false);
      await service.onModuleInit();
      expect(mockClient.indices.create).toHaveBeenCalledTimes(4);
    });
  });

  describe('search', () => {
    const mockSearchResponse = {
      hits: {
        hits: [
          {
            _id: '1',
            _score: 1.5,
            _source: { name: 'Test User', email: 'test@example.com' },
            highlight: { name: ['<mark>Test</mark> User'] },
          },
          {
            _id: '2',
            _score: 1.2,
            _source: { name: 'Another User', email: 'another@example.com' },
          },
        ],
        total: { value: 2, relation: 'eq' },
        max_score: 1.5,
      },
      took: 15,
      aggregations: {
        skills: {
          buckets: [
            { key: 'JavaScript', doc_count: 10 },
            { key: 'TypeScript', doc_count: 8 },
          ],
        },
      },
    };

    beforeEach(() => {
      mockClient.search.mockResolvedValue(mockSearchResponse);
    });

    it('should perform basic text search', async () => {
      const searchDto = {
        query: 'test query',
        type: SearchType.FULL_TEXT,
        entity: SearchEntity.USERS,
        limit: 20,
        offset: 0,
      };

      const result = await service.search(searchDto);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: ['kolabolab_users'],
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              must: expect.arrayContaining([
                expect.objectContaining({
                  multi_match: expect.objectContaining({
                    query: 'test query',
                    type: 'best_fields',
                  }),
                }),
              ]),
            }),
          }),
        }),
        size: 20,
        from: 0,
      });

      expect(result).toMatchObject({
        hits: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            score: 1.5,
            source: { name: 'Test User', email: 'test@example.com' },
            highlights: { name: ['<mark>Test</mark> User'] },
          }),
          expect.objectContaining({
            id: '2',
            score: 1.2,
            source: { name: 'Another User', email: 'another@example.com' },
          }),
        ]),
        total: { value: 2, relation: 'eq' },
        maxScore: 1.5,
        took: expect.any(Number),
        query: 'test query',
      });
    });

    it('should perform fuzzy search', async () => {
      const searchDto = {
        query: 'javscript', // intentional typo
        type: SearchType.FUZZY,
        entity: SearchEntity.ALL,
      };

      await service.search(searchDto);

      expect(mockClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            query: expect.objectContaining({
              bool: expect.objectContaining({
                must: expect.arrayContaining([
                  expect.objectContaining({
                    multi_match: expect.objectContaining({
                      query: 'javscript',
                      fuzziness: 2,
                      prefix_length: 1,
                    }),
                  }),
                ]),
              }),
            }),
          }),
        })
      );
    });

    it('should apply filters correctly', async () => {
      const searchDto = {
        query: 'developer',
        filters: {
          skills: ['JavaScript', 'TypeScript'],
          locations: ['Remote'],
          minFunding: 10000,
          maxFunding: 100000,
          verifiedOnly: true,
        },
      };

      await service.search(searchDto);

      const searchCall = mockClient.search.mock.calls[0][0];
      const query = searchCall.body.query.bool;

      expect(query.filter).toEqual(
        expect.arrayContaining([
          { terms: { 'skills.keyword': ['JavaScript', 'TypeScript'] } },
          { terms: { 'location.keyword': ['Remote'] } },
          { range: { funding: { gte: 10000, lte: 100000 } } },
          { term: { isVerified: true } },
        ])
      );
    });

    it('should include highlights when requested', async () => {
      const searchDto = {
        query: 'test',
        includeHighlights: true,
      };

      await service.search(searchDto);

      const searchCall = mockClient.search.mock.calls[0][0];
      expect(searchCall.body.highlight).toBeDefined();
      expect(searchCall.body.highlight.fields).toEqual({
        name: {},
        title: {},
        description: { fragment_size: 150, number_of_fragments: 3 },
        skills: {},
        tags: {},
      });
    });

    it('should include facets when requested', async () => {
      const searchDto = {
        query: 'test',
        includeFacets: true,
      };

      const result = await service.search(searchDto);

      const searchCall = mockClient.search.mock.calls[0][0];
      expect(searchCall.body.aggs).toBeDefined();
      expect(result.facets).toEqual({
        skills: [
          { key: 'JavaScript', count: 10 },
          { key: 'TypeScript', count: 8 },
        ],
      });
    });

    it('should handle search across all entities', async () => {
      const searchDto = {
        query: 'startup',
        entity: SearchEntity.ALL,
      };

      await service.search(searchDto);

      expect(mockClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          index: [
            'kolabolab_users',
            'kolabolab_startups',
            'kolabolab_collaborations',
            'kolabolab_investments',
          ],
        })
      );
    });
  });

  describe('semantic search', () => {
    it('should enhance query for semantic search', async () => {
      // Set up the mock response for semantic search
      mockClient.search.mockResolvedValue({
        hits: {
          hits: [
            {
              _id: '1',
              _score: 1.5,
              _source: { name: 'AI Developer', skills: ['machine learning'] },
            },
          ],
          total: { value: 1, relation: 'eq' },
          max_score: 1.5,
        },
        took: 10,
      });

      const searchDto = {
        query: 'AI developer',
        type: SearchType.SEMANTIC,
      };

      const result = await service.semanticSearch(searchDto);

      expect(result).toBeDefined();
      expect(result.hits).toHaveLength(1);
      expect(mockClient.search).toHaveBeenCalled();
    });

    it('should throw error for invalid search type', async () => {
      const searchDto = {
        query: 'test',
        type: SearchType.FULL_TEXT,
      };

      await expect(service.semanticSearch(searchDto)).rejects.toThrow(
        'Semantic search requires SEMANTIC or HYBRID search type'
      );
    });
  });

  describe('suggestions and autocomplete', () => {
    it('should provide search suggestions', async () => {
      const mockSuggestResponse = {
        suggest: {
          text_suggest: [
            {
              options: [
                { text: 'javascript' },
                { text: 'java' },
              ],
            },
          ],
          phrase_suggest: [
            {
              options: [
                { text: 'javascript developer' },
              ],
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockSuggestResponse);

      const result = await service.suggest({
        text: 'javs',
        entity: SearchEntity.USERS,
        limit: 5,
      });

      expect(result).toEqual(['javascript', 'java', 'javascript developer']);
    });

    it('should provide autocomplete suggestions', async () => {
      const mockAutocompleteResponse = {
        hits: {
          hits: [
            { _source: { name: 'JavaScript Developer' } },
            { _source: { name: 'Java Developer' } },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockAutocompleteResponse);

      const result = await service.autocomplete({
        query: 'java',
        field: 'name',
        limit: 5,
      });

      expect(result).toEqual(['JavaScript Developer', 'Java Developer']);
    });
  });

  describe('document indexing', () => {
    it('should index a document', async () => {
      const document = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      await service.indexDocument(SearchEntity.USERS, 'user-1', document);

      expect(mockClient.index).toHaveBeenCalledWith({
        index: 'kolabolab_users',
        id: 'user-1',
        body: expect.objectContaining({
          id: 'user-1',
          email: 'john@example.com',
        }),
        refresh: false,
      });
    });

    it('should remove a document', async () => {
      await service.removeDocument(SearchEntity.USERS, 'user-1');

      expect(mockClient.delete).toHaveBeenCalledWith({
        index: 'kolabolab_users',
        id: 'user-1',
      });
    });

    it('should handle document removal for non-existent document', async () => {
      mockClient.delete.mockRejectedValue({
        meta: { statusCode: 404 },
      });

      // Should not throw error for 404
      await expect(
        service.removeDocument(SearchEntity.USERS, 'non-existent')
      ).resolves.not.toThrow();
    });
  });

  describe('bulk operations', () => {
    beforeEach(() => {
      mockRepository.count.mockResolvedValue(100);
      mockRepository.find.mockResolvedValue([
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ]);
    });

    it('should perform bulk indexing', async () => {
      const result = await service.bulkIndex({
        entity: SearchEntity.USERS,
        batchSize: 50,
      });

      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockRepository.find).toHaveBeenCalled();
      expect(mockClient.bulk).toHaveBeenCalled();
      expect(result.success).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it('should handle bulk indexing errors', async () => {
      mockClient.bulk.mockResolvedValue({
        items: [
          { index: { _id: '1', status: 201 } },
          { index: { _id: '2', error: { reason: 'Index error' } } },
        ],
      });

      const result = await service.bulkIndex({
        entity: SearchEntity.USERS,
        batchSize: 50,
      });

      expect(result.success).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThan(0);
    });
  });

  describe('statistics', () => {
    it('should return search statistics', async () => {
      const stats = await service.getStats();

      expect(stats).toMatchObject({
        totalDocuments: expect.any(Number),
        totalIndices: 4,
        totalSize: expect.stringMatching(/\d+(\.\d+)?\s*KB/),
        indices: expect.objectContaining({
          users: expect.objectContaining({
            documentCount: 100,
            size: expect.stringMatching(/\d+(\.\d+)?\s*KB/),
            health: 'green',
          }),
          startups: expect.objectContaining({
            documentCount: 50,
            size: expect.stringMatching(/\d+(\.\d+)?\s*KB/),
            health: 'green',
          }),
        }),
        performance: expect.objectContaining({
          averageQueryTime: expect.any(Number),
          slowQueries: expect.any(Number),
          errorRate: expect.any(Number),
        }),
      });
    });
  });

  describe('error handling', () => {
    it('should handle Elasticsearch connection errors', async () => {
      mockClient.cluster.health.mockRejectedValue(new Error('Connection failed'));

      // The service catches errors and logs them, but doesn't rethrow
      await expect(service.onModuleInit()).resolves.not.toThrow();
      
      // Verify the error was logged (we can't easily test console output in this setup)
      expect(mockClient.cluster.health).toHaveBeenCalled();
    });

    it('should handle search errors gracefully', async () => {
      mockClient.search.mockRejectedValue(new Error('Search failed'));

      const searchDto = {
        query: 'test',
      };

      await expect(service.search(searchDto)).rejects.toThrow('Search failed');
    });
  });

  describe('document transformation', () => {
    it('should transform user document correctly', async () => {
      const userDoc = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: 'Software developer',
        skills: ['JavaScript', 'TypeScript'],
        created_at: new Date(),
      };

      await service.indexDocument(SearchEntity.USERS, 'user-1', userDoc);

      const indexCall = mockClient.index.mock.calls[0][0];
      expect(indexCall.body).toEqual(
        expect.objectContaining({
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          bio: 'Software developer',
          skills: ['JavaScript', 'TypeScript'],
        })
      );
    });

    it('should transform startup document correctly', async () => {
      const startupDoc = {
        id: 'startup-1',
        name: 'TechCorp',
        description: 'A tech company',
        industry: 'Technology',
        fundingStage: 'Series A',
        totalFunding: 1000000,
        created_at: new Date(),
      };

      await service.indexDocument(SearchEntity.STARTUPS, 'startup-1', startupDoc);

      const indexCall = mockClient.index.mock.calls[0][0];
      expect(indexCall.body).toEqual(
        expect.objectContaining({
          name: 'TechCorp',
          title: 'TechCorp',
          description: 'A tech company',
          industry: 'Technology',
          fundingStage: 'Series A',
          funding: 1000000,
        })
      );
    });
  });
});