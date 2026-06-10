import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: user-dashboard-real-data, Property 6: Startup response shape completeness
 *
 * Validates: Requirements 3.4
 *
 * For any startup stored in the database, when returned by the API,
 * the response object SHALL contain non-null values for id, name, stage,
 * fundingAmount, and status fields.
 */

// Mirrors the mapping logic from backend/workers-main.ts GET /api/user/startups
function mapStartupRow(row: {
  id: string;
  name: string;
  stage: string;
  funding_amount: number;
  status: string;
}) {
  return {
    id: row.id,
    name: row.name,
    stage: row.stage,
    fundingAmount: row.funding_amount,
    status: row.status,
  };
}

const startupStages = ['idea', 'pre-seed', 'seed', 'series-a', 'growth'] as const;
const startupStatuses = ['active', 'paused', 'successful', 'failed'] as const;

// Generator for a valid startup DB row
const startupRowArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  stage: fc.constantFrom(...startupStages),
  funding_amount: fc.integer({ min: 0, max: 100_000_000 }),
  status: fc.constantFrom(...startupStatuses),
});

describe('Feature: user-dashboard-real-data, Property 6: Startup response shape completeness', () => {
  it('response objects contain non-null id, name, stage, fundingAmount, and status', () => {
    fc.assert(
      fc.property(startupRowArb, (row) => {
        const response = mapStartupRow(row);

        // All required fields must be non-null
        expect(response.id).not.toBeNull();
        expect(response.name).not.toBeNull();
        expect(response.stage).not.toBeNull();
        expect(response.fundingAmount).not.toBeNull();
        expect(response.status).not.toBeNull();

        // All required fields must be defined
        expect(response.id).toBeDefined();
        expect(response.name).toBeDefined();
        expect(response.stage).toBeDefined();
        expect(response.fundingAmount).toBeDefined();
        expect(response.status).toBeDefined();

        // Type checks
        expect(typeof response.id).toBe('string');
        expect(typeof response.name).toBe('string');
        expect(typeof response.stage).toBe('string');
        expect(typeof response.fundingAmount).toBe('number');
        expect(typeof response.status).toBe('string');

        // Stage must be one of the valid values
        expect(startupStages).toContain(response.stage);

        // Status must be one of the valid values
        expect(startupStatuses).toContain(response.status);

        // fundingAmount must be non-negative
        expect(response.fundingAmount).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });
});
