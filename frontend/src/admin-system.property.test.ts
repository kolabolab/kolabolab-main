import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: admin-system, Property 1: Roles round-trip through JWT
 * Validates: Requirements 1.1, 1.3
 *
 * For any valid roles array (including empty arrays), encoding the roles into a JWT
 * payload and decoding the JWT back should produce the same roles array.
 */

/**
 * Feature: admin-system, Property 2: Admin detection correctness
 * Validates: Requirements 1.2, 1.4
 *
 * For any roles value (including null, empty string, '[]', or a valid JSON array of strings),
 * the admin detection function should return true if and only if the parsed array contains
 * the string 'admin'.
 */

// --- Replicated JWT functions (same logic as backend/workers-native.ts) ---

async function createJWT(payload: any, secret: string, expiresIn: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  let exp: number;

  if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn.slice(0, -1));
    exp = now + hours * 60 * 60;
  } else if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.slice(0, -1));
    exp = now + days * 24 * 60 * 60;
  } else {
    exp = now + 3600;
  }

  const jwtPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(jwtPayload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigStr = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const sigPadded = sigStr + '='.repeat((4 - (sigStr.length % 4)) % 4);
    const sigBytes = Uint8Array.from(atob(sigPadded), (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return null;

    const payloadStr = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPadded = payloadStr + '='.repeat((4 - (payloadStr.length % 4)) % 4);
    const payload = JSON.parse(atob(payloadPadded));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// --- Admin detection pure function (same logic as requireAdmin in backend) ---

/**
 * Determines if a user is an admin based on the raw roles value from the database.
 * Handles null, empty string, invalid JSON, '[]', and valid JSON arrays.
 * Returns true if and only if the parsed array contains the string 'admin'.
 */
function isAdmin(rolesValue: string | null): boolean {
  if (!rolesValue) return false;

  let roles: string[] = [];
  try {
    const parsed = JSON.parse(rolesValue);
    if (Array.isArray(parsed)) {
      roles = parsed;
    }
  } catch {
    roles = [];
  }

  return roles.includes('admin');
}

// --- Property Tests ---

describe('Feature: admin-system, Property 1: Roles round-trip through JWT', () => {
  /**
   * Validates: Requirements 1.1, 1.3
   */

  const TEST_SECRET = 'test-secret-key-for-property-tests';

  // Generator for valid role strings (lowercase alpha role names)
  const roleArb = fc.constantFrom('admin', 'entrepreneur', 'investor', 'mentor', 'viewer', 'editor', 'moderator');
  const rolesArrayArb = fc.array(roleArb, { minLength: 0, maxLength: 10 });

  it('should preserve roles array through JWT encode/decode cycle', async () => {
    await fc.assert(
      fc.asyncProperty(rolesArrayArb, async (roles: string[]) => {
        const payload = {
          userId: 'test-user-id',
          email: 'test@example.com',
          type: 'access',
          roles,
          onboardingCompleted: true,
        };

        const token = await createJWT(payload, TEST_SECRET, '1h');
        const decoded = await verifyJWT(token, TEST_SECRET);

        expect(decoded).not.toBeNull();
        expect(decoded.roles).toEqual(roles);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve empty roles array through JWT encode/decode cycle', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant([]), async (roles: string[]) => {
        const payload = {
          userId: 'test-user-id',
          email: 'test@example.com',
          type: 'access',
          roles,
          onboardingCompleted: true,
        };

        const token = await createJWT(payload, TEST_SECRET, '1h');
        const decoded = await verifyJWT(token, TEST_SECRET);

        expect(decoded).not.toBeNull();
        expect(decoded.roles).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve roles containing "admin" through JWT encode/decode cycle', async () => {
    const rolesWithAdminArb = rolesArrayArb.map((roles) => [...roles, 'admin']);

    await fc.assert(
      fc.asyncProperty(rolesWithAdminArb, async (roles: string[]) => {
        const payload = {
          userId: 'test-user-id',
          email: 'test@example.com',
          type: 'access',
          roles,
          onboardingCompleted: true,
        };

        const token = await createJWT(payload, TEST_SECRET, '1h');
        const decoded = await verifyJWT(token, TEST_SECRET);

        expect(decoded).not.toBeNull();
        expect(decoded.roles).toContain('admin');
        expect(decoded.roles).toEqual(roles);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: admin-system, Property 2: Admin detection correctness', () => {
  /**
   * Validates: Requirements 1.2, 1.4
   */

  // Generator for valid role strings
  const roleArb = fc.constantFrom('entrepreneur', 'investor', 'mentor', 'viewer', 'editor', 'moderator');

  it('should return true if and only if roles array contains "admin"', () => {
    const nonAdminRoleArb = fc.constantFrom('entrepreneur', 'investor', 'mentor', 'viewer', 'editor', 'moderator');
    const rolesArrayArb = fc.array(nonAdminRoleArb, { minLength: 0, maxLength: 10 });

    fc.assert(
      fc.property(rolesArrayArb, fc.boolean(), (otherRoles: string[], includeAdmin: boolean) => {
        const roles = includeAdmin ? [...otherRoles, 'admin'] : otherRoles;
        const rolesJson = JSON.stringify(roles);

        const result = isAdmin(rolesJson);
        expect(result).toBe(includeAdmin);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false for null roles value', () => {
    fc.assert(
      fc.property(fc.constant(null), (rolesValue: null) => {
        expect(isAdmin(rolesValue)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false for empty string roles value', () => {
    fc.assert(
      fc.property(fc.constant(''), (rolesValue: string) => {
        expect(isAdmin(rolesValue)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false for empty JSON array "[]"', () => {
    fc.assert(
      fc.property(fc.constant('[]'), (rolesValue: string) => {
        expect(isAdmin(rolesValue)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false for invalid JSON strings', () => {
    const invalidJsonArb = fc.oneof(
      fc.constant('{invalid'),
      fc.constant('[unclosed'),
      fc.constant('not json at all'),
      fc.constant('"just a string'),
      fc.constant('undefined'),
      fc.constant('{]'),
      fc.constant('[}')
    );

    fc.assert(
      fc.property(invalidJsonArb, (rolesValue: string) => {
        expect(isAdmin(rolesValue)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return true only when parsed array contains exactly the string "admin"', () => {
    // Generate arrays that may or may not contain 'admin'
    const mixedRolesArb = fc.array(
      fc.constantFrom('admin', 'entrepreneur', 'investor', 'mentor', 'viewer', 'editor'),
      { minLength: 0, maxLength: 10 }
    );

    fc.assert(
      fc.property(mixedRolesArb, (roles: string[]) => {
        const rolesJson = JSON.stringify(roles);
        const result = isAdmin(rolesJson);
        const expected = roles.includes('admin');
        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false for non-array JSON values', () => {
    const nonArrayJsonArb = fc.oneof(
      fc.integer().map((n) => JSON.stringify(n)),
      fc.string().map((s) => JSON.stringify(s)),
      fc.constant('true'),
      fc.constant('false'),
      fc.constant('null'),
      fc.record({ admin: fc.boolean() }).map((obj) => JSON.stringify(obj))
    );

    fc.assert(
      fc.property(nonArrayJsonArb, (rolesValue: string) => {
        expect(isAdmin(rolesValue)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: admin-system, Property 5: Startup creation always sets pending_approval status
 * Validates: Requirements 3.1
 *
 * For any valid startup creation payload submitted by an authenticated user,
 * the resulting startup record in the database should have status 'pending_approval'.
 */

// --- Replicated startup creation logic (same as backend/workers-native.ts) ---

interface StartupCreationPayload {
  name: string;
  stage?: string;
  fundingAmount?: number;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  tags?: string[];
  lookingFor?: string[];
  teamSize?: string;
  socialImpact?: string;
  founderLinkedin?: string;
  pitch?: string;
}

interface StartupRecord {
  id: string;
  userId: string;
  name: string;
  stage: string;
  status: string;
  fundingAmount: number;
  description: string;
  industry: string;
  location: string;
  website: string;
  tags: string;
  lookingFor: string;
  teamSize: string;
  socialImpact: string;
  founderLinkedin: string;
  pitch: string;
}

/**
 * Replicates the startup creation logic from the backend.
 * The key invariant is that status is always set to 'pending_approval'
 * regardless of the input payload.
 */
function createStartupRecord(payload: StartupCreationPayload, userId: string): StartupRecord {
  const startupId = crypto.randomUUID();
  return {
    id: startupId,
    userId,
    name: payload.name,
    stage: payload.stage || 'idea',
    status: 'pending_approval', // Always hardcoded - this is the property under test
    fundingAmount: payload.fundingAmount || 0,
    description: payload.description || '',
    industry: payload.industry || '',
    location: payload.location || '',
    website: payload.website || '',
    tags: JSON.stringify(payload.tags || []),
    lookingFor: JSON.stringify(payload.lookingFor || []),
    teamSize: payload.teamSize || '',
    socialImpact: payload.socialImpact || '',
    founderLinkedin: payload.founderLinkedin || '',
    pitch: payload.pitch || '',
  };
}

// --- Property Test ---

describe('Feature: admin-system, Property 5: Startup creation always sets pending_approval status', () => {
  /**
   * Validates: Requirements 3.1
   */

  // Generators for startup creation payload fields
  const stageArb = fc.constantFrom('idea', 'mvp', 'growth', 'scaling', 'established');
  const nameArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);
  const descriptionArb = fc.string({ minLength: 0, maxLength: 500 });
  const industryArb = fc.constantFrom('tech', 'health', 'finance', 'education', 'retail', 'energy', '');
  const locationArb = fc.string({ minLength: 0, maxLength: 100 });
  const websiteArb = fc.oneof(fc.constant(''), fc.constant('https://example.com'), fc.webUrl());
  const tagsArb = fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 });
  const lookingForArb = fc.array(
    fc.constantFrom('co-founder', 'developer', 'designer', 'marketer', 'investor', 'advisor'),
    { minLength: 0, maxLength: 4 }
  );
  const teamSizeArb = fc.constantFrom('1', '2-5', '6-10', '11-50', '50+', '');
  const fundingAmountArb = fc.oneof(fc.constant(0), fc.nat({ max: 10000000 }));
  const userIdArb = fc.uuid();

  const startupPayloadArb = fc.record({
    name: nameArb,
    stage: fc.option(stageArb, { nil: undefined }),
    fundingAmount: fc.option(fundingAmountArb, { nil: undefined }),
    description: fc.option(descriptionArb, { nil: undefined }),
    industry: fc.option(industryArb, { nil: undefined }),
    location: fc.option(locationArb, { nil: undefined }),
    website: fc.option(websiteArb, { nil: undefined }),
    tags: fc.option(tagsArb, { nil: undefined }),
    lookingFor: fc.option(lookingForArb, { nil: undefined }),
    teamSize: fc.option(teamSizeArb, { nil: undefined }),
    socialImpact: fc.option(descriptionArb, { nil: undefined }),
    founderLinkedin: fc.option(fc.constant('https://linkedin.com/in/test'), { nil: undefined }),
    pitch: fc.option(descriptionArb, { nil: undefined }),
  });

  it('should always set status to pending_approval regardless of payload content', () => {
    fc.assert(
      fc.property(startupPayloadArb, userIdArb, (payload: StartupCreationPayload, userId: string) => {
        const record = createStartupRecord(payload, userId);
        expect(record.status).toBe('pending_approval');
      }),
      { numRuns: 100 }
    );
  });

  it('should set pending_approval status for all valid startup stages', () => {
    fc.assert(
      fc.property(stageArb, userIdArb, (stage: string, userId: string) => {
        const payload: StartupCreationPayload = {
          name: 'Test Startup',
          stage,
        };
        const record = createStartupRecord(payload, userId);
        expect(record.status).toBe('pending_approval');
      }),
      { numRuns: 100 }
    );
  });

  it('should set pending_approval status even when optional fields are omitted', () => {
    fc.assert(
      fc.property(nameArb, userIdArb, (name: string, userId: string) => {
        // Minimal payload with only required field
        const payload: StartupCreationPayload = { name };
        const record = createStartupRecord(payload, userId);
        expect(record.status).toBe('pending_approval');
      }),
      { numRuns: 100 }
    );
  });

  it('should never set status to active, paused, successful, or failed on creation', () => {
    fc.assert(
      fc.property(startupPayloadArb, userIdArb, (payload: StartupCreationPayload, userId: string) => {
        const record = createStartupRecord(payload, userId);
        expect(record.status).not.toBe('active');
        expect(record.status).not.toBe('paused');
        expect(record.status).not.toBe('successful');
        expect(record.status).not.toBe('failed');
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: admin-system, Property 3 (delete): Non-admin users receive 403 on delete endpoint
 * Validates: Requirements 6.2
 *
 * For any authenticated user whose roles array does not contain 'admin',
 * calling the delete startup endpoint should return HTTP 403 Forbidden.
 *
 * This test validates the pure logic: for any roles array that does NOT contain 'admin',
 * the admin check (isAdmin) should fail, which means the delete endpoint would return 403.
 */

// --- Replicated delete authorization logic (same as backend/workers-native.ts) ---

/**
 * Simulates the authorization check performed by the delete startup endpoint.
 * Returns the HTTP status code that would be returned:
 * - 403 if the user is not an admin
 * - 200 if the user is an admin (delete proceeds)
 */
function deleteStartupAuthCheck(rolesValue: string | null): { statusCode: number; authorized: boolean } {
  const authorized = isAdmin(rolesValue);
  if (!authorized) {
    return { statusCode: 403, authorized: false };
  }
  return { statusCode: 200, authorized: true };
}

describe('Feature: admin-system, Property 3 (delete): Non-admin users receive 403 on delete endpoint', () => {
  /**
   * Validates: Requirements 6.2
   */

  // Generator for non-admin role strings (never includes 'admin')
  const nonAdminRoleArb = fc.constantFrom(
    'entrepreneur',
    'investor',
    'mentor',
    'viewer',
    'editor',
    'moderator',
    'user',
    'contributor'
  );

  // Generator for roles arrays that do NOT contain 'admin'
  const nonAdminRolesArrayArb = fc.array(nonAdminRoleArb, { minLength: 0, maxLength: 10 });

  it('should return 403 for any roles array that does not contain "admin"', () => {
    fc.assert(
      fc.property(nonAdminRolesArrayArb, (roles: string[]) => {
        const rolesJson = JSON.stringify(roles);
        const result = deleteStartupAuthCheck(rolesJson);

        expect(result.statusCode).toBe(403);
        expect(result.authorized).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 403 when roles value is null (no roles assigned)', () => {
    fc.assert(
      fc.property(fc.constant(null), (rolesValue: null) => {
        const result = deleteStartupAuthCheck(rolesValue);

        expect(result.statusCode).toBe(403);
        expect(result.authorized).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 403 when roles value is empty string', () => {
    fc.assert(
      fc.property(fc.constant(''), (rolesValue: string) => {
        const result = deleteStartupAuthCheck(rolesValue);

        expect(result.statusCode).toBe(403);
        expect(result.authorized).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 403 when roles value is empty JSON array "[]"', () => {
    fc.assert(
      fc.property(fc.constant('[]'), (rolesValue: string) => {
        const result = deleteStartupAuthCheck(rolesValue);

        expect(result.statusCode).toBe(403);
        expect(result.authorized).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 403 for invalid JSON roles values', () => {
    const invalidJsonArb = fc.oneof(
      fc.constant('{invalid'),
      fc.constant('[unclosed'),
      fc.constant('not json at all'),
      fc.constant('"just a string"'),
      fc.constant('undefined'),
      fc.constant('{]'),
      fc.constant('[}')
    );

    fc.assert(
      fc.property(invalidJsonArb, (rolesValue: string) => {
        const result = deleteStartupAuthCheck(rolesValue);

        expect(result.statusCode).toBe(403);
        expect(result.authorized).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 403 for roles containing similar but not exact "admin" strings', () => {
    const almostAdminArb = fc.constantFrom(
      'Admin',
      'ADMIN',
      'administrator',
      'admin ',
      ' admin',
      'admins',
      'superadmin',
      'admin-user'
    );
    const rolesWithAlmostAdminArb = fc
      .array(nonAdminRoleArb, { minLength: 0, maxLength: 5 })
      .chain((baseRoles) => almostAdminArb.map((almostAdmin) => [...baseRoles, almostAdmin]));

    fc.assert(
      fc.property(rolesWithAlmostAdminArb, (roles: string[]) => {
        const rolesJson = JSON.stringify(roles);
        const result = deleteStartupAuthCheck(rolesJson);

        expect(result.statusCode).toBe(403);
        expect(result.authorized).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should only authorize delete when roles contains exactly "admin"', () => {
    // Contrast test: verify that adding 'admin' to any non-admin array DOES authorize
    fc.assert(
      fc.property(nonAdminRolesArrayArb, (baseRoles: string[]) => {
        const rolesWithAdmin = [...baseRoles, 'admin'];
        const rolesJson = JSON.stringify(rolesWithAdmin);
        const result = deleteStartupAuthCheck(rolesJson);

        expect(result.statusCode).toBe(200);
        expect(result.authorized).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: admin-system, Property 4: Public listings only contain active startups
 * Validates: Requirements 3.3, 3.4, 5.5, 10.1, 10.2, 10.3
 *
 * For any set of startups with mixed statuses in the database, the public listing endpoint
 * and the search endpoint should only return startups whose status is 'active'.
 */

// --- Replicated public listing filter logic (same as backend/workers-native.ts) ---

type StartupStatus = 'active' | 'pending_approval' | 'paused' | 'successful' | 'failed';

interface StartupRow {
  id: string;
  name: string;
  stage: string;
  status: StartupStatus;
  fundingAmount: number;
  userId: string;
  createdAt: string;
}

/**
 * Replicates the public listing filter from the backend.
 * The public endpoint only returns startups with status === 'active'.
 */
function filterPublicListings(startups: StartupRow[]): StartupRow[] {
  return startups.filter((s) => s.status === 'active');
}

/**
 * Replicates the search filter from the backend.
 * The search endpoint only returns startups with status === 'active',
 * optionally filtered by a name query.
 */
function filterSearchResults(startups: StartupRow[], query?: string): StartupRow[] {
  let filtered = startups.filter((s) => s.status === 'active');
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter((s) => s.name.toLowerCase().includes(lowerQuery));
  }
  return filtered;
}

// --- Property Test ---

describe('Feature: admin-system, Property 4: Public listings only contain active startups', () => {
  /**
   * Validates: Requirements 3.3, 3.4, 5.5, 10.1, 10.2, 10.3
   */

  // Generators
  const statusArb: fc.Arbitrary<StartupStatus> = fc.constantFrom(
    'active',
    'pending_approval',
    'paused',
    'successful',
    'failed'
  );
  const stageArb = fc.constantFrom('idea', 'mvp', 'growth', 'scaling', 'established');
  const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);

  const startupRowArb: fc.Arbitrary<StartupRow> = fc.record({
    id: fc.uuid(),
    name: nameArb,
    stage: stageArb,
    status: statusArb,
    fundingAmount: fc.nat({ max: 10000000 }),
    userId: fc.uuid(),
    createdAt: fc.integer({ min: 1577836800000, max: 1767225600000 }).map((ts) => new Date(ts).toISOString()),
  });

  const startupsListArb = fc.array(startupRowArb, { minLength: 0, maxLength: 30 });

  it('public listing should only return startups with status "active"', () => {
    fc.assert(
      fc.property(startupsListArb, (startups: StartupRow[]) => {
        const result = filterPublicListings(startups);

        // Every returned startup must have status 'active'
        for (const startup of result) {
          expect(startup.status).toBe('active');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('public listing should return ALL active startups from the input set', () => {
    fc.assert(
      fc.property(startupsListArb, (startups: StartupRow[]) => {
        const result = filterPublicListings(startups);
        const expectedActiveCount = startups.filter((s) => s.status === 'active').length;

        expect(result.length).toBe(expectedActiveCount);
      }),
      { numRuns: 100 }
    );
  });

  it('public listing should never include pending_approval startups', () => {
    fc.assert(
      fc.property(startupsListArb, (startups: StartupRow[]) => {
        const result = filterPublicListings(startups);

        const hasPending = result.some((s) => s.status === 'pending_approval');
        expect(hasPending).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('public listing should never include paused, successful, or failed startups', () => {
    fc.assert(
      fc.property(startupsListArb, (startups: StartupRow[]) => {
        const result = filterPublicListings(startups);

        for (const startup of result) {
          expect(startup.status).not.toBe('paused');
          expect(startup.status).not.toBe('successful');
          expect(startup.status).not.toBe('failed');
          expect(startup.status).not.toBe('pending_approval');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('search results should only return active startups matching the query', () => {
    const queryArb = fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(startupsListArb, queryArb, (startups: StartupRow[], query: string) => {
        const result = filterSearchResults(startups, query);

        // Every result must be active
        for (const startup of result) {
          expect(startup.status).toBe('active');
        }

        // Every result must match the query (case-insensitive)
        const lowerQuery = query.toLowerCase();
        for (const startup of result) {
          expect(startup.name.toLowerCase()).toContain(lowerQuery);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('search results without query should return only active startups', () => {
    fc.assert(
      fc.property(startupsListArb, (startups: StartupRow[]) => {
        const result = filterSearchResults(startups);
        const expectedActiveCount = startups.filter((s) => s.status === 'active').length;

        // All results must be active
        for (const startup of result) {
          expect(startup.status).toBe('active');
        }

        // Should return all active startups when no query filter
        expect(result.length).toBe(expectedActiveCount);
      }),
      { numRuns: 100 }
    );
  });

  it('when a startup transitions away from active, it should be excluded from public listings', () => {
    const nonActiveStatusArb: fc.Arbitrary<StartupStatus> = fc.constantFrom(
      'pending_approval',
      'paused',
      'successful',
      'failed'
    );

    fc.assert(
      fc.property(startupRowArb, nonActiveStatusArb, (startup: StartupRow, newStatus: StartupStatus) => {
        // Start with an active startup
        const activeStartup = { ...startup, status: 'active' as StartupStatus };
        const startups = [activeStartup];

        // Verify it appears in public listing
        const beforeResult = filterPublicListings(startups);
        expect(beforeResult.length).toBe(1);

        // Transition to non-active status
        const transitionedStartup = { ...activeStartup, status: newStatus };
        const afterResult = filterPublicListings([transitionedStartup]);

        // Should no longer appear in public listing
        expect(afterResult.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: admin-system, Property 3: Non-admin users receive 403 on admin endpoints
 * Validates: Requirements 2.3, 5.3, 6.2
 *
 * For any authenticated user whose roles array does not contain 'admin',
 * calling any admin-only API endpoint should return HTTP 403 Forbidden.
 */

// --- Replicated admin authorization logic ---

interface AdminAuthResult {
  authorized: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Replicates the core authorization check from requireAdmin().
 * Given a raw roles value from the database, determines if the user is authorized
 * as an admin. Returns the authorization result with appropriate status code.
 */
function checkAdminAuthorization(rolesValue: string | null): AdminAuthResult {
  let roles: string[] = [];
  try {
    roles = rolesValue ? JSON.parse(rolesValue) : [];
    if (!Array.isArray(roles)) {
      roles = [];
    }
  } catch {
    roles = [];
  }

  if (!roles.includes('admin')) {
    return {
      authorized: false,
      statusCode: 403,
      error: 'Forbidden: Admin access required',
    };
  }

  return { authorized: true };
}

describe('Feature: admin-system, Property 3: Non-admin users receive 403 on admin endpoints', () => {
  /**
   * Validates: Requirements 2.3, 5.3, 6.2
   */

  // Generator for non-admin role arrays (never contains 'admin')
  const nonAdminRoleArb = fc.constantFrom('entrepreneur', 'investor', 'mentor', 'viewer', 'editor', 'moderator');
  const nonAdminRolesArrayArb = fc.array(nonAdminRoleArb, { minLength: 0, maxLength: 10 });

  // Generator for admin endpoint paths
  const adminEndpointArb = fc.constantFrom(
    '/api/admin/pending-startups',
    '/api/admin/approve/some-id',
    '/api/admin/reject/some-id',
    '/api/admin/startups/some-id',
    '/api/admin/stats'
  );

  it('should return 403 for any user whose roles do not contain "admin"', () => {
    fc.assert(
      fc.property(nonAdminRolesArrayArb, adminEndpointArb, (roles: string[], _endpoint: string) => {
        const rolesJson = JSON.stringify(roles);
        const result = checkAdminAuthorization(rolesJson);

        expect(result.authorized).toBe(false);
        expect(result.statusCode).toBe(403);
        expect(result.error).toBe('Forbidden: Admin access required');
      }),
      { numRuns: 100 }
    );
  });

  it('should return 403 for null roles value on any admin endpoint', () => {
    fc.assert(
      fc.property(adminEndpointArb, (_endpoint: string) => {
        const result = checkAdminAuthorization(null);

        expect(result.authorized).toBe(false);
        expect(result.statusCode).toBe(403);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 403 for invalid JSON roles on any admin endpoint', () => {
    const invalidJsonArb = fc.oneof(
      fc.constant('{invalid'),
      fc.constant('[unclosed'),
      fc.constant('not json'),
      fc.constant('"just a string"'),
      fc.constant('undefined')
    );

    fc.assert(
      fc.property(invalidJsonArb, adminEndpointArb, (rolesValue: string, _endpoint: string) => {
        const result = checkAdminAuthorization(rolesValue);

        expect(result.authorized).toBe(false);
        expect(result.statusCode).toBe(403);
      }),
      { numRuns: 100 }
    );
  });

  it('should authorize users whose roles contain "admin"', () => {
    const rolesWithAdminArb = nonAdminRolesArrayArb.map((roles) => [...roles, 'admin']);

    fc.assert(
      fc.property(rolesWithAdminArb, (roles: string[]) => {
        const rolesJson = JSON.stringify(roles);
        const result = checkAdminAuthorization(rolesJson);

        expect(result.authorized).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-system, Property 6: Approve transitions pending to active
 * Validates: Requirements 5.1
 *
 * For any startup with status 'pending_approval', when an admin calls the approve
 * endpoint, the startup's status should become 'active'.
 */

// --- Replicated approve logic ---

interface Startup {
  id: string;
  name: string;
  stage: string;
  status: string;
  userId: string;
  createdAt: string;
}

interface ApproveResult {
  success: boolean;
  newStatus?: string;
  errorCode?: number;
  error?: string;
}

/**
 * Replicates the approve logic from the backend.
 * Checks that the startup exists and is in 'pending_approval' status,
 * then transitions it to 'active'.
 */
function approveStartup(startup: Startup | null): ApproveResult {
  if (!startup) {
    return { success: false, errorCode: 404, error: 'Startup not found' };
  }

  if (startup.status !== 'pending_approval') {
    return { success: false, errorCode: 400, error: 'Startup is not pending approval' };
  }

  return { success: true, newStatus: 'active' };
}

describe('Feature: admin-system, Property 6: Approve transitions pending to active', () => {
  /**
   * Validates: Requirements 5.1
   */

  const stageArb = fc.constantFrom('idea', 'mvp', 'growth', 'scaling', 'established');
  const nameArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

  // Generator for pending startups
  // Generate ISO date strings using integer timestamps to avoid invalid date issues
  const isoDateArb = fc.integer({ min: 1577836800000, max: 1767139200000 }).map((ts) => new Date(ts).toISOString());

  const pendingStartupArb = fc.record({
    id: fc.uuid(),
    name: nameArb,
    stage: stageArb,
    status: fc.constant('pending_approval'),
    userId: fc.uuid(),
    createdAt: isoDateArb,
  });

  it('should transition any pending_approval startup to active on approve', () => {
    fc.assert(
      fc.property(pendingStartupArb, (startup: Startup) => {
        const result = approveStartup(startup);

        expect(result.success).toBe(true);
        expect(result.newStatus).toBe('active');
      }),
      { numRuns: 100 }
    );
  });

  it('should reject approval for startups not in pending_approval status', () => {
    const nonPendingStatusArb = fc.constantFrom('active', 'paused', 'successful', 'failed');
    const nonPendingStartupArb = fc.record({
      id: fc.uuid(),
      name: nameArb,
      stage: stageArb,
      status: nonPendingStatusArb,
      userId: fc.uuid(),
      createdAt: isoDateArb,
    });

    fc.assert(
      fc.property(nonPendingStartupArb, (startup: Startup) => {
        const result = approveStartup(startup);

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe(400);
        expect(result.error).toBe('Startup is not pending approval');
      }),
      { numRuns: 100 }
    );
  });

  it('should return 404 when startup does not exist', () => {
    fc.assert(
      fc.property(fc.constant(null), (startup: null) => {
        const result = approveStartup(startup);

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe(404);
        expect(result.error).toBe('Startup not found');
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-system, Property 7: Reject transitions pending to failed
 * Validates: Requirements 5.2
 *
 * For any startup with status 'pending_approval', when an admin calls the reject
 * endpoint, the startup's status should become 'failed'.
 */

// --- Replicated reject logic ---

interface RejectResult {
  success: boolean;
  newStatus?: string;
  errorCode?: number;
  error?: string;
}

/**
 * Replicates the reject logic from the backend.
 * Checks that the startup exists and is in 'pending_approval' status,
 * then transitions it to 'failed'.
 */
function rejectStartup(startup: Startup | null): RejectResult {
  if (!startup) {
    return { success: false, errorCode: 404, error: 'Startup not found' };
  }

  if (startup.status !== 'pending_approval') {
    return { success: false, errorCode: 400, error: 'Startup is not pending approval' };
  }

  return { success: true, newStatus: 'failed' };
}

describe('Feature: admin-system, Property 7: Reject transitions pending to failed', () => {
  /**
   * Validates: Requirements 5.2
   */

  const stageArb = fc.constantFrom('idea', 'mvp', 'growth', 'scaling', 'established');
  const nameArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

  // Generate ISO date strings using integer timestamps to avoid invalid date issues
  const isoDateArb = fc.integer({ min: 1577836800000, max: 1767139200000 }).map((ts) => new Date(ts).toISOString());

  // Generator for pending startups
  const pendingStartupArb = fc.record({
    id: fc.uuid(),
    name: nameArb,
    stage: stageArb,
    status: fc.constant('pending_approval'),
    userId: fc.uuid(),
    createdAt: isoDateArb,
  });

  it('should transition any pending_approval startup to failed on reject', () => {
    fc.assert(
      fc.property(pendingStartupArb, (startup: Startup) => {
        const result = rejectStartup(startup);

        expect(result.success).toBe(true);
        expect(result.newStatus).toBe('failed');
      }),
      { numRuns: 100 }
    );
  });

  it('should reject rejection for startups not in pending_approval status', () => {
    const nonPendingStatusArb = fc.constantFrom('active', 'paused', 'successful', 'failed');
    const isoDateArb2 = fc.integer({ min: 1577836800000, max: 1767139200000 }).map((ts) => new Date(ts).toISOString());
    const nonPendingStartupArb = fc.record({
      id: fc.uuid(),
      name: nameArb,
      stage: stageArb,
      status: nonPendingStatusArb,
      userId: fc.uuid(),
      createdAt: isoDateArb2,
    });

    fc.assert(
      fc.property(nonPendingStartupArb, (startup: Startup) => {
        const result = rejectStartup(startup);

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe(400);
        expect(result.error).toBe('Startup is not pending approval');
      }),
      { numRuns: 100 }
    );
  });

  it('should return 404 when startup does not exist', () => {
    fc.assert(
      fc.property(fc.constant(null), (startup: null) => {
        const result = rejectStartup(startup);

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe(404);
        expect(result.error).toBe('Startup not found');
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-system, Property 8: Pending startups endpoint returns correct filtered and ordered set
 * Validates: Requirements 7.1, 7.2, 7.3
 *
 * For any set of startups in the database, the pending startups endpoint should return
 * exactly those with status 'pending_approval', each including name, creator name,
 * creation date, and stage, ordered by creation date ascending (oldest first).
 */

// --- Replicated pending startups filtering and ordering logic ---

interface StartupWithCreator {
  id: string;
  name: string;
  stage: string;
  status: string;
  createdAt: string;
  creator: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface PendingStartupResponse {
  id: string;
  name: string;
  stage: string;
  createdAt: string;
  creator: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Replicates the pending startups query logic:
 * SELECT ... FROM startups WHERE status = 'pending_approval' ORDER BY created_at ASC
 */
function getPendingStartups(startups: StartupWithCreator[]): PendingStartupResponse[] {
  return startups
    .filter((s) => s.status === 'pending_approval')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((s) => ({
      id: s.id,
      name: s.name,
      stage: s.stage,
      createdAt: s.createdAt,
      creator: s.creator,
    }));
}

describe('Feature: admin-system, Property 8: Pending startups endpoint returns correct filtered and ordered set', () => {
  /**
   * Validates: Requirements 7.1, 7.2, 7.3
   */

  const statusArb = fc.constantFrom('active', 'paused', 'successful', 'failed', 'pending_approval');
  const stageArb = fc.constantFrom('idea', 'mvp', 'growth', 'scaling', 'established');
  const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
  const emailArb = fc.emailAddress();

  // Generate ISO date strings using integer timestamps to avoid invalid date issues
  const dateArb = fc.integer({ min: 1577836800000, max: 1767139200000 }).map((ts) => new Date(ts).toISOString());

  const startupWithCreatorArb = fc.record({
    id: fc.uuid(),
    name: nameArb,
    stage: stageArb,
    status: statusArb,
    createdAt: dateArb,
    creator: fc.record({
      firstName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      lastName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      email: emailArb,
    }),
  });

  const startupsListArb = fc.array(startupWithCreatorArb, { minLength: 0, maxLength: 20 });

  it('should return only startups with status pending_approval', () => {
    fc.assert(
      fc.property(startupsListArb, (startups: StartupWithCreator[]) => {
        const result = getPendingStartups(startups);

        // All returned startups should have been pending_approval in the input
        for (const item of result) {
          const original = startups.find((s) => s.id === item.id);
          expect(original).toBeDefined();
          expect(original!.status).toBe('pending_approval');
        }

        // Count should match the number of pending_approval startups in input
        const expectedCount = startups.filter((s) => s.status === 'pending_approval').length;
        expect(result.length).toBe(expectedCount);
      }),
      { numRuns: 100 }
    );
  });

  it('should order results by createdAt ascending (oldest first)', () => {
    fc.assert(
      fc.property(startupsListArb, (startups: StartupWithCreator[]) => {
        const result = getPendingStartups(startups);

        for (let i = 1; i < result.length; i++) {
          expect(result[i].createdAt >= result[i - 1].createdAt).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should include name, stage, createdAt, and creator for each pending startup', () => {
    fc.assert(
      fc.property(startupsListArb, (startups: StartupWithCreator[]) => {
        const result = getPendingStartups(startups);

        for (const item of result) {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('stage');
          expect(item).toHaveProperty('createdAt');
          expect(item).toHaveProperty('creator');
          expect(item.creator).toHaveProperty('firstName');
          expect(item.creator).toHaveProperty('lastName');
          expect(item.creator).toHaveProperty('email');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should return empty array when no startups have pending_approval status', () => {
    const nonPendingStatusArb = fc.constantFrom('active', 'paused', 'successful', 'failed');
    const nonPendingStartupArb = fc.record({
      id: fc.uuid(),
      name: nameArb,
      stage: stageArb,
      status: nonPendingStatusArb,
      createdAt: dateArb,
      creator: fc.record({
        firstName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        lastName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        email: emailArb,
      }),
    });
    const nonPendingListArb = fc.array(nonPendingStartupArb, { minLength: 1, maxLength: 20 });

    fc.assert(
      fc.property(nonPendingListArb, (startups: StartupWithCreator[]) => {
        const result = getPendingStartups(startups);
        expect(result.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-system, Property 9: Admin stats reflect current database state
 * Validates: Requirements 9.1, 9.2, 9.3
 *
 * For any database state, the admin stats endpoint should return totalUsers equal to
 * the count of users, totalStartups equal to the count of startups, and pendingStartups
 * equal to the count of startups with status 'pending_approval'.
 */

// --- Replicated stats computation logic ---

interface AdminStats {
  totalUsers: number;
  totalStartups: number;
  pendingStartups: number;
}

/**
 * Replicates the stats computation from the backend:
 * - totalUsers = COUNT(*) FROM users
 * - totalStartups = COUNT(*) FROM startups
 * - pendingStartups = COUNT(*) FROM startups WHERE status = 'pending_approval'
 */
function computeAdminStats(userCount: number, startups: { status: string }[]): AdminStats {
  return {
    totalUsers: userCount,
    totalStartups: startups.length,
    pendingStartups: startups.filter((s) => s.status === 'pending_approval').length,
  };
}

describe('Feature: admin-system, Property 9: Admin stats reflect current database state', () => {
  /**
   * Validates: Requirements 9.1, 9.2, 9.3
   */

  const statusArb = fc.constantFrom('active', 'paused', 'successful', 'failed', 'pending_approval');
  const startupArb = fc.record({ status: statusArb });
  const startupsArb = fc.array(startupArb, { minLength: 0, maxLength: 50 });
  const userCountArb = fc.nat({ max: 1000 });

  it('should return totalUsers equal to the count of users', () => {
    fc.assert(
      fc.property(userCountArb, startupsArb, (userCount: number, startups: { status: string }[]) => {
        const stats = computeAdminStats(userCount, startups);
        expect(stats.totalUsers).toBe(userCount);
      }),
      { numRuns: 100 }
    );
  });

  it('should return totalStartups equal to the count of all startups', () => {
    fc.assert(
      fc.property(userCountArb, startupsArb, (userCount: number, startups: { status: string }[]) => {
        const stats = computeAdminStats(userCount, startups);
        expect(stats.totalStartups).toBe(startups.length);
      }),
      { numRuns: 100 }
    );
  });

  it('should return pendingStartups equal to the count of startups with pending_approval status', () => {
    fc.assert(
      fc.property(userCountArb, startupsArb, (userCount: number, startups: { status: string }[]) => {
        const stats = computeAdminStats(userCount, startups);
        const expectedPending = startups.filter((s) => s.status === 'pending_approval').length;
        expect(stats.pendingStartups).toBe(expectedPending);
      }),
      { numRuns: 100 }
    );
  });

  it('should return 0 for all stats when database is empty', () => {
    fc.assert(
      fc.property(fc.constant(0), fc.constant([]), (userCount: number, startups: { status: string }[]) => {
        const stats = computeAdminStats(userCount, startups);
        expect(stats.totalUsers).toBe(0);
        expect(stats.totalStartups).toBe(0);
        expect(stats.pendingStartups).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should have pendingStartups <= totalStartups for any database state', () => {
    fc.assert(
      fc.property(userCountArb, startupsArb, (userCount: number, startups: { status: string }[]) => {
        const stats = computeAdminStats(userCount, startups);
        expect(stats.pendingStartups).toBeLessThanOrEqual(stats.totalStartups);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-system, Property 11: Admin deletion cascades to associated records
 * Validates: Requirements 6.1
 *
 * For any startup with associated investor records, when an admin deletes the startup,
 * both the startup record and all associated investor records should be removed from
 * the database.
 */

// --- Replicated cascade deletion logic ---

interface InvestorRecord {
  id: string;
  startupId: string;
  userId: string;
  amount: number;
}

interface DatabaseState {
  startups: Startup[];
  investors: InvestorRecord[];
}

/**
 * Replicates the cascade deletion logic from the backend:
 * 1. DELETE FROM investors WHERE startup_id = ?
 * 2. DELETE FROM startups WHERE id = ?
 */
function deleteStartupCascade(db: DatabaseState, startupId: string): DatabaseState {
  return {
    startups: db.startups.filter((s) => s.id !== startupId),
    investors: db.investors.filter((i) => i.startupId !== startupId),
  };
}

describe('Feature: admin-system, Property 11: Admin deletion cascades to associated records', () => {
  /**
   * Validates: Requirements 6.1
   */

  const stageArb = fc.constantFrom('idea', 'mvp', 'growth', 'scaling', 'established');
  const statusArb = fc.constantFrom('active', 'paused', 'successful', 'failed', 'pending_approval');
  const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
  const isoDateArb = fc.integer({ min: 1577836800000, max: 1767139200000 }).map((ts) => new Date(ts).toISOString());

  const startupArb = fc.record({
    id: fc.uuid(),
    name: nameArb,
    stage: stageArb,
    status: statusArb,
    userId: fc.uuid(),
    createdAt: isoDateArb,
  });

  // Generate a database state with startups and investors linked to those startups
  const databaseStateArb = fc.array(startupArb, { minLength: 1, maxLength: 10 }).chain((startups) => {
    // Generate investors that reference existing startup IDs
    const startupIds = startups.map((s) => s.id);
    const investorArb = fc.record({
      id: fc.uuid(),
      startupId: fc.constantFrom(...startupIds),
      userId: fc.uuid(),
      amount: fc.nat({ max: 1000000 }),
    });
    const investorsArb = fc.array(investorArb, { minLength: 0, maxLength: 20 });

    return investorsArb.map((investors) => ({
      startups,
      investors,
    }));
  });

  it('should remove the startup record after deletion', () => {
    fc.assert(
      fc.property(databaseStateArb, (db: DatabaseState) => {
        // Pick the first startup to delete
        const targetId = db.startups[0].id;
        const result = deleteStartupCascade(db, targetId);

        // The deleted startup should not exist in the result
        expect(result.startups.find((s) => s.id === targetId)).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should remove all investor records associated with the deleted startup', () => {
    fc.assert(
      fc.property(databaseStateArb, (db: DatabaseState) => {
        const targetId = db.startups[0].id;
        const result = deleteStartupCascade(db, targetId);

        // No investors should reference the deleted startup
        const remainingInvestorsForTarget = result.investors.filter((i) => i.startupId === targetId);
        expect(remainingInvestorsForTarget.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should not affect other startups or their investors', () => {
    fc.assert(
      fc.property(databaseStateArb, (db: DatabaseState) => {
        const targetId = db.startups[0].id;
        const result = deleteStartupCascade(db, targetId);

        // Other startups should remain unchanged
        const otherStartups = db.startups.filter((s) => s.id !== targetId);
        for (const startup of otherStartups) {
          expect(result.startups.find((s) => s.id === startup.id)).toBeDefined();
        }

        // Investors for other startups should remain unchanged
        const otherInvestors = db.investors.filter((i) => i.startupId !== targetId);
        expect(result.investors.length).toBe(otherInvestors.length);
        for (const investor of otherInvestors) {
          expect(result.investors.find((i) => i.id === investor.id)).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should handle startups with no associated investors', () => {
    fc.assert(
      fc.property(startupArb, (startup: Startup) => {
        const db: DatabaseState = {
          startups: [startup],
          investors: [], // No investors
        };

        const result = deleteStartupCascade(db, startup.id);

        expect(result.startups.length).toBe(0);
        expect(result.investors.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle startups with multiple associated investors', () => {
    fc.assert(
      fc.property(
        startupArb,
        fc.array(fc.record({ id: fc.uuid(), userId: fc.uuid(), amount: fc.nat({ max: 1000000 }) }), {
          minLength: 1,
          maxLength: 10,
        }),
        (startup: Startup, investorData: { id: string; userId: string; amount: number }[]) => {
          const investors: InvestorRecord[] = investorData.map((inv) => ({
            ...inv,
            startupId: startup.id,
          }));

          const db: DatabaseState = {
            startups: [startup],
            investors,
          };

          const result = deleteStartupCascade(db, startup.id);

          expect(result.startups.length).toBe(0);
          expect(result.investors.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: admin-system, Property 10: User dashboard shows all own startups regardless of status
 * Validates: Requirements 4.1
 *
 * For any user with startups of various statuses (including 'pending_approval'),
 * the user startups endpoint should return all startups owned by that user without
 * filtering by status.
 */

// --- Replicated user startups query logic ---

interface UserStartup {
  id: string;
  name: string;
  stage: string;
  status: string;
  fundingAmount: number;
  userId: string;
}

/**
 * Replicates the user startups query from the backend:
 * SELECT * FROM startups WHERE user_id = ? (no status filter)
 *
 * The key invariant is that ALL startups belonging to the user are returned,
 * regardless of their status.
 */
function getUserStartups(allStartups: UserStartup[], userId: string): UserStartup[] {
  return allStartups.filter((s) => s.userId === userId);
}

describe('Feature: admin-system, Property 10: User dashboard shows all own startups regardless of status', () => {
  /**
   * Validates: Requirements 4.1
   */

  const statusArb = fc.constantFrom('active', 'pending_approval', 'paused', 'successful', 'failed');
  const stageArb = fc.constantFrom('idea', 'mvp', 'growth', 'scaling', 'established');
  const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);

  const userIdArb = fc.uuid();

  // Generator for a user's startups with mixed statuses
  const userStartupArb = (userId: string) =>
    fc.record({
      id: fc.uuid(),
      name: nameArb,
      stage: stageArb,
      status: statusArb,
      fundingAmount: fc.nat({ max: 10000000 }),
      userId: fc.constant(userId),
    });

  // Generator for other users' startups
  const otherStartupArb = (excludeUserId: string) =>
    fc.record({
      id: fc.uuid(),
      name: nameArb,
      stage: stageArb,
      status: statusArb,
      fundingAmount: fc.nat({ max: 10000000 }),
      userId: fc.uuid().filter((id) => id !== excludeUserId),
    });

  it('should return ALL startups owned by the user regardless of status', () => {
    fc.assert(
      fc.property(userIdArb, (userId: string) => {
        // Use a nested property to generate startups for this specific user
        fc.assert(
          fc.property(
            fc.array(userStartupArb(userId), { minLength: 1, maxLength: 10 }),
            fc.array(otherStartupArb(userId), { minLength: 0, maxLength: 10 }),
            (userStartups: UserStartup[], otherStartups: UserStartup[]) => {
              const allStartups = [...userStartups, ...otherStartups];
              const result = getUserStartups(allStartups, userId);

              // Should return exactly the user's startups
              expect(result.length).toBe(userStartups.length);

              // Every returned startup should belong to the user
              for (const startup of result) {
                expect(startup.userId).toBe(userId);
              }
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 10 }
    );
  });

  it('should include pending_approval startups in the result', () => {
    fc.assert(
      fc.property(userIdArb, (userId: string) => {
        // Create startups with at least one pending_approval
        const pendingStartup: UserStartup = {
          id: crypto.randomUUID(),
          name: 'Pending Startup',
          stage: 'idea',
          status: 'pending_approval',
          fundingAmount: 0,
          userId,
        };

        const activeStartup: UserStartup = {
          id: crypto.randomUUID(),
          name: 'Active Startup',
          stage: 'mvp',
          status: 'active',
          fundingAmount: 50000,
          userId,
        };

        const allStartups = [pendingStartup, activeStartup];
        const result = getUserStartups(allStartups, userId);

        // Both startups should be returned
        expect(result.length).toBe(2);
        expect(result.some((s) => s.status === 'pending_approval')).toBe(true);
        expect(result.some((s) => s.status === 'active')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should not filter out any status from user startups', () => {
    const allStatuses = ['active', 'pending_approval', 'paused', 'successful', 'failed'];

    fc.assert(
      fc.property(userIdArb, (userId: string) => {
        // Create one startup for each status
        const startups: UserStartup[] = allStatuses.map((status, i) => ({
          id: crypto.randomUUID(),
          name: `Startup ${i}`,
          stage: 'idea',
          status,
          fundingAmount: 0,
          userId,
        }));

        const result = getUserStartups(startups, userId);

        // All statuses should be present in the result
        expect(result.length).toBe(allStatuses.length);
        for (const status of allStatuses) {
          expect(result.some((s) => s.status === status)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should not return startups belonging to other users', () => {
    fc.assert(
      fc.property(
        userIdArb,
        fc.uuid(),
        (userId: string, otherUserId: string) => {
          fc.pre(userId !== otherUserId);

          const userStartup: UserStartup = {
            id: crypto.randomUUID(),
            name: 'My Startup',
            stage: 'idea',
            status: 'active',
            fundingAmount: 0,
            userId,
          };

          const otherStartup: UserStartup = {
            id: crypto.randomUUID(),
            name: 'Other Startup',
            stage: 'mvp',
            status: 'active',
            fundingAmount: 10000,
            userId: otherUserId,
          };

          const allStartups = [userStartup, otherStartup];
          const result = getUserStartups(allStartups, userId);

          expect(result.length).toBe(1);
          expect(result[0].userId).toBe(userId);
          expect(result.some((s) => s.userId === otherUserId)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return empty array when user has no startups', () => {
    fc.assert(
      fc.property(
        userIdArb,
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: nameArb,
            stage: stageArb,
            status: statusArb,
            fundingAmount: fc.nat({ max: 10000000 }),
            userId: fc.uuid(),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (userId: string, otherStartups: UserStartup[]) => {
          // Ensure none of the startups belong to our user
          const filtered = otherStartups.filter((s) => s.userId !== userId);
          const result = getUserStartups(filtered, userId);

          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-system, Property 12: Creator can access own startup regardless of status
 * Validates: Requirements 10.4
 *
 * For any startup with any status (including 'pending_approval', 'paused', 'failed'),
 * the startup's creator should be able to access the startup detail endpoint and
 * receive the full startup data.
 */

// --- Replicated startup detail access logic ---

interface StartupDetail {
  id: string;
  name: string;
  stage: string;
  status: string;
  userId: string;
  fundingAmount: number;
  description: string;
}

interface AccessResult {
  allowed: boolean;
  startup?: StartupDetail;
  errorCode?: number;
  error?: string;
}

/**
 * Replicates the startup detail access logic from the backend.
 * A creator can always access their own startup regardless of status.
 * Non-creators can only access startups with status 'active'.
 */
function canAccessStartupDetail(
  startup: StartupDetail | null,
  requestingUserId: string
): AccessResult {
  if (!startup) {
    return { allowed: false, errorCode: 404, error: 'Startup not found' };
  }

  // Creator can always access their own startup
  if (startup.userId === requestingUserId) {
    return { allowed: true, startup };
  }

  // Non-creators can only access active startups
  if (startup.status === 'active') {
    return { allowed: true, startup };
  }

  // Non-creator trying to access non-active startup
  return { allowed: false, errorCode: 404, error: 'Startup not found' };
}

describe('Feature: admin-system, Property 12: Creator can access own startup regardless of status', () => {
  /**
   * Validates: Requirements 10.4
   */

  const statusArb = fc.constantFrom('active', 'pending_approval', 'paused', 'successful', 'failed');
  const stageArb = fc.constantFrom('idea', 'mvp', 'growth', 'scaling', 'established');
  const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
  const descriptionArb = fc.string({ minLength: 0, maxLength: 200 });

  const startupDetailArb = (userId: string) =>
    fc.record({
      id: fc.uuid(),
      name: nameArb,
      stage: stageArb,
      status: statusArb,
      userId: fc.constant(userId),
      fundingAmount: fc.nat({ max: 10000000 }),
      description: descriptionArb,
    });

  it('should allow creator to access their own startup regardless of status', () => {
    fc.assert(
      fc.property(fc.uuid(), (creatorId: string) => {
        fc.assert(
          fc.property(startupDetailArb(creatorId), (startup: StartupDetail) => {
            const result = canAccessStartupDetail(startup, creatorId);

            expect(result.allowed).toBe(true);
            expect(result.startup).toEqual(startup);
          }),
          { numRuns: 10 }
        );
      }),
      { numRuns: 10 }
    );
  });

  it('should allow creator to access pending_approval startup', () => {
    fc.assert(
      fc.property(fc.uuid(), nameArb, stageArb, descriptionArb, (creatorId, name, stage, description) => {
        const startup: StartupDetail = {
          id: crypto.randomUUID(),
          name,
          stage,
          status: 'pending_approval',
          userId: creatorId,
          fundingAmount: 0,
          description,
        };

        const result = canAccessStartupDetail(startup, creatorId);

        expect(result.allowed).toBe(true);
        expect(result.startup).toEqual(startup);
      }),
      { numRuns: 100 }
    );
  });

  it('should allow creator to access failed startup', () => {
    fc.assert(
      fc.property(fc.uuid(), nameArb, (creatorId, name) => {
        const startup: StartupDetail = {
          id: crypto.randomUUID(),
          name,
          stage: 'idea',
          status: 'failed',
          userId: creatorId,
          fundingAmount: 0,
          description: '',
        };

        const result = canAccessStartupDetail(startup, creatorId);

        expect(result.allowed).toBe(true);
        expect(result.startup).toEqual(startup);
      }),
      { numRuns: 100 }
    );
  });

  it('should allow creator to access paused startup', () => {
    fc.assert(
      fc.property(fc.uuid(), nameArb, (creatorId, name) => {
        const startup: StartupDetail = {
          id: crypto.randomUUID(),
          name,
          stage: 'mvp',
          status: 'paused',
          userId: creatorId,
          fundingAmount: 5000,
          description: '',
        };

        const result = canAccessStartupDetail(startup, creatorId);

        expect(result.allowed).toBe(true);
        expect(result.startup).toEqual(startup);
      }),
      { numRuns: 100 }
    );
  });

  it('should deny non-creator access to non-active startups', () => {
    const nonActiveStatusArb = fc.constantFrom('pending_approval', 'paused', 'successful', 'failed');

    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        nonActiveStatusArb,
        nameArb,
        (creatorId: string, requesterId: string, status: string, name: string) => {
          fc.pre(creatorId !== requesterId);

          const startup: StartupDetail = {
            id: crypto.randomUUID(),
            name,
            stage: 'idea',
            status,
            userId: creatorId,
            fundingAmount: 0,
            description: '',
          };

          const result = canAccessStartupDetail(startup, requesterId);

          expect(result.allowed).toBe(false);
          expect(result.errorCode).toBe(404);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow non-creator access to active startups', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        nameArb,
        (creatorId: string, requesterId: string, name: string) => {
          fc.pre(creatorId !== requesterId);

          const startup: StartupDetail = {
            id: crypto.randomUUID(),
            name,
            stage: 'growth',
            status: 'active',
            userId: creatorId,
            fundingAmount: 100000,
            description: 'An active startup',
          };

          const result = canAccessStartupDetail(startup, requesterId);

          expect(result.allowed).toBe(true);
          expect(result.startup).toEqual(startup);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 404 when startup does not exist', () => {
    fc.assert(
      fc.property(fc.uuid(), (requesterId: string) => {
        const result = canAccessStartupDetail(null, requesterId);

        expect(result.allowed).toBe(false);
        expect(result.errorCode).toBe(404);
        expect(result.error).toBe('Startup not found');
      }),
      { numRuns: 100 }
    );
  });
});
