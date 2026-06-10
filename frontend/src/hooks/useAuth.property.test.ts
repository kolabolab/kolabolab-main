import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useAuthStore } from './useAuth';

/**
 * Feature: post-signup-onboarding, Property 6: Auth store synchronizes after successful role mutation
 *
 * **Validates: Requirements 3.3, 6.3**
 *
 * For any successful response from the onboarding completion or role update API,
 * the auth store's user object SHALL immediately reflect the new roles array
 * without requiring a page reload or re-authentication.
 */

// --- Constants ---

const VALID_ROLES = ['entrepreneur', 'collaborator', 'investor'] as const;
type ValidRole = (typeof VALID_ROLES)[number];

// --- Arbitraries ---

/** Generates a non-empty valid subset of roles (1 to 3, no duplicates) */
const nonEmptyRoleSubsetArb: fc.Arbitrary<ValidRole[]> = fc.uniqueArray(
  fc.constantFrom(...VALID_ROLES),
  { minLength: 1, maxLength: 3 }
);

/** Generates a valid user object for seeding the store */
const userArb = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  username: fc.string({ minLength: 3, maxLength: 20 }).map((s) => s.replace(/[^a-z0-9]/gi, 'a')),
  firstName: fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/[^a-zA-Z]/g, 'A')),
  lastName: fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/[^a-zA-Z]/g, 'B')),
  roles: nonEmptyRoleSubsetArb,
  avatar: fc.option(fc.webUrl(), { nil: undefined }),
  bio: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
  company: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
  location: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
  isEmailVerified: fc.boolean(),
  onboardingCompleted: fc.boolean(),
});

const tokensArb = fc.record({
  accessToken: fc.string({ minLength: 10, maxLength: 50 }),
  refreshToken: fc.string({ minLength: 10, maxLength: 50 }),
});

// --- Property Tests ---

describe('Feature: post-signup-onboarding, Property 6: Auth store synchronizes after successful role mutation', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('updateUser({ roles: newRoles }) immediately reflects new roles in store state', () => {
    fc.assert(
      fc.property(
        userArb,
        tokensArb,
        nonEmptyRoleSubsetArb,
        (initialUser, tokens, newRoles) => {
          // Setup: seed the store with an authenticated user
          useAuthStore.getState().setAuth(initialUser, tokens);

          // Act: simulate successful role mutation by calling updateUser
          useAuthStore.getState().updateUser({ roles: newRoles });

          // Assert: store immediately reflects the new roles
          const storeUser = useAuthStore.getState().user;
          expect(storeUser).not.toBeNull();
          expect(storeUser!.roles).toEqual(newRoles);

          // Assert: other user fields remain unchanged
          expect(storeUser!.id).toBe(initialUser.id);
          expect(storeUser!.email).toBe(initialUser.email);
          expect(storeUser!.firstName).toBe(initialUser.firstName);
          expect(storeUser!.lastName).toBe(initialUser.lastName);
          expect(storeUser!.isEmailVerified).toBe(initialUser.isEmailVerified);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('updateUser({ roles, onboardingCompleted: true }) updates both fields atomically', () => {
    fc.assert(
      fc.property(
        userArb.map((u) => ({ ...u, onboardingCompleted: false })),
        tokensArb,
        nonEmptyRoleSubsetArb,
        (initialUser, tokens, newRoles) => {
          // Setup: seed the store with a user who has NOT completed onboarding
          useAuthStore.getState().setAuth(initialUser, tokens);

          // Act: simulate successful onboarding completion
          useAuthStore.getState().updateUser({
            roles: newRoles,
            onboardingCompleted: true,
          });

          // Assert: both fields are updated atomically in a single state read
          const storeUser = useAuthStore.getState().user;
          expect(storeUser).not.toBeNull();
          expect(storeUser!.roles).toEqual(newRoles);
          expect(storeUser!.onboardingCompleted).toBe(true);

          // Assert: other user fields remain unchanged
          expect(storeUser!.id).toBe(initialUser.id);
          expect(storeUser!.email).toBe(initialUser.email);
          expect(storeUser!.username).toBe(initialUser.username);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('store remains authenticated after role mutation', () => {
    fc.assert(
      fc.property(
        userArb,
        tokensArb,
        nonEmptyRoleSubsetArb,
        (initialUser, tokens, newRoles) => {
          // Setup
          useAuthStore.getState().setAuth(initialUser, tokens);

          // Act
          useAuthStore.getState().updateUser({ roles: newRoles });

          // Assert: authentication state is preserved
          const state = useAuthStore.getState();
          expect(state.isAuthenticated).toBe(true);
          expect(state.tokens).toEqual(tokens);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('updateUser is a no-op when no user is authenticated', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArb, (newRoles) => {
        // Setup: ensure store has no user
        useAuthStore.setState({ user: null, isAuthenticated: false });

        // Act: attempt to update roles with no user
        useAuthStore.getState().updateUser({ roles: newRoles });

        // Assert: store remains unchanged (no user)
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('sequential role mutations each reflect immediately without stale state', () => {
    fc.assert(
      fc.property(
        userArb,
        tokensArb,
        fc.array(nonEmptyRoleSubsetArb, { minLength: 2, maxLength: 5 }),
        (initialUser, tokens, roleSequence) => {
          // Setup
          useAuthStore.getState().setAuth(initialUser, tokens);

          // Act & Assert: each mutation immediately reflects
          for (const roles of roleSequence) {
            useAuthStore.getState().updateUser({ roles });
            const storeUser = useAuthStore.getState().user;
            expect(storeUser!.roles).toEqual(roles);
          }

          // Final state matches the last mutation
          const finalUser = useAuthStore.getState().user;
          expect(finalUser!.roles).toEqual(roleSequence[roleSequence.length - 1]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
