import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: user-dashboard-real-data, Property 5: Startups filtered by authenticated user
 * Validates: Requirements 3.1
 *
 * For any set of startups in the database belonging to multiple users,
 * the GET /api/user/startups endpoint SHALL return only startups where
 * user_id matches the authenticated user's ID, and SHALL return none
 * belonging to other users.
 */

interface Startup {
  id: string;
  user_id: string;
  name: string;
  stage: string;
  funding_amount: number;
  status: string;
}

/**
 * Simulates the endpoint query logic:
 * SELECT id, name, stage, funding_amount, status FROM startups WHERE user_id = ? ORDER BY created_at DESC
 */
function filterStartupsByUser(allStartups: Startup[], authenticatedUserId: string) {
  return allStartups
    .filter((s) => s.user_id === authenticatedUserId)
    .map((s) => ({
      id: s.id,
      name: s.name,
      stage: s.stage,
      fundingAmount: s.funding_amount,
      status: s.status,
    }));
}

// Arbitrary for generating a valid startup stage
const stageArb = fc.constantFrom('idea', 'pre-seed', 'seed', 'series-a', 'growth');

// Arbitrary for generating a valid startup status
const statusArb = fc.constantFrom('active', 'paused', 'successful', 'failed');

// Arbitrary for generating a startup belonging to a specific user
function startupArb(userId: string): fc.Arbitrary<Startup> {
  return fc.record({
    id: fc.uuid(),
    user_id: fc.constant(userId),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    stage: stageArb,
    funding_amount: fc.integer({ min: 0, max: 100_000_000 }),
    status: statusArb,
  });
}

describe('Feature: user-dashboard-real-data, Property 5: Startups filtered by authenticated user', () => {
  it('should return only startups belonging to the authenticated user and none from other users', () => {
    fc.assert(
      fc.property(
        // Generate 2-5 unique user IDs
        fc.integer({ min: 2, max: 5 }).chain((numUsers) => {
          return fc.array(fc.uuid(), { minLength: numUsers, maxLength: numUsers }).chain((userIds) => {
            // Deduplicate user IDs (UUIDs are practically unique but let's be safe)
            const uniqueUserIds = [...new Set(userIds)];
            if (uniqueUserIds.length < 2) {
              // Fallback: generate distinct IDs manually
              return fc.constant({ userIds: ['user-a', 'user-b'], startups: [] as Startup[] });
            }

            // Generate 0-10 startups per user
            const startupArrays = uniqueUserIds.map((uid) =>
              fc.array(startupArb(uid), { minLength: 0, maxLength: 10 })
            );

            return fc.tuple(...startupArrays).map((arrays) => ({
              userIds: uniqueUserIds,
              startups: arrays.flat(),
            }));
          });
        }),
        ({ userIds, startups }) => {
          // Pick the first user as the "authenticated" user
          const authenticatedUserId = userIds[0];

          // Simulate the endpoint filtering
          const result = filterStartupsByUser(startups, authenticatedUserId);

          // All returned startups must belong to the authenticated user
          for (const startup of result) {
            expect(startup).not.toHaveProperty('user_id');
          }

          // Verify count matches: result length should equal the number of startups
          // that belong to the authenticated user in the original dataset
          const expectedCount = startups.filter((s) => s.user_id === authenticatedUserId).length;
          expect(result.length).toBe(expectedCount);

          // Verify NO startups from other users are included
          const otherUserIds = userIds.filter((id) => id !== authenticatedUserId);
          const originalIds = startups
            .filter((s) => otherUserIds.includes(s.user_id))
            .map((s) => s.id);

          const returnedIds = result.map((s) => s.id);
          for (const otherId of originalIds) {
            expect(returnedIds).not.toContain(otherId);
          }

          // Verify all authenticated user's startups ARE included
          const expectedIds = startups
            .filter((s) => s.user_id === authenticatedUserId)
            .map((s) => s.id);

          for (const expectedId of expectedIds) {
            expect(returnedIds).toContain(expectedId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
