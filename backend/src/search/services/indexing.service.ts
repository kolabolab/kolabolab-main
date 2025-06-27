import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';
import { SearchEntity } from '../dto/search.dto';

export interface EntityChangeEvent {
  entity: SearchEntity;
  action: 'create' | 'update' | 'delete';
  id: string;
  data?: any;
  previousData?: any;
}

@Injectable()
export class IndexingService implements OnModuleInit {
  private readonly logger = new Logger(IndexingService.name);
  private readonly isIndexingEnabled: boolean;
  private readonly batchSize: number;
  private readonly maxRetries: number;

  private readonly indexingQueue: Map<string, EntityChangeEvent> = new Map();
  private isProcessingQueue = false;

  constructor(
    private readonly searchService: SearchService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.isIndexingEnabled = this.configService.get('SEARCH_INDEXING_ENABLED', 'true') === 'true';
    this.batchSize = parseInt(this.configService.get('SEARCH_BATCH_SIZE', '100'));
    this.maxRetries = parseInt(this.configService.get('SEARCH_MAX_RETRIES', '3'));
  }

  async onModuleInit() {
    if (this.isIndexingEnabled) {
      this.logger.log('Search indexing service initialized');
      // Start processing queue immediately
      this.processIndexingQueue();
    } else {
      this.logger.log('Search indexing is disabled');
    }
  }

  // Event listeners for entity changes
  @OnEvent('user.created')
  async handleUserCreated(event: { id: string; data: any }) {
    await this.queueIndexing({
      entity: SearchEntity.USERS,
      action: 'create',
      id: event.id,
      data: event.data,
    });
  }

  @OnEvent('user.updated')
  async handleUserUpdated(event: { id: string; data: any; previousData?: any }) {
    await this.queueIndexing({
      entity: SearchEntity.USERS,
      action: 'update',
      id: event.id,
      data: event.data,
      previousData: event.previousData,
    });
  }

  @OnEvent('user.deleted')
  async handleUserDeleted(event: { id: string }) {
    await this.queueIndexing({
      entity: SearchEntity.USERS,
      action: 'delete',
      id: event.id,
    });
  }

  @OnEvent('startup.created')
  async handleStartupCreated(event: { id: string; data: any }) {
    await this.queueIndexing({
      entity: SearchEntity.STARTUPS,
      action: 'create',
      id: event.id,
      data: event.data,
    });
  }

  @OnEvent('startup.updated')
  async handleStartupUpdated(event: { id: string; data: any; previousData?: any }) {
    await this.queueIndexing({
      entity: SearchEntity.STARTUPS,
      action: 'update',
      id: event.id,
      data: event.data,
      previousData: event.previousData,
    });
  }

  @OnEvent('startup.deleted')
  async handleStartupDeleted(event: { id: string }) {
    await this.queueIndexing({
      entity: SearchEntity.STARTUPS,
      action: 'delete',
      id: event.id,
    });
  }

  @OnEvent('collaboration.created')
  async handleCollaborationCreated(event: { id: string; data: any }) {
    await this.queueIndexing({
      entity: SearchEntity.COLLABORATIONS,
      action: 'create',
      id: event.id,
      data: event.data,
    });
  }

  @OnEvent('collaboration.updated')
  async handleCollaborationUpdated(event: { id: string; data: any; previousData?: any }) {
    await this.queueIndexing({
      entity: SearchEntity.COLLABORATIONS,
      action: 'update',
      id: event.id,
      data: event.data,
      previousData: event.previousData,
    });
  }

  @OnEvent('collaboration.deleted')
  async handleCollaborationDeleted(event: { id: string }) {
    await this.queueIndexing({
      entity: SearchEntity.COLLABORATIONS,
      action: 'delete',
      id: event.id,
    });
  }

  @OnEvent('investment.created')
  async handleInvestmentCreated(event: { id: string; data: any }) {
    await this.queueIndexing({
      entity: SearchEntity.INVESTMENTS,
      action: 'create',
      id: event.id,
      data: event.data,
    });
  }

  @OnEvent('investment.updated')
  async handleInvestmentUpdated(event: { id: string; data: any; previousData?: any }) {
    await this.queueIndexing({
      entity: SearchEntity.INVESTMENTS,
      action: 'update',
      id: event.id,
      data: event.data,
      previousData: event.previousData,
    });
  }

  @OnEvent('investment.deleted')
  async handleInvestmentDeleted(event: { id: string }) {
    await this.queueIndexing({
      entity: SearchEntity.INVESTMENTS,
      action: 'delete',
      id: event.id,
    });
  }

  // Cron job to process indexing queue periodically
  @Cron(CronExpression.EVERY_30_SECONDS)
  async processIndexingQueue() {
    if (!this.isIndexingEnabled || this.isProcessingQueue || this.indexingQueue.size === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      const queueSize = this.indexingQueue.size;
      this.logger.debug(`Processing indexing queue: ${queueSize} items`);

      // Process items in batches
      const items = Array.from(this.indexingQueue.entries());
      const batches = this.chunkArray(items, this.batchSize);

      for (const batch of batches) {
        await this.processBatch(batch);
      }

      // Clear processed items
      this.indexingQueue.clear();

      this.logger.debug(`Indexing queue processed: ${queueSize} items`);
    } catch (error) {
      this.logger.error('Error processing indexing queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Manual queue processing for immediate indexing
  async forceProcessQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      this.logger.warn('Queue is already being processed');
      return;
    }

    await this.processIndexingQueue();
  }

  // Queue an indexing operation
  private async queueIndexing(event: EntityChangeEvent): Promise<void> {
    if (!this.isIndexingEnabled) {
      return;
    }

    const key = `${event.entity}:${event.id}`;
    
    // If there's already a pending operation for this entity, merge them
    const existing = this.indexingQueue.get(key);
    if (existing) {
      // For updates, keep the latest data
      if (event.action === 'update' && existing.action !== 'delete') {
        event.previousData = existing.previousData || existing.data;
      }
      // Delete operations always take precedence
      if (event.action === 'delete' || existing.action === 'delete') {
        event.action = 'delete';
      }
    }

    this.indexingQueue.set(key, event);
    
    this.logger.debug(`Queued indexing operation: ${event.entity}:${event.action}:${event.id}`);

    // If queue is getting large, process immediately
    if (this.indexingQueue.size >= this.batchSize * 2) {
      setImmediate(() => this.processIndexingQueue());
    }
  }

  // Process a batch of indexing operations
  private async processBatch(batch: Array<[string, EntityChangeEvent]>): Promise<void> {
    const promises = batch.map(([key, event]) => this.processIndexingEvent(event));
    await Promise.allSettled(promises);
  }

  // Process a single indexing event
  private async processIndexingEvent(event: EntityChangeEvent, retryCount = 0): Promise<void> {
    try {
      switch (event.action) {
        case 'create':
        case 'update':
          if (event.data) {
            await this.searchService.indexDocument(
              event.entity,
              event.id,
              event.data,
              false // Don't refresh immediately for performance
            );
            this.logger.debug(`Indexed ${event.entity}:${event.id}`);
          }
          break;

        case 'delete':
          await this.searchService.removeDocument(event.entity, event.id);
          this.logger.debug(`Removed from index ${event.entity}:${event.id}`);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to process indexing event ${event.entity}:${event.action}:${event.id}:`, error);

      // Retry logic
      if (retryCount < this.maxRetries) {
        this.logger.debug(`Retrying indexing operation (${retryCount + 1}/${this.maxRetries})`);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        await this.processIndexingEvent(event, retryCount + 1);
      } else {
        this.logger.error(`Max retries reached for indexing operation ${event.entity}:${event.action}:${event.id}`);
        // Could emit a dead letter queue event here for manual handling
        this.eventEmitter.emit('indexing.failed', {
          event,
          error: error.message,
          retriesExhausted: true,
        });
      }
    }
  }

  // Utility methods
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check and stats
  getQueueStats(): {
    queueSize: number;
    isProcessing: boolean;
    isEnabled: boolean;
    batchSize: number;
    maxRetries: number;
  } {
    return {
      queueSize: this.indexingQueue.size,
      isProcessing: this.isProcessingQueue,
      isEnabled: this.isIndexingEnabled,
      batchSize: this.batchSize,
      maxRetries: this.maxRetries,
    };
  }

  // Manual reindex operations
  async reindexEntity(entity: SearchEntity): Promise<{ success: number; failed: number }> {
    this.logger.log(`Starting manual reindex for ${entity}`);
    
    return await this.searchService.bulkIndex({
      entity,
      force: true,
      batchSize: this.batchSize,
    });
  }

  async reindexAll(): Promise<Record<string, { success: number; failed: number }>> {
    this.logger.log('Starting manual reindex for all entities');
    
    const entities = [
      SearchEntity.USERS,
      SearchEntity.STARTUPS,
      SearchEntity.COLLABORATIONS,
      SearchEntity.INVESTMENTS,
    ];

    const results: Record<string, { success: number; failed: number }> = {};

    for (const entity of entities) {
      try {
        results[entity] = await this.reindexEntity(entity);
      } catch (error) {
        this.logger.error(`Failed to reindex ${entity}:`, error);
        results[entity] = { success: 0, failed: 1 };
      }
    }

    return results;
  }

  // Enable/disable indexing at runtime
  enableIndexing(): void {
    // Note: This would require updating the config service or using a different approach
    this.logger.log('Indexing enabled');
  }

  disableIndexing(): void {
    // Note: This would require updating the config service or using a different approach
    this.logger.log('Indexing disabled');
  }

  // Clear the queue (useful for testing or emergency situations)
  clearQueue(): void {
    const clearedCount = this.indexingQueue.size;
    this.indexingQueue.clear();
    this.logger.log(`Cleared indexing queue: ${clearedCount} items removed`);
  }
}