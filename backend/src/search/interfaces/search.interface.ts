export interface SearchHit<T = any> {
  id: string;
  score: number;
  source: T;
  highlights?: Record<string, string[]>;
  explanation?: any;
}

export interface SearchFacet {
  key: string;
  count: number;
  selected?: boolean;
}

export interface SearchFacets {
  skills?: SearchFacet[];
  roles?: SearchFacet[];
  industries?: SearchFacet[];
  locations?: SearchFacet[];
  fundingStages?: SearchFacet[];
  tags?: SearchFacet[];
}

export interface SearchResult<T = any> {
  hits: SearchHit<T>[];
  total: {
    value: number;
    relation: 'eq' | 'gte';
  };
  maxScore: number;
  took: number;
  facets?: SearchFacets;
  suggestions?: string[];
  query: string;
  filters?: Record<string, any>;
}

export interface SearchMapping {
  properties: Record<string, any>;
  settings?: {
    analysis?: any;
    number_of_shards?: number;
    number_of_replicas?: number;
    refresh_interval?: string;
  };
}

export interface IndexableDocument {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface SearchStats {
  totalDocuments: number;
  totalIndices: number;
  totalSize: string;
  indices: Record<string, {
    documentCount: number;
    size: string;
    health: 'green' | 'yellow' | 'red';
  }>;
  performance: {
    averageQueryTime: number;
    slowQueries: number;
    errorRate: number;
  };
}

export interface VectorSearchQuery {
  vector: number[];
  field: string;
  k: number;
  numCandidates?: number;
  filter?: any;
}

export interface SemanticSearchOptions {
  modelName?: string;
  threshold?: number;
  boostFields?: Record<string, number>;
  hybridWeight?: number;
}