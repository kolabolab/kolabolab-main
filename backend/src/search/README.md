# KolaboLab Search Engine

A comprehensive, production-ready search engine implementation using Elasticsearch, designed for the KolaboLab platform to enable powerful search capabilities across users, startups, collaborations, and investments.

## 🚀 Features

### Core Search Types
- **Full-text Search**: Traditional keyword-based search with relevance scoring
- **Fuzzy Search**: Handles typos and approximate matching
- **Semantic Search**: Enhanced text matching with synonyms and context understanding
- **Hybrid Search**: Combines multiple search techniques for optimal results

### Advanced Capabilities
- **Multi-entity Search**: Search across users, startups, collaborations, and investments
- **Faceted Search**: Filter results by skills, location, industry, funding stage, etc.
- **Autocomplete & Suggestions**: Real-time search assistance
- **Search Highlighting**: Highlight matching terms in results
- **Pagination & Sorting**: Efficient result navigation
- **Real-time Indexing**: Automatic document synchronization via event-driven architecture

### Production Features
- **Health Monitoring**: Comprehensive health checks and statistics
- **Bulk Operations**: Efficient batch indexing and reindexing
- **Error Handling**: Robust error recovery and retry mechanisms
- **Performance Optimization**: Optimized mappings and query structures
- **Security**: Production-ready authentication and SSL/TLS support

## 🏗️ Architecture

### Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Controllers   │────│    Services      │────│  Elasticsearch  │
│                 │    │                  │    │                 │
│ SearchController│    │ SearchService    │    │ Index Mappings  │
│                 │    │ IndexingService  │    │ Query DSL       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│      DTOs       │    │   Event System   │    │   Data Stores   │
│                 │    │                  │    │                 │
│ SearchDto       │    │ Entity Events    │    │ PostgreSQL      │
│ FilterDto       │    │ IndexingQueue    │    │ TypeORM         │
│ AutocompleteDto │    │ Cron Jobs        │    │ Entity Repos    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

1. **Search Request** → Controller validates input using DTOs
2. **Query Building** → Service constructs Elasticsearch DSL query
3. **Search Execution** → Elasticsearch processes the query
4. **Result Processing** → Transform and format results
5. **Response** → Return structured search results

### Indexing Flow

1. **Entity Change** → Database operation triggers event
2. **Event Handler** → IndexingService captures the event
3. **Queue Processing** → Batch operations for efficiency
4. **Document Transform** → Convert entity to search document
5. **Index Update** → Update Elasticsearch index

## 📚 API Reference

### Search Endpoints

#### Basic Search
```http
GET /api/search?query=developer&entity=users&limit=20
```

**Parameters:**
- `query` (required): Search query string
- `type`: Search type (full_text, fuzzy, semantic, hybrid)
- `entity`: Entity type (users, startups, collaborations, investments, all)
- `limit`: Results per page (1-100, default: 20)
- `offset`: Pagination offset (default: 0)
- `includeHighlights`: Include search highlights (default: true)
- `includeFacets`: Include search facets (default: false)
- `minScore`: Minimum relevance score (0-1, default: 0.1)

#### Advanced Search
```http
POST /api/search/advanced
Content-Type: application/json

{
  "query": "React developer",
  "type": "hybrid",
  "entity": "users",
  "filters": {
    "skills": ["React", "JavaScript"],
    "locations": ["Remote", "San Francisco"],
    "verifiedOnly": true,
    "minFunding": 10000,
    "maxFunding": 1000000
  },
  "sort": {
    "field": "createdAt",
    "order": "desc"
  },
  "limit": 50,
  "includeHighlights": true,
  "includeFacets": true
}
```

#### Semantic Search
```http
POST /api/search/semantic
Content-Type: application/json

{
  "query": "AI startup looking for machine learning engineer",
  "entity": "startups",
  "limit": 10
}
```

#### Suggestions
```http
GET /api/search/suggest?text=javs&entity=users&limit=5
```

#### Autocomplete
```http
GET /api/search/autocomplete?query=java&field=name&limit=5
```

### Administrative Endpoints

#### Search Statistics
```http
GET /api/search/stats
Authorization: Bearer <jwt-token>
```

#### Bulk Index
```http
POST /api/search/bulk-index
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "entity": "users",
  "batchSize": 1000,
  "force": true
}
```

#### Reindex All
```http
POST /api/search/reindex-all
Authorization: Bearer <jwt-token>
```

#### Health Check
```http
GET /api/search/health
```

## 🔧 Configuration

### Environment Variables

#### Development
```bash
# Elasticsearch Configuration
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_PROTOCOL=http

# Search Settings
SEARCH_INDEXING_ENABLED=true
SEARCH_BATCH_SIZE=100
SEARCH_MAX_RETRIES=3
```

#### Production
```bash
# Elasticsearch Configuration
ELASTICSEARCH_HOST=elasticsearch-cluster.example.com
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_PROTOCOL=https
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-secure-password
ELASTICSEARCH_CA_CERT=/path/to/ca.crt
ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED=true

# Advanced Settings
ELASTICSEARCH_REQUEST_TIMEOUT=60000
ELASTICSEARCH_PING_TIMEOUT=5000
ELASTICSEARCH_SNIFF_ON_START=true
ELASTICSEARCH_SNIFF_INTERVAL=300000
ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT=true
ELASTICSEARCH_MAX_RETRIES=5
ELASTICSEARCH_RETRY_DELAY=2000

# Search Settings
SEARCH_INDEXING_ENABLED=true
SEARCH_BATCH_SIZE=1000
SEARCH_MAX_RETRIES=5
```

### Docker Configuration

#### Development
```yaml
# docker-compose.yml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
    - "ES_JAVA_OPTS=-Xms1024m -Xmx1024m"
```

#### Production
```yaml
# docker-compose.prod.yml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  environment:
    - cluster.name=kolabolab-cluster-prod
    - xpack.security.enabled=true
    - xpack.security.http.ssl.enabled=true
    - "ES_JAVA_OPTS=-Xms2048m -Xmx2048m"
    - ELASTIC_PASSWORD=${ELASTICSEARCH_PASSWORD}
```

## 🏃‍♂️ Getting Started

### 1. Start Elasticsearch
```bash
# Development
docker-compose up elasticsearch

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up elasticsearch
```

### 2. Start Backend Service
```bash
# The search module will automatically:
# - Connect to Elasticsearch
# - Create indices if they don't exist
# - Initialize mappings
# - Start the indexing service

npm run start:dev
```

### 3. Initial Data Indexing
```bash
# Index all existing data
curl -X POST http://localhost:3001/api/search/reindex-all \
  -H "Authorization: Bearer <jwt-token>"
```

### 4. Test Search Functionality
```bash
# Basic search
curl "http://localhost:3001/api/search?query=developer&entity=users"

# Health check
curl "http://localhost:3001/api/search/health"
```

## 📊 Index Mappings

### Users Index
```json
{
  "mappings": {
    "properties": {
      "name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "email": { "type": "keyword" },
      "bio": { "type": "text" },
      "skills": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "location": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "isVerified": { "type": "boolean" },
      "createdAt": { "type": "date" }
    }
  }
}
```

### Startups Index
```json
{
  "mappings": {
    "properties": {
      "name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "description": { "type": "text" },
      "industry": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "fundingStage": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "funding": { "type": "long" },
      "skills": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "location": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "isVerified": { "type": "boolean" },
      "createdAt": { "type": "date" }
    }
  }
}
```

## 🔍 Query Examples

### Full-text Search with Filters
```javascript
const searchResult = await searchService.search({
  query: "React developer with startup experience",
  type: SearchType.FULL_TEXT,
  entity: SearchEntity.USERS,
  filters: {
    skills: ["React", "JavaScript", "TypeScript"],
    locations: ["Remote", "San Francisco", "New York"],
    verifiedOnly: true
  },
  sort: {
    field: "createdAt",
    order: "desc"
  },
  limit: 20,
  includeHighlights: true,
  includeFacets: true
});
```

### Semantic Search
```javascript
const semanticResult = await searchService.semanticSearch({
  query: "AI startup seeking machine learning talent",
  type: SearchType.SEMANTIC,
  entity: SearchEntity.ALL,
  limit: 10
});
```

### Autocomplete
```javascript
const suggestions = await searchService.autocomplete({
  query: "java",
  field: "skills",
  entity: SearchEntity.USERS,
  limit: 5
});
// Returns: ["JavaScript", "Java", "JavaFX"]
```

## 📈 Performance Optimization

### Index Settings
- **Shards**: Single shard for small datasets, multiple for large
- **Replicas**: 0 for development, 1+ for production
- **Refresh Interval**: 1s for real-time, 30s for batch processing
- **Memory**: Minimum 1GB heap, 2GB+ for production

### Query Optimization
- **Field Boosting**: Prioritize important fields (name^3, title^3)
- **Filter Context**: Use filters for exact matches (better caching)
- **Query Context**: Use queries for relevance scoring
- **Pagination**: Use `from/size` for small datasets, search_after for large

### Indexing Optimization
- **Batch Processing**: Process documents in batches of 100-1000
- **Async Indexing**: Use event-driven architecture for real-time updates
- **Refresh Strategy**: Balance between real-time and performance
- **Bulk Operations**: Use bulk API for multiple document operations

## 🛠️ Troubleshooting

### Common Issues

#### Elasticsearch Connection Failed
```bash
# Check if Elasticsearch is running
curl http://localhost:9200/_cluster/health

# Check container logs
docker logs kolabolab_elasticsearch
```

#### Index Creation Failed
```bash
# Check index status
curl http://localhost:9200/_cat/indices?v

# Delete and recreate indices
curl -X DELETE http://localhost:9200/kolabolab_*
curl -X POST http://localhost:3001/api/search/reindex-all
```

#### Poor Search Performance
- Increase Elasticsearch heap size
- Add more replicas for read-heavy workloads
- Optimize query structure and mappings
- Use pagination instead of large result sets

#### Memory Issues
```bash
# Check Elasticsearch memory usage
curl http://localhost:9200/_nodes/stats/jvm

# Adjust heap size in docker-compose.yml
ES_JAVA_OPTS=-Xms2048m -Xmx2048m
```

### Monitoring

#### Health Check
```bash
curl http://localhost:3001/api/search/health
```

#### Search Statistics
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/search/stats
```

#### Elasticsearch Cluster Stats
```bash
curl http://localhost:9200/_cluster/stats?pretty
```

## 🔒 Security

### Production Security Checklist
- ✅ Enable TLS/SSL encryption
- ✅ Configure authentication (username/password)
- ✅ Set up proper firewall rules
- ✅ Use secure certificates
- ✅ Implement API rate limiting
- ✅ Validate all search inputs
- ✅ Monitor for security events

### Access Control
- **Public Endpoints**: Search, suggest, autocomplete, health
- **Authenticated Endpoints**: Stats, bulk operations, reindexing
- **Input Validation**: All DTOs use class-validator
- **Rate Limiting**: Configured in app module (100 requests/minute)

## 📝 Best Practices

### Search UX
1. **Autocomplete**: Implement for better user experience
2. **Faceted Navigation**: Show available filters based on results
3. **Search History**: Store and suggest previous searches
4. **Result Highlighting**: Show why documents matched
5. **Pagination**: Use infinite scroll or traditional pagination

### Performance
1. **Caching**: Cache frequent queries using Redis
2. **Debouncing**: Debounce autocomplete requests
3. **Progressive Enhancement**: Start with basic search, add features
4. **Monitoring**: Track search performance and user behavior

### Data Quality
1. **Clean Data**: Ensure high-quality indexed data
2. **Synonyms**: Maintain synonym dictionaries
3. **Stop Words**: Configure appropriate stop word lists
4. **Analyzers**: Use appropriate text analyzers for different fields

## 🚀 Future Enhancements

### Planned Features
- **Vector Search**: True semantic search using embeddings
- **Machine Learning**: Personalized search rankings
- **Analytics**: Detailed search analytics and insights
- **A/B Testing**: Search algorithm optimization
- **Geo Search**: Location-based search capabilities
- **Multi-language**: Support for international users

### Scalability Improvements
- **Distributed Architecture**: Multi-node Elasticsearch cluster
- **Data Partitioning**: Shard data by entity type or date
- **Read Replicas**: Separate read/write clusters
- **CDN Integration**: Cache search results globally

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Elasticsearch logs: `docker logs kolabolab_elasticsearch`
3. Check application logs for search-related errors
4. Verify configuration and environment variables
5. Test with simple queries first, then complex ones

## 📄 License

This search implementation is part of the KolaboLab platform and follows the same licensing terms.