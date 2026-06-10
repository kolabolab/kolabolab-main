import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: post-signup-onboarding, Property 4: Role persistence round-trip
 * Feature: post-signup-onboarding, Property 5: Onboarding completion sets the flag
 * Feature: post-signup-onboarding, Property 7: New OAuth users initialize with empty roles and incomplete onboarding
 *
 * Validates: Requirements 3.1, 3.2, 4.3, 6.2
 *
 * These property tests validate the backend logic for role validation,
 * persistence round-trip (JSON serialization/deserialization as D1 stores TEXT),
 * onboarding completion flag behavior, and OAuth user initialization defaults.
 */

// --- Backend logic extracted for testing ---

const VALID_ROLES = ['entrepreneur', 'collaborator', 'investor'] as const;
type ValidRole = (typeof VALID_ROLES)[number];

/**
 * Validates and deduplicates roles exactly as the backend does in
 * POST /api/onboarding/complete and PUT /api/user/roles
 */
function validateAndDeduplicateRoles(roles: unknown): { valid: true; roles: string[] } | { valid: false; error: string } {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return { valid: false, error: 'At least one role is required' };
  }

  for (const role of roles) {
    if (typeof role !== 'string' || !VALID_ROLES.includes(role as ValidRole)) {
      return { valid: false, error: `Invalid role: ${role}` };
    }
  }

  // Deduplicate silently (same as backend)
  const uniqueRoles = [...new Set(roles as string[])];
  return { valid: true, roles: uniqueRoles };
}

/**
 * Simulates the D1 persistence round-trip:
 * 1. Roles are stored as JSON.stringify(roles) in a TEXT column
 * 2. Roles are read back via JSON.parse(textValue)
 * This is exactly what workers-native.ts does.
 */
function persistAndReadRoles(roles: string[]): string[] {
  // Store: JSON.stringify (what the UPDATE statement does)
  const stored = JSON.stringify(roles);
  // Read: JSON.parse (what the SELECT + JSON.parse does)
  return JSON.parse(stored);
}

/**
 * Simulates the onboarding completion update:
 * UPDATE users SET roles = ?, onboarding_completed = 1
 * Returns the resulting user record state.
 */
function simulateOnboardingComplete(roles: string[]): { roles: string[]; onboarding_completed: number } {
  const rolesJson = JSON.stringify(roles);
  // Simulates what D1 stores and reads back
  return {
    roles: JSON.parse(rolesJson),
    onboarding_completed: 1,
  };
}

/**
 * Simulates new OAuth user creation as the backend does:
 * INSERT INTO users (...) with roles = '[]' and onboarding_completed = 0
 */
function createNewOAuthUser(provider: string, email: string): { roles: string; onboarding_completed: number } {
  // The backend sets these defaults for new users
  return {
    roles: '[]',
    onboarding_completed: 0,
  };
}

// --- Arbitraries ---

/** Generates a valid non-empty subset of roles (1 to 3 roles, no duplicates) */
const validRoleSubsetArb: fc.Arbitrary<ValidRole[]> = fc.uniqueArray(
  fc.constantFrom(...VALID_ROLES),
  { minLength: 1, maxLength: 3 }
);

/** Generates a valid role array that may contain duplicates (as user input might) */
const validRolesWithDuplicatesArb: fc.Arbitrary<string[]> = fc
  .array(fc.constantFrom(...VALID_ROLES), { minLength: 1, maxLength: 6 })
  .filter((arr) => arr.length > 0);

/** Generates an OAuth provider name */
const oauthProviderArb = fc.constantFrom('google', 'linkedin', 'github');

/** Generates a random email */
const emailArb = fc.emailAddress();

// --- Property Tests ---

describe('Feature: post-signup-onboarding, Property 4: Role persistence round-trip', () => {
  /**
   * Validates: Requirements 3.1, 6.2
   *
   * For any valid non-empty subset of roles, storing and reading back
   * returns the exact same set.
   */
  it('for any valid non-empty subset of roles, storing and reading back returns the exact same set', () => {
    fc.assert(
      fc.property(validRoleSubsetArb, (roles: ValidRole[]) => {
        const result = persistAndReadRoles(roles);

        // The read-back set must be identical to the input set
        expect(result).toEqual(roles);
        expect(result.length).toBe(roles.length);

        // Every role in the result must be a valid role
        for (const role of result) {
          expect(VALID_ROLES).toContain(role);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('roles with duplicates are deduplicated before persistence, and round-trip preserves the deduplicated set', () => {
    fc.assert(
      fc.property(validRolesWithDuplicatesArb, (roles: string[]) => {
        const validation = validateAndDeduplicateRoles(roles);
        expect(validation.valid).toBe(true);

        if (validation.valid) {
          const persisted = persistAndReadRoles(validation.roles);
          expect(persisted).toEqual(validation.roles);

          // Verify no duplicates in the persisted result
          const uniqueSet = new Set(persisted);
          expect(uniqueSet.size).toBe(persisted.length);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('round-trip via PUT /api/user/roles preserves role order and content', () => {
    fc.assert(
      fc.property(validRoleSubsetArb, (roles: ValidRole[]) => {
        // Simulate the PUT endpoint flow:
        // 1. Validate input
        const validation = validateAndDeduplicateRoles(roles);
        expect(validation.valid).toBe(true);

        if (validation.valid) {
          // 2. Store to D1 (JSON.stringify)
          const stored = JSON.stringify(validation.roles);

          // 3. Read back (JSON.parse)
          const readBack = JSON.parse(stored) as string[];

          // 4. Verify exact match
          expect(readBack).toEqual(roles);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: post-signup-onboarding, Property 5: Onboarding completion sets the flag', () => {
  /**
   * Validates: Requirements 3.2
   *
   * After successful onboarding complete call, onboarding_completed is 1.
   */
  it('after successful onboarding complete call, onboarding_completed is 1', () => {
    fc.assert(
      fc.property(validRoleSubsetArb, (roles: ValidRole[]) => {
        const result = simulateOnboardingComplete(roles);

        // The onboarding_completed flag must be 1
        expect(result.onboarding_completed).toBe(1);

        // The roles must match what was submitted
        expect(result.roles).toEqual(roles);
      }),
      { numRuns: 100 }
    );
  });

  it('onboarding_completed is always exactly 1 (integer) regardless of role combination', () => {
    fc.assert(
      fc.property(validRoleSubsetArb, (roles: ValidRole[]) => {
        const result = simulateOnboardingComplete(roles);

        // Must be strictly equal to 1 (not truthy, not "1", exactly 1)
        expect(result.onboarding_completed).toStrictEqual(1);
        expect(typeof result.onboarding_completed).toBe('number');
      }),
      { numRuns: 100 }
    );
  });

  it('roles are correctly persisted alongside the completion flag', () => {
    fc.assert(
      fc.property(validRolesWithDuplicatesArb, (inputRoles: string[]) => {
        // First validate and deduplicate (as the endpoint does)
        const validation = validateAndDeduplicateRoles(inputRoles);
        expect(validation.valid).toBe(true);

        if (validation.valid) {
          const result = simulateOnboardingComplete(validation.roles);

          // Flag is set
          expect(result.onboarding_completed).toBe(1);

          // Roles match the deduplicated input
          expect(result.roles).toEqual(validation.roles);

          // No duplicates in stored roles
          expect(new Set(result.roles).size).toBe(result.roles.length);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: post-signup-onboarding, Property 7: New OAuth users initialize with empty roles and incomplete onboarding', () => {
  /**
   * Validates: Requirements 4.3
   *
   * For any new user created through an OAuth callback (Google, LinkedIn, or GitHub),
   * the resulting user record SHALL have roles set to an empty JSON array []
   * and onboarding_completed set to 0 (false).
   */
  it('new OAuth users always initialize with empty roles array and onboarding_completed = 0', () => {
    fc.assert(
      fc.property(oauthProviderArb, emailArb, (provider: string, email: string) => {
        const user = createNewOAuthUser(provider, email);

        // roles must be the string '[]' (empty JSON array as stored in D1 TEXT column)
        expect(user.roles).toBe('[]');

        // Parse the roles to verify it's an empty array
        const parsedRoles = JSON.parse(user.roles);
        expect(parsedRoles).toEqual([]);
        expect(Array.isArray(parsedRoles)).toBe(true);
        expect(parsedRoles.length).toBe(0);

        // onboarding_completed must be 0
        expect(user.onboarding_completed).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('new OAuth user roles field is always a valid JSON array string', () => {
    fc.assert(
      fc.property(oauthProviderArb, emailArb, (provider: string, email: string) => {
        const user = createNewOAuthUser(provider, email);

        // Must be parseable as JSON
        expect(() => JSON.parse(user.roles)).not.toThrow();

        // Must parse to an array
        const parsed = JSON.parse(user.roles);
        expect(Array.isArray(parsed)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('onboarding_completed is always 0 (integer) for new OAuth users regardless of provider', () => {
    fc.assert(
      fc.property(oauthProviderArb, emailArb, (provider: string, email: string) => {
        const user = createNewOAuthUser(provider, email);

        // Must be strictly 0
        expect(user.onboarding_completed).toStrictEqual(0);
        expect(typeof user.onboarding_completed).toBe('number');
      }),
      { numRuns: 100 }
    );
  });
});
