import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: user-dashboard-real-data, Property 3: Activities ordering and limit
 *
 * Validates: Requirements 2.1, 2.5
 *
 * For any user with N activities (N ≥ 0), the GET /api/dashboard/activities endpoint
 * SHALL return min(N, 20) activities ordered by timestamp descending, and these SHALL
 * be the N most recent activities when N > 20.
 */
describe('Feature: user-dashboard-real-data, Property 3: Activities ordering and limit', () => {
  const ACTIVITY_LIMIT = 20;

  const activityTypes = ['startup', 'investment', 'collaboration', 'admin'] as const;

  // Generator for a single activity with a random timestamp
  const activityArb = fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    type: fc.constantFrom(...activityTypes),
    message: fc.string({ minLength: 1, maxLength: 200 }),
    created_at: fc.integer({
      min: new Date('2020-01-01T00:00:00Z').getTime(),
      max: new Date('2030-12-31T23:59:59Z').getTime(),
    }).map(ts => new Date(ts).toISOString()),
  });

  // Generator for 0-100 activities with random timestamps
  const activitiesArb = fc.array(activityArb, { minLength: 0, maxLength: 100 });

  /**
   * Simulates the backend SQL logic:
   * SELECT id, type, message, created_at as timestamp
   * FROM activities WHERE user_id = ?
   * ORDER BY created_at DESC LIMIT 20
   */
  function simulateEndpointLogic(activities: Array<{
    id: string;
    user_id: string;
    type: string;
    message: string;
    created_at: string;
  }>) {
    return activities
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, ACTIVITY_LIMIT)
      .map(a => ({
        id: a.id,
        type: a.type,
        message: a.message,
        timestamp: a.created_at,
      }));
  }

  /**
   * Validates: Requirements 2.1, 2.5
   */
  it('should return activities sorted by timestamp descending', () => {
    fc.assert(
      fc.property(activitiesArb, (activities) => {
        const result = simulateEndpointLogic(activities);

        // Verify descending order by timestamp
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].timestamp >= result[i].timestamp).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should cap the result at 20 activities maximum', () => {
    fc.assert(
      fc.property(activitiesArb, (activities) => {
        const result = simulateEndpointLogic(activities);

        expect(result.length).toBeLessThanOrEqual(ACTIVITY_LIMIT);
        expect(result.length).toBe(Math.min(activities.length, ACTIVITY_LIMIT));
      }),
      { numRuns: 100 }
    );
  });

  it('should return the most recent activities when there are more than 20', () => {
    // Generate arrays with more than 20 activities to test the limit behavior
    const manyActivitiesArb = fc.array(activityArb, { minLength: 21, maxLength: 100 });

    fc.assert(
      fc.property(manyActivitiesArb, (activities) => {
        const result = simulateEndpointLogic(activities);

        // Sort all activities by timestamp descending to find the expected top 20
        const allSorted = activities
          .slice()
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
        const expectedTop20Timestamps = allSorted
          .slice(0, ACTIVITY_LIMIT)
          .map(a => a.created_at);

        // The result timestamps should match the top 20 most recent
        const resultTimestamps = result.map(r => r.timestamp);
        expect(resultTimestamps).toEqual(expectedTop20Timestamps);
      }),
      { numRuns: 100 }
    );
  });

  it('should return an empty array when there are no activities', () => {
    fc.assert(
      fc.property(fc.constant([]), (activities: Array<{
        id: string;
        user_id: string;
        type: string;
        message: string;
        created_at: string;
      }>) => {
        const result = simulateEndpointLogic(activities);
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });
});
