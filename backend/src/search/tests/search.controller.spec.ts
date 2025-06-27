import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SearchController } from '../controllers/search.controller';
import { SearchService } from '../services/search.service';
import { SearchType, SearchEntity, SortOrder } from '../dto/search.dto';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  const mockSearchService = {
    search: jest.fn(),
    semanticSearch: jest.fn(),
    suggest: jest.fn(),
    autocomplete: jest.fn(),
    getStats: jest.fn(),
    indexDocument: jest.fn(),
    bulkIndex: jest.fn(),
    removeDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    const mockSearchResult = {
      hits: [
        {
          id: '1',
          score: 1.5,
          source: { name: 'Test User' },
          highlights: { name: ['<mark>Test</mark> User'] },
        },
      ],
      total: { value: 1, relation: 'eq' },
      maxScore: 1.5,
      took: 15,
      query: 'test',
    };

    it('should perform basic search', async () => {
      mockSearchService.search.mockResolvedValue(mockSearchResult);

      const searchDto = {
        query: 'test',
        type: SearchType.FULL_TEXT,
        entity: SearchEntity.USERS,
        limit: 20,
        offset: 0,
      };

      const result = await controller.search(searchDto);

      expect(searchService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResult);
    });

    it('should handle search errors', async () => {
      mockSearchService.search.mockRejectedValue(new Error('Search failed'));

      const searchDto = {
        query: 'test',
      };

      await expect(controller.search(searchDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('advancedSearch', () => {
    it('should perform advanced search with filters', async () => {
      const mockResult = { hits: [], total: { value: 0, relation: 'eq' } };
      mockSearchService.search.mockResolvedValue(mockResult);

      const searchDto = {
        query: 'developer',
        filters: {
          skills: ['JavaScript'],
          locations: ['Remote'],
        },
        sort: {
          field: 'createdAt',
          order: SortOrder.DESC,
        },
      };

      const result = await controller.advancedSearch(searchDto);

      expect(searchService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('semanticSearch', () => {
    it('should perform semantic search', async () => {
      const mockResult = { hits: [], total: { value: 0, relation: 'eq' } };
      mockSearchService.semanticSearch.mockResolvedValue(mockResult);

      const searchDto = {
        query: 'AI developer',
      };

      const result = await controller.semanticSearch(searchDto);

      expect(searchService.semanticSearch).toHaveBeenCalledWith({
        ...searchDto,
        type: SearchType.SEMANTIC,
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle semantic search errors', async () => {
      mockSearchService.semanticSearch.mockRejectedValue(new Error('Semantic search failed'));

      const searchDto = {
        query: 'test',
      };

      await expect(controller.semanticSearch(searchDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('suggest', () => {
    it('should return search suggestions', async () => {
      const mockSuggestions = ['javascript', 'java', 'python'];
      mockSearchService.suggest.mockResolvedValue(mockSuggestions);

      const suggestDto = {
        text: 'jav',
        entity: SearchEntity.USERS,
        limit: 5,
      };

      const result = await controller.suggest(suggestDto);

      expect(searchService.suggest).toHaveBeenCalledWith(suggestDto);
      expect(result).toEqual(mockSuggestions);
    });

    it('should handle suggest errors gracefully', async () => {
      mockSearchService.suggest.mockRejectedValue(new Error('Suggest failed'));

      const suggestDto = {
        text: 'test',
      };

      const result = await controller.suggest(suggestDto);

      expect(result).toEqual([]);
    });
  });

  describe('autocomplete', () => {
    it('should return autocomplete suggestions', async () => {
      const mockCompletions = ['JavaScript Developer', 'Java Developer'];
      mockSearchService.autocomplete.mockResolvedValue(mockCompletions);

      const autocompleteDto = {
        query: 'java',
        field: 'name',
        limit: 5,
      };

      const result = await controller.autocomplete(autocompleteDto);

      expect(searchService.autocomplete).toHaveBeenCalledWith(autocompleteDto);
      expect(result).toEqual(mockCompletions);
    });

    it('should handle autocomplete errors gracefully', async () => {
      mockSearchService.autocomplete.mockRejectedValue(new Error('Autocomplete failed'));

      const autocompleteDto = {
        query: 'test',
      };

      const result = await controller.autocomplete(autocompleteDto);

      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return search statistics', async () => {
      const mockStats = {
        totalDocuments: 1000,
        totalIndices: 4,
        totalSize: '1.5 GB',
        indices: {
          users: { documentCount: 500, size: '750 MB', health: 'green' },
          startups: { documentCount: 300, size: '450 MB', health: 'green' },
        },
        performance: {
          averageQueryTime: 25,
          slowQueries: 2,
          errorRate: 0.01,
        },
      };

      mockSearchService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(searchService.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    it('should handle stats errors', async () => {
      mockSearchService.getStats.mockRejectedValue(new Error('Stats failed'));

      await expect(controller.getStats()).rejects.toThrow(BadRequestException);
    });
  });

  describe('indexDocument', () => {
    it('should index a document', async () => {
      mockSearchService.indexDocument.mockResolvedValue(undefined);

      const body = {
        id: 'user-1',
        document: { name: 'John Doe', email: 'john@example.com' },
        refresh: true,
      };

      const result = await controller.indexDocument(SearchEntity.USERS, body);

      expect(searchService.indexDocument).toHaveBeenCalledWith(
        SearchEntity.USERS,
        'user-1',
        body.document,
        true
      );
      expect(result).toEqual({ message: 'Document indexed successfully' });
    });

    it('should handle indexing errors', async () => {
      mockSearchService.indexDocument.mockRejectedValue(new Error('Index failed'));

      const body = {
        id: 'user-1',
        document: { name: 'John Doe' },
      };

      await expect(
        controller.indexDocument(SearchEntity.USERS, body)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkIndex', () => {
    it('should perform bulk indexing', async () => {
      const mockResult = { success: 100, failed: 0 };
      mockSearchService.bulkIndex.mockResolvedValue(mockResult);

      const bulkIndexDto = {
        entity: SearchEntity.USERS,
        batchSize: 100,
        force: true,
      };

      const result = await controller.bulkIndex(bulkIndexDto);

      expect(searchService.bulkIndex).toHaveBeenCalledWith(bulkIndexDto);
      expect(result).toEqual({
        success: 100,
        failed: 0,
        message: 'Bulk index completed: 100 success, 0 failed',
      });
    });

    it('should handle bulk index errors', async () => {
      mockSearchService.bulkIndex.mockRejectedValue(new Error('Bulk index failed'));

      const bulkIndexDto = {
        entity: SearchEntity.USERS,
      };

      await expect(controller.bulkIndex(bulkIndexDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('reindexAll', () => {
    it('should reindex all entities', async () => {
      mockSearchService.bulkIndex
        .mockResolvedValueOnce({ success: 100, failed: 0 }) // users
        .mockResolvedValueOnce({ success: 50, failed: 1 })  // startups
        .mockResolvedValueOnce({ success: 25, failed: 0 })  // collaborations
        .mockResolvedValueOnce({ success: 10, failed: 0 }); // investments

      const result = await controller.reindexAll();

      expect(searchService.bulkIndex).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        results: [
          { entity: SearchEntity.USERS, success: 100, failed: 0 },
          { entity: SearchEntity.STARTUPS, success: 50, failed: 1 },
          { entity: SearchEntity.COLLABORATIONS, success: 25, failed: 0 },
          { entity: SearchEntity.INVESTMENTS, success: 10, failed: 0 },
        ],
        totalSuccess: 185,
        totalFailed: 1,
        message: 'Reindex completed: 185 total success, 1 total failed',
      });
    });

    it('should handle partial failures during reindex', async () => {
      mockSearchService.bulkIndex
        .mockResolvedValueOnce({ success: 100, failed: 0 })
        .mockRejectedValueOnce(new Error('Startup index failed'))
        .mockResolvedValueOnce({ success: 25, failed: 0 })
        .mockResolvedValueOnce({ success: 10, failed: 0 });

      const result = await controller.reindexAll();

      expect(result.totalSuccess).toBe(135);
      expect(result.totalFailed).toBe(1);
      expect(result.results[1]).toEqual({
        entity: SearchEntity.STARTUPS,
        success: 0,
        failed: 1,
      });
    });
  });

  describe('getHealth', () => {
    it('should return healthy status when search service is working', async () => {
      const mockStats = {
        totalDocuments: 1000,
        totalIndices: 4,
        indices: {},
        performance: {},
      };
      mockSearchService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getHealth();

      expect(result.status).toBe('healthy');
      expect(result.elasticsearch.connected).toBe(true);
      expect(result.indices.total).toBe(4);
      expect(result.indices.healthy).toBe(4);
    });

    it('should return unhealthy status when search service fails', async () => {
      mockSearchService.getStats.mockRejectedValue(new Error('Service unavailable'));

      const result = await controller.getHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.elasticsearch.connected).toBe(false);
      expect(result.indices.total).toBe(0);
      expect(result.indices.missing).toEqual(['all']);
    });
  });
});