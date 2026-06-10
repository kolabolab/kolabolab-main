import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: user-dashboard-real-data, Property 2: Success rate calculation with rounding
 * Validates: Requirements 1.5
 *
 * Tests the success rate computation logic:
 * - When total startups > 0: Math.round((successful / total) * 100)
 * - When total startups = 0: 0
 */

const VALID_STATUSES = ['active', 'paused', 'successful', 'failed'] as const;
type StartupStatus = (typeof VALID_STATUSES)[number];

/**
 * Computes the success rate the same way the backend SQL does:
 * COALESCE(ROUND(100.0 * COUNT(CASE WHEN status = 'successful' THEN 1 END) / NULLIF(COUNT(*), 0)), 0)
 */
function computeSuccessRate(statuses: StartupStatus[]): number {
  const total = statuses.length;
  if (total === 0) return 0;
  const successful = statuses.filter((s) => s === 'successful').length;
  return Math.round((successful / total) * 100);
}

describe('Feature: user-dashboard-real-data, Property 2: Success rate calculation with rounding', () => {
  /**
   * Validates: Requirements 1.5
   */
  it('should return 0 when there are no startups', () => {
    fc.assert(
      fc.property(fc.constant([]), (statuses: StartupStatus[]) => {
        expect(computeSuccessRate(statuses)).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should compute Math.round((successful / total) * 100) for any set of startups', () => {
    const statusArb = fc.constantFrom(...VALID_STATUSES);
    const startupStatusesArb = fc.array(statusArb, { minLength: 1, maxLength: 50 });

    fc.assert(
      fc.property(startupStatusesArb, (statuses: StartupStatus[]) => {
        const total = statuses.length;
        const successful = statuses.filter((s) => s === 'successful').length;
        const expected = Math.round((successful / total) * 100);
        const result = computeSuccessRate(statuses);

        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it('should always return a value between 0 and 100 inclusive', () => {
    const statusArb = fc.constantFrom(...VALID_STATUSES);
    const startupStatusesArb = fc.array(statusArb, { minLength: 0, maxLength: 50 });

    fc.assert(
      fc.property(startupStatusesArb, (statuses: StartupStatus[]) => {
        const result = computeSuccessRate(statuses);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 100 when all startups are successful', () => {
    const allSuccessfulArb = fc.array(fc.constant('successful' as StartupStatus), {
      minLength: 1,
      maxLength: 50,
    });

    fc.assert(
      fc.property(allSuccessfulArb, (statuses: StartupStatus[]) => {
        expect(computeSuccessRate(statuses)).toBe(100);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 0 when no startups are successful', () => {
    const nonSuccessfulStatusArb = fc.constantFrom(
      'active' as StartupStatus,
      'paused' as StartupStatus,
      'failed' as StartupStatus
    );
    const noSuccessArb = fc.array(nonSuccessfulStatusArb, { minLength: 1, maxLength: 50 });

    fc.assert(
      fc.property(noSuccessArb, (statuses: StartupStatus[]) => {
        expect(computeSuccessRate(statuses)).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});
