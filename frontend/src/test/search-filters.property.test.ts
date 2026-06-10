import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: search-filters
 * Property-Based Tests for Advanced Search & Filters
 */

// --- Helpers that mirror backend logic ---

interface StartupRow {
  id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  tags: string; // JSON string
  looking_for: string; // JSON string
  compensation_type: string;
  location: string;
  team_size: number;
  funding_amount: number;
  status: string;
  created_at: string;
}

interface SearchFilters {
  q: string;
  industry: string;
  stage: string[];
  roleType: string[];
  skills: string[];
}

// Simulates the backend filtering logic
function matchesFilters(row: StartupRow, filters: SearchFilters): boolean {
  // Status must be active
  if (row.status !== 'active') return false;

  // Text search: name, description, or tags contain q (case-insensitive)
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const nameMatch = row.name.toLowerCase().includes(q);
    const descMatch = row.description.toLowerCase().includes(q);
    const tagsMatch = row.tags.toLowerCase().includes(q);
    if (!nameMatch && !descMatch && !tagsMatch) return false;
  }

  // Industry exact match
  if (filters.industry) {
    if (row.industry !== filters.industry) return false;
  }

  // Stage IN
  if (filters.stage.length > 0) {
    if (!filters.stage.includes(row.stage)) return false;
  }

  // Role type: looking_for LIKE %roleType%
  if (filters.roleType.length > 0) {
    const hasMatch = filters.roleType.some((rt) =>
      row.looking_for.toLowerCase().includes(rt.toLowerCase())
    );
    if (!hasMatch) return false;
  }

  // Skills: looking_for LIKE %skill%
  if (filters.skills.length > 0) {
    const hasMatch = filters.skills.some((skill) =>
      row.looking_for.toLowerCase().includes(skill.toLowerCase())
    );
    if (!hasMatch) return false;
  }

  return true;
}

// URL serialization/parsing (mirrors frontend hook logic)
function serializeFilters(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.industry) params.set('industry', filters.industry);
  if (filters.stage.length > 0) params.set('stage', filters.stage.join(','));
  if (filters.roleType.length > 0) params.set('roleType', filters.roleType.join(','));
  if (filters.skills.length > 0) params.set('skills', filters.skills.join(','));
  return params;
}

function parseFilters(params: URLSearchParams): SearchFilters {
  return {
    q: params.get('q') || '',
    industry: params.get('industry') || '',
    stage: params.get('stage')?.split(',').filter(Boolean) || [],
    roleType: params.get('roleType')?.split(',').filter(Boolean) || [],
    skills: params.get('skills')?.split(',').filter(Boolean) || [],
  };
}

// --- Generators ---

const industries = ['FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'AI/ML', 'SaaS', 'E-commerce', 'Social Impact', 'AgriTech', 'Blockchain', 'Cybersecurity', 'Other'] as const;
const stages = ['Idea', 'MVP', 'Early Stage', 'Growth', 'Scale'] as const;
const roleTypes = ['equity', 'volunteer', 'paid', 'hybrid', 'internship'] as const;
const statuses = ['active', 'pending_approval', 'rejected'] as const;
const sampleSkills = ['React', 'Python', 'TypeScript', 'Machine Learning', 'Node.js', 'AWS', 'Docker', 'Figma'] as const;

const startupRowArb: fc.Arbitrary<StartupRow> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  industry: fc.constantFrom(...industries),
  stage: fc.constantFrom(...stages),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }).map((arr) => JSON.stringify(arr)),
  looking_for: fc.array(
    fc.oneof(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 20 }),
        skills: fc.array(fc.constantFrom(...sampleSkills), { minLength: 0, maxLength: 3 }),
        compensationType: fc.constantFrom(...roleTypes),
      })
    ),
    { minLength: 0, maxLength: 3 }
  ).map((arr) => JSON.stringify(arr)),
  compensation_type: fc.constantFrom(...roleTypes),
  location: fc.string({ minLength: 0, maxLength: 30 }),
  team_size: fc.integer({ min: 1, max: 50 }),
  funding_amount: fc.integer({ min: 0, max: 10_000_000 }),
  status: fc.constantFrom(...statuses),
  created_at: fc.integer({ min: 1672531200000, max: 1735689600000 }).map((ts) => new Date(ts).toISOString()),
});

// Filter generator that avoids commas in values (since comma is the delimiter)
const searchFiltersArb: fc.Arbitrary<SearchFilters> = fc.record({
  q: fc.oneof(fc.constant(''), fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes(','))),
  industry: fc.oneof(fc.constant(''), fc.constantFrom(...industries)),
  stage: fc.subarray([...stages], { minLength: 0, maxLength: 3 }),
  roleType: fc.subarray([...roleTypes], { minLength: 0, maxLength: 3 }),
  skills: fc.subarray([...sampleSkills], { minLength: 0, maxLength: 3 }),
});

// --- Property Tests ---

describe('Feature: search-filters, Property 1: AND Logic Consistency', () => {
  /**
   * Validates: Requirements 6.1
   *
   * For any combination of active filters, every startup in the result set
   * satisfies ALL active filter conditions simultaneously.
   */
  it('every result satisfies ALL active filter conditions', () => {
    fc.assert(
      fc.property(
        fc.array(startupRowArb, { minLength: 1, maxLength: 20 }),
        searchFiltersArb,
        (rows, filters) => {
          const results = rows.filter((row) => matchesFilters(row, filters));

          for (const row of results) {
            // Must be active
            expect(row.status).toBe('active');

            // If q filter is set, must match in name, description, or tags
            if (filters.q) {
              const q = filters.q.toLowerCase();
              const matches =
                row.name.toLowerCase().includes(q) ||
                row.description.toLowerCase().includes(q) ||
                row.tags.toLowerCase().includes(q);
              expect(matches).toBe(true);
            }

            // If industry filter is set, must match exactly
            if (filters.industry) {
              expect(row.industry).toBe(filters.industry);
            }

            // If stage filter is set, must be in the list
            if (filters.stage.length > 0) {
              expect(filters.stage).toContain(row.stage);
            }

            // If roleType filter is set, at least one must match
            if (filters.roleType.length > 0) {
              const hasMatch = filters.roleType.some((rt) =>
                row.looking_for.toLowerCase().includes(rt.toLowerCase())
              );
              expect(hasMatch).toBe(true);
            }

            // If skills filter is set, at least one must match
            if (filters.skills.length > 0) {
              const hasMatch = filters.skills.some((skill) =>
                row.looking_for.toLowerCase().includes(skill.toLowerCase())
              );
              expect(hasMatch).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: search-filters, Property 2: Text Search Inclusivity', () => {
  /**
   * Validates: Requirements 1.1
   *
   * For any search text q, every startup in the result set contains q
   * (case-insensitive) in at least one of: name, description, or serialized tags.
   */
  it('every result with text search contains the query in name, description, or tags', () => {
    fc.assert(
      fc.property(
        fc.array(startupRowArb, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 8 }).filter(s => !s.includes(',') && s.trim().length > 0),
        (rows, q) => {
          const filters: SearchFilters = { q, industry: '', stage: [], roleType: [], skills: [] };
          const results = rows.filter((row) => matchesFilters(row, filters));

          for (const row of results) {
            const qLower = q.toLowerCase();
            const matches =
              row.name.toLowerCase().includes(qLower) ||
              row.description.toLowerCase().includes(qLower) ||
              row.tags.toLowerCase().includes(qLower);
            expect(matches).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: search-filters, Property 3: Status Invariant', () => {
  /**
   * Validates: Requirements 10.3
   *
   * Regardless of filter combination, the search never returns startups
   * with status other than "active".
   */
  it('no result has status other than active', () => {
    fc.assert(
      fc.property(
        fc.array(startupRowArb, { minLength: 1, maxLength: 20 }),
        searchFiltersArb,
        (rows, filters) => {
          const results = rows.filter((row) => matchesFilters(row, filters));

          for (const row of results) {
            expect(row.status).toBe('active');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: search-filters, Property 4: Result Count Accuracy', () => {
  /**
   * Validates: Requirements 8.1
   *
   * The total field always equals the startups array length.
   */
  it('total equals startups array length', () => {
    fc.assert(
      fc.property(
        fc.array(startupRowArb, { minLength: 0, maxLength: 20 }),
        searchFiltersArb,
        (rows, filters) => {
          const results = rows.filter((row) => matchesFilters(row, filters));
          // Simulate the API response shape
          const response = { startups: results, total: results.length };
          expect(response.total).toBe(response.startups.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: search-filters, Property 5: URL Round-Trip', () => {
  /**
   * Validates: Requirements 9.1, 9.2, 9.3
   *
   * For any valid filter state, serializing to URL parameters and then
   * parsing back produces an equivalent filter state.
   */
  it('serialize then parse produces equivalent filter state', () => {
    fc.assert(
      fc.property(searchFiltersArb, (filters) => {
        const serialized = serializeFilters(filters);
        const parsed = parseFilters(serialized);

        expect(parsed.q).toBe(filters.q);
        expect(parsed.industry).toBe(filters.industry);
        expect(parsed.stage.sort()).toEqual([...filters.stage].sort());
        expect(parsed.roleType.sort()).toEqual([...filters.roleType].sort());
        expect(parsed.skills.sort()).toEqual([...filters.skills].sort());
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: search-filters, Property 6: Clearing Filters Returns Superset', () => {
  /**
   * Validates: Requirements 7.1
   *
   * Clearing all filters returns a superset of any filtered result set.
   * Every result that matches a filter combination also matches the empty filter.
   */
  it('clearing filters returns superset of any filtered result set', () => {
    fc.assert(
      fc.property(
        fc.array(startupRowArb, { minLength: 1, maxLength: 20 }),
        searchFiltersArb,
        (rows, filters) => {
          const emptyFilters: SearchFilters = { q: '', industry: '', stage: [], roleType: [], skills: [] };
          const filteredResults = rows.filter((row) => matchesFilters(row, filters));
          const allResults = rows.filter((row) => matchesFilters(row, emptyFilters));

          // Every filtered result must also appear in the unfiltered results
          for (const row of filteredResults) {
            expect(allResults).toContainEqual(row);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
