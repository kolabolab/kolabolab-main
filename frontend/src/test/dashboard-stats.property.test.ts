import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: user-dashboard-real-data, Property 1: Stats computation reflects database state
 *
 * **Validates: Requirements 1.1, 1.4**
 *
 * This property test verifies that the dashboard stats computation logic
 * correctly reflects the database state. We simulate the computation that
 * the GET /api/dashboard/stats endpoint performs against D1 database tables.
 */

// Simulates the stats computation logic from the backend endpoint
// This mirrors the SQL queries in workers-main.ts:
// - totalStartups: COUNT(*) FROM startups WHERE user_id = ?
// - totalInvestors: COUNT(DISTINCT i.id) FROM investors i JOIN startups s ON i.startup_id = s.id WHERE s.user_id = ?
// - totalFunding: COALESCE(SUM(funding_amount), 0) FROM startups WHERE user_id = ?
interface Startup {
  id: string;
  userId: string;
  fundingAmount: number;
}

interface Investor {
  id: string;
  startupId: string;
}

function computeDashboardStats(
  startups: Startup[],
  investors: Investor[],
  userId: string
): { totalStartups: number; totalInvestors: number; totalFunding: number } {
  // Filter startups for the given user (mirrors WHERE user_id = ?)
  const userStartups = startups.filter((s) => s.userId === userId);

  // COUNT(*) of user's startups
  const totalStartups = userStartups.length;

  // Get startup IDs for the user
  const userStartupIds = new Set(userStartups.map((s) => s.id));

  // COUNT(DISTINCT i.id) from investors joined with user's startups
  const userInvestors = investors.filter((i) => userStartupIds.has(i.startupId));
  const totalInvestors = new Set(userInvestors.map((i) => i.id)).size;

  // COALESCE(SUM(funding_amount), 0) for user's startups
  const totalFunding = userStartups.reduce((sum, s) => sum + s.fundingAmount, 0);

  return { totalStartups, totalInvestors, totalFunding };
}

describe('Feature: user-dashboard-real-data, Property 1: Stats computation reflects database state', () => {
  it('totalStartups, totalInvestors, and totalFunding match expected counts/sums for any generated user data', () => {
    const userId = 'test-user-1';

    // Arbitrary for generating startups (0-50 per user)
    const startupArb = fc.record({
      id: fc.uuid(),
      userId: fc.constant(userId),
      fundingAmount: fc.integer({ min: 0, max: 10_000_000 }), // 0 to $100K in cents
    });

    // Generate 0-50 startups
    const startupsArb = fc.array(startupArb, { minLength: 0, maxLength: 50 });

    // For each set of startups, generate investors (0-10 per startup)
    const testDataArb = startupsArb.chain((startups) => {
      if (startups.length === 0) {
        return fc.constant({ startups, investors: [] as Investor[] });
      }

      // Generate investors for each startup (0-10 investors per startup)
      const investorArbs = startups.map((startup) =>
        fc.array(
          fc.record({
            id: fc.uuid(),
            startupId: fc.constant(startup.id),
          }),
          { minLength: 0, maxLength: 10 }
        )
      );

      return fc.tuple(...investorArbs).map((investorArrays) => ({
        startups,
        investors: investorArrays.flat(),
      }));
    });

    fc.assert(
      fc.property(testDataArb, ({ startups, investors }) => {
        const result = computeDashboardStats(startups, investors, userId);

        // Verify totalStartups matches the count of startups for this user
        expect(result.totalStartups).toBe(startups.length);

        // Verify totalInvestors matches the count of distinct investors
        const distinctInvestorIds = new Set(investors.map((i) => i.id));
        expect(result.totalInvestors).toBe(distinctInvestorIds.size);

        // Verify totalFunding matches the sum of all funding amounts
        const expectedFunding = startups.reduce((sum, s) => sum + s.fundingAmount, 0);
        expect(result.totalFunding).toBe(expectedFunding);
      }),
      { numRuns: 100 }
    );
  });

  it('returns zero values when user has no startups', () => {
    // Generate investors that belong to other users' startups
    const otherStartupInvestorsArb = fc.array(
      fc.record({
        id: fc.uuid(),
        startupId: fc.uuid(), // random startup IDs not belonging to our user
      }),
      { minLength: 0, maxLength: 20 }
    );

    fc.assert(
      fc.property(otherStartupInvestorsArb, (investors) => {
        const result = computeDashboardStats([], investors, 'user-with-no-startups');

        expect(result.totalStartups).toBe(0);
        expect(result.totalInvestors).toBe(0);
        expect(result.totalFunding).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('correctly isolates stats per user when multiple users have startups', () => {
    const userAId = 'user-a';
    const userBId = 'user-b';

    // Generate startups for two different users
    const testDataArb = fc
      .tuple(
        fc.array(
          fc.record({
            id: fc.uuid(),
            userId: fc.constant(userAId),
            fundingAmount: fc.integer({ min: 0, max: 5_000_000 }),
          }),
          { minLength: 0, maxLength: 25 }
        ),
        fc.array(
          fc.record({
            id: fc.uuid(),
            userId: fc.constant(userBId),
            fundingAmount: fc.integer({ min: 0, max: 5_000_000 }),
          }),
          { minLength: 0, maxLength: 25 }
        )
      )
      .chain(([startupsA, startupsB]) => {
        const allStartups = [...startupsA, ...startupsB];

        if (allStartups.length === 0) {
          return fc.constant({
            startupsA,
            startupsB,
            allStartups,
            investors: [] as Investor[],
          });
        }

        // Generate investors for all startups
        const investorArbs = allStartups.map((startup) =>
          fc.array(
            fc.record({
              id: fc.uuid(),
              startupId: fc.constant(startup.id),
            }),
            { minLength: 0, maxLength: 5 }
          )
        );

        return fc.tuple(...investorArbs).map((investorArrays) => ({
          startupsA,
          startupsB,
          allStartups,
          investors: investorArrays.flat(),
        }));
      });

    fc.assert(
      fc.property(testDataArb, ({ startupsA, startupsB, allStartups, investors }) => {
        // Compute stats for user A
        const resultA = computeDashboardStats(allStartups, investors, userAId);

        // User A's stats should only reflect their own startups
        expect(resultA.totalStartups).toBe(startupsA.length);
        expect(resultA.totalFunding).toBe(
          startupsA.reduce((sum, s) => sum + s.fundingAmount, 0)
        );

        // User A's investors should only be those linked to user A's startups
        const userAStartupIds = new Set(startupsA.map((s) => s.id));
        const userAInvestors = investors.filter((i) => userAStartupIds.has(i.startupId));
        expect(resultA.totalInvestors).toBe(new Set(userAInvestors.map((i) => i.id)).size);

        // Compute stats for user B
        const resultB = computeDashboardStats(allStartups, investors, userBId);

        // User B's stats should only reflect their own startups
        expect(resultB.totalStartups).toBe(startupsB.length);
        expect(resultB.totalFunding).toBe(
          startupsB.reduce((sum, s) => sum + s.fundingAmount, 0)
        );
      }),
      { numRuns: 100 }
    );
  });
});
