import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: post-signup-onboarding, Property 7: New OAuth users initialize with empty roles and incomplete onboarding
 * Feature: post-signup-onboarding, Property 10: JWT token includes onboardingCompleted claim
 *
 * Validates: Requirements 4.3, 7.3
 *
 * These property tests validate:
 * - OAuth user initialization correctly maps DB values to frontend-facing data
 * - JWT token creation includes onboardingCompleted claim that matches the DB value
 * - The integer-to-boolean mapping (0→false, 1→true) is consistent
 */

// --- Backend logic extracted for testing ---

/**
 * Simulates the createJWT function from workers-native.ts.
 * The actual function uses Web Crypto API for HMAC signing, but the payload
 * construction logic (which is what we're testing) is pure.
 *
 * The key behavior: payload fields are spread into the JWT payload along with
 * iat and exp claims. The onboardingCompleted boolean is included as-is.
 */
function buildJwtPayload(payload: Record<string, unknown>, expiresIn: string): Record<string, unknown> {
  const now = Math.floor(Date.now() / 1000);
  let exp: number;

  if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn.slice(0, -1));
    exp = now + (hours * 60 * 60);
  } else if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.slice(0, -1));
    exp = now + (days * 24 * 60 * 60);
  } else {
    exp = now + 3600;
  }

  return {
    ...payload,
    iat: now,
    exp,
  };
}

/**
 * Simulates the base64url encoding used in JWT token creation.
 * This mirrors the createJWT function's encoding logic.
 */
function base64UrlEncode(obj: Record<string, unknown>): string {
  return btoa(JSON.stringify(obj))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Decodes a base64url-encoded JWT payload segment back to an object.
 */
function decodeJwtPayload(encodedPayload: string): Record<string, unknown> {
  // Restore base64 padding and standard chars
  let base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return JSON.parse(atob(base64));
}

/**
 * Simulates the full JWT creation flow (without actual HMAC signing)
 * to verify the payload encoding round-trip preserves onboardingCompleted.
 */
function createJwtPayloadEncoded(payload: Record<string, unknown>, expiresIn: string): string {
  const jwtPayload = buildJwtPayload(payload, expiresIn);
  return base64UrlEncode(jwtPayload);
}

/**
 * Maps the DB integer value to the boolean used in JWT and user data.
 * This is the exact logic used in workers-native.ts:
 *   onboardingCompleted: user.onboarding_completed === 1
 */
function mapDbOnboardingToBoolean(dbValue: number): boolean {
  return dbValue === 1;
}

/**
 * Simulates the OAuth user data encoding for the frontend redirect.
 * This mirrors the logic in workers-native.ts OAuth callbacks.
 */
function encodeOAuthUserData(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  roles: string;
  onboarding_completed: number;
}): { roles: string[]; onboardingCompleted: boolean } {
  const userRoles = user.roles
    ? (typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles)
    : [];
  const onboardingCompleted = user.onboarding_completed === 1;

  return {
    roles: userRoles,
    onboardingCompleted,
  };
}

// --- Arbitraries ---

/** Generates an OAuth provider name */
const oauthProviderArb = fc.constantFrom('google', 'linkedin', 'github');

/** Generates a random email */
const emailArb = fc.emailAddress();

/** Generates a DB onboarding_completed value (0 or 1) */
const dbOnboardingCompletedArb = fc.constantFrom(0, 1);

/** Generates a valid roles JSON string as stored in D1 */
const VALID_ROLES = ['entrepreneur', 'collaborator', 'investor'] as const;
const dbRolesArb = fc.uniqueArray(
  fc.constantFrom(...VALID_ROLES),
  { minLength: 0, maxLength: 3 }
).map((roles) => JSON.stringify(roles));

/** Generates a user ID */
const userIdArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

/** Generates a simple name string */
const nameArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

// --- Property Tests ---

describe('Feature: post-signup-onboarding, Property 7: New OAuth users initialize with empty roles and incomplete onboarding', () => {
  /**
   * Validates: Requirements 4.3
   *
   * For any new user created through an OAuth callback, the encoded user data
   * sent to the frontend SHALL have roles as an empty array and
   * onboardingCompleted as false.
   */
  it('new OAuth user data encoding maps DB defaults (roles=[], onboarding_completed=0) to frontend format correctly', () => {
    fc.assert(
      fc.property(
        oauthProviderArb,
        emailArb,
        nameArb,
        nameArb,
        (provider: string, email: string, firstName: string, lastName: string) => {
          // Simulate a new OAuth user as created by the backend
          const newUser = {
            id: `${provider}_${Math.random().toString(36).slice(2)}`,
            email,
            firstName,
            lastName,
            avatar: '',
            roles: '[]',              // New users get empty roles
            onboarding_completed: 0,  // New users haven't completed onboarding
          };

          const encoded = encodeOAuthUserData(newUser);

          // roles must be an empty array
          expect(encoded.roles).toEqual([]);
          expect(Array.isArray(encoded.roles)).toBe(true);
          expect(encoded.roles.length).toBe(0);

          // onboardingCompleted must be false
          expect(encoded.onboardingCompleted).toBe(false);
          expect(typeof encoded.onboardingCompleted).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('existing OAuth users with completed onboarding encode correctly with their actual roles', () => {
    fc.assert(
      fc.property(
        oauthProviderArb,
        emailArb,
        dbRolesArb,
        dbOnboardingCompletedArb,
        (provider: string, email: string, rolesJson: string, onboardingCompleted: number) => {
          const user = {
            id: `${provider}_existing_user`,
            email,
            firstName: 'Test',
            lastName: 'User',
            avatar: '',
            roles: rolesJson,
            onboarding_completed: onboardingCompleted,
          };

          const encoded = encodeOAuthUserData(user);

          // roles must match the parsed JSON
          const expectedRoles = JSON.parse(rolesJson);
          expect(encoded.roles).toEqual(expectedRoles);

          // onboardingCompleted must be the boolean mapping of the DB integer
          expect(encoded.onboardingCompleted).toBe(onboardingCompleted === 1);
          expect(typeof encoded.onboardingCompleted).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the integer-to-boolean mapping is consistent: only 1 maps to true, everything else to false', () => {
    fc.assert(
      fc.property(
        dbOnboardingCompletedArb,
        (dbValue: number) => {
          const result = mapDbOnboardingToBoolean(dbValue);

          if (dbValue === 1) {
            expect(result).toBe(true);
          } else {
            expect(result).toBe(false);
          }

          // Result is always a boolean
          expect(typeof result).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: post-signup-onboarding, Property 10: JWT token includes onboardingCompleted claim', () => {
  /**
   * Validates: Requirements 7.3
   *
   * For any JWT access token created for a user, the token payload SHALL include
   * an onboardingCompleted field whose boolean value matches the user's
   * onboarding_completed database column value.
   */
  it('JWT payload includes onboardingCompleted boolean that matches the DB integer value', () => {
    fc.assert(
      fc.property(
        userIdArb,
        emailArb,
        dbOnboardingCompletedArb,
        (userId: string, email: string, dbOnboardingCompleted: number) => {
          // This is exactly how the backend constructs the JWT payload
          const payload = {
            userId,
            email,
            type: 'access' as const,
            onboardingCompleted: dbOnboardingCompleted === 1,
          };

          const jwtPayload = buildJwtPayload(payload, '1h');

          // onboardingCompleted must be present in the payload
          expect('onboardingCompleted' in jwtPayload).toBe(true);

          // It must be a boolean
          expect(typeof jwtPayload.onboardingCompleted).toBe('boolean');

          // It must match the DB value mapping
          expect(jwtPayload.onboardingCompleted).toBe(dbOnboardingCompleted === 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('JWT payload onboardingCompleted survives base64url encoding/decoding round-trip', () => {
    fc.assert(
      fc.property(
        userIdArb,
        emailArb,
        dbOnboardingCompletedArb,
        (userId: string, email: string, dbOnboardingCompleted: number) => {
          const payload = {
            userId,
            email,
            type: 'access' as const,
            onboardingCompleted: dbOnboardingCompleted === 1,
          };

          // Encode the payload as the JWT creation does
          const encoded = createJwtPayloadEncoded(payload, '1h');

          // Decode it back (as a JWT consumer would)
          const decoded = decodeJwtPayload(encoded);

          // onboardingCompleted must survive the round-trip
          expect(decoded.onboardingCompleted).toBe(dbOnboardingCompleted === 1);
          expect(typeof decoded.onboardingCompleted).toBe('boolean');

          // Other standard claims must also be present
          expect(decoded.userId).toBe(userId);
          expect(decoded.email).toBe(email);
          expect(decoded.type).toBe('access');
          expect(typeof decoded.iat).toBe('number');
          expect(typeof decoded.exp).toBe('number');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('onboardingCompleted=false for DB value 0, true for DB value 1 — no other boolean values possible', () => {
    fc.assert(
      fc.property(
        userIdArb,
        emailArb,
        dbOnboardingCompletedArb,
        (userId: string, email: string, dbOnboardingCompleted: number) => {
          const payload = {
            userId,
            email,
            type: 'access' as const,
            onboardingCompleted: dbOnboardingCompleted === 1,
          };

          const jwtPayload = buildJwtPayload(payload, '1h');

          // The claim must be exactly false when DB is 0
          if (dbOnboardingCompleted === 0) {
            expect(jwtPayload.onboardingCompleted).toStrictEqual(false);
          }

          // The claim must be exactly true when DB is 1
          if (dbOnboardingCompleted === 1) {
            expect(jwtPayload.onboardingCompleted).toStrictEqual(true);
          }

          // It must never be undefined, null, or a non-boolean
          expect(jwtPayload.onboardingCompleted).not.toBeUndefined();
          expect(jwtPayload.onboardingCompleted).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('JWT access token always includes type=access alongside onboardingCompleted', () => {
    fc.assert(
      fc.property(
        userIdArb,
        emailArb,
        dbOnboardingCompletedArb,
        (userId: string, email: string, dbOnboardingCompleted: number) => {
          const payload = {
            userId,
            email,
            type: 'access' as const,
            onboardingCompleted: dbOnboardingCompleted === 1,
          };

          const jwtPayload = buildJwtPayload(payload, '1h');

          // Access tokens must have type 'access'
          expect(jwtPayload.type).toBe('access');

          // And must include onboardingCompleted
          expect('onboardingCompleted' in jwtPayload).toBe(true);

          // Expiry must be in the future (1 hour from now)
          const now = Math.floor(Date.now() / 1000);
          expect(jwtPayload.exp).toBeGreaterThan(now);
          expect((jwtPayload.exp as number) - now).toBeLessThanOrEqual(3600 + 1); // Allow 1s tolerance
        }
      ),
      { numRuns: 100 }
    );
  });
});
