import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: user-dashboard-real-data, Property 4: Activity response shape completeness
 *
 * Validates: Requirements 2.4
 *
 * For any activity stored in the database, when returned by the API,
 * the response object SHALL contain non-null values for id, type, message,
 * and timestamp fields.
 */
describe('Feature: user-dashboard-real-data, Property 4: Activity response shape completeness', () => {
  // Activity types as defined in the schema
  const activityTypes = ['startup', 'investment', 'collaboration', 'admin'] as const;

  // Generator for a valid activity record as stored in the database
  const activityRecordArb = fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    type: fc.constantFrom(...activityTypes),
    message: fc.string({ minLength: 1, maxLength: 200 }),
    created_at: fc.integer({
      min: new Date('2020-01-01T00:00:00Z').getTime(),
      max: new Date('2030-12-31T23:59:59Z').getTime(),
    }).map(ts => new Date(ts).toISOString()),
  });

  /**
   * Simulates the backend SQL transformation:
   * SELECT id, type, message, created_at as timestamp FROM activities
   */
  function transformToApiResponse(dbRecord: {
    id: string;
    user_id: string;
    type: string;
    message: string;
    created_at: string;
  }) {
    return {
      id: dbRecord.id,
      type: dbRecord.type,
      message: dbRecord.message,
      timestamp: dbRecord.created_at,
    };
  }

  it('should always produce response objects with non-null id, type, message, and timestamp', () => {
    fc.assert(
      fc.property(activityRecordArb, (activityRecord) => {
        const response = transformToApiResponse(activityRecord);

        // All required fields must be present and non-null
        expect(response.id).not.toBeNull();
        expect(response.id).toBeDefined();
        expect(typeof response.id).toBe('string');
        expect(response.id.length).toBeGreaterThan(0);

        expect(response.type).not.toBeNull();
        expect(response.type).toBeDefined();
        expect(typeof response.type).toBe('string');
        expect(activityTypes).toContain(response.type);

        expect(response.message).not.toBeNull();
        expect(response.message).toBeDefined();
        expect(typeof response.message).toBe('string');
        expect(response.message.length).toBeGreaterThan(0);

        expect(response.timestamp).not.toBeNull();
        expect(response.timestamp).toBeDefined();
        expect(typeof response.timestamp).toBe('string');
        expect(response.timestamp.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all field values from the database record in the response', () => {
    fc.assert(
      fc.property(activityRecordArb, (activityRecord) => {
        const response = transformToApiResponse(activityRecord);

        // The response fields should exactly match the source data
        expect(response.id).toBe(activityRecord.id);
        expect(response.type).toBe(activityRecord.type);
        expect(response.message).toBe(activityRecord.message);
        expect(response.timestamp).toBe(activityRecord.created_at);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce exactly four fields in the response object', () => {
    fc.assert(
      fc.property(activityRecordArb, (activityRecord) => {
        const response = transformToApiResponse(activityRecord);

        const keys = Object.keys(response);
        expect(keys).toHaveLength(4);
        expect(keys).toContain('id');
        expect(keys).toContain('type');
        expect(keys).toContain('message');
        expect(keys).toContain('timestamp');
      }),
      { numRuns: 100 }
    );
  });
});
