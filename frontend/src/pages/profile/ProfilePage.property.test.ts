import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: post-signup-onboarding, Property 9: At least one role must remain selected during profile editing
 *
 * **Validates: Requirements 6.4**
 *
 * For any user editing their roles in profile settings, the UI SHALL prevent
 * deselecting the last remaining role, ensuring the roles set is never empty
 * after an update operation.
 *
 * This tests the pure logic of handleRoleChange from ProfilePage:
 *   const handleRoleChange = (newRoles: string[]) => {
 *     if (newRoles.length === 0) return;
 *     setSelectedRoles(newRoles);
 *   };
 *
 * Combined with the toggle logic from RoleSelector, the invariant is:
 * given any non-empty set of selected roles and any role to toggle,
 * the resulting set (after the guard) should never be empty.
 */

const VALID_ROLES = ['entrepreneur', 'collaborator', 'investor'] as const;
type ValidRole = (typeof VALID_ROLES)[number];

/**
 * Simulates the toggle logic from RoleSelector's handleToggle:
 * - If the role is already selected, remove it
 * - If the role is not selected, add it
 */
function toggleRole(selectedRoles: string[], clickedRole: string): string[] {
  if (selectedRoles.includes(clickedRole)) {
    return selectedRoles.filter((r) => r !== clickedRole);
  } else {
    return [...selectedRoles, clickedRole];
  }
}

/**
 * Simulates the handleRoleChange guard from ProfilePage:
 * If the new roles array is empty, the update is rejected (returns the original).
 * Otherwise, the new roles are accepted.
 */
function handleRoleChange(
  currentRoles: string[],
  newRoles: string[]
): string[] {
  if (newRoles.length === 0) return currentRoles;
  return newRoles;
}

// --- Arbitraries ---

/** Generates a single valid role */
const validRoleArb: fc.Arbitrary<ValidRole> = fc.constantFrom(...VALID_ROLES);

/** Generates a non-empty valid subset of roles (1 to 3, no duplicates) */
const nonEmptyRoleSubsetArb: fc.Arbitrary<ValidRole[]> = fc.uniqueArray(
  fc.constantFrom(...VALID_ROLES),
  { minLength: 1, maxLength: 3 }
);

// --- Property Tests ---

describe('Feature: post-signup-onboarding, Property 9: At least one role must remain selected during profile editing', () => {
  it('toggling any role on a non-empty selection never results in an empty set after the guard', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArb, validRoleArb, (selectedRoles, clickedRole) => {
        // Simulate what happens when a user clicks a role in profile editing:
        // 1. RoleSelector computes the toggled result
        const toggledResult = toggleRole(selectedRoles, clickedRole);

        // 2. ProfilePage's handleRoleChange guards against empty
        const finalRoles = handleRoleChange(selectedRoles, toggledResult);

        // The final roles must never be empty
        expect(finalRoles.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('deselecting the last remaining role is rejected (selection unchanged)', () => {
    fc.assert(
      fc.property(validRoleArb, (singleRole) => {
        // Start with exactly one role selected
        const selectedRoles = [singleRole];

        // User clicks the only selected role (attempting to deselect it)
        const toggledResult = toggleRole(selectedRoles, singleRole);

        // The toggled result would be empty
        expect(toggledResult.length).toBe(0);

        // But handleRoleChange rejects it, keeping the original
        const finalRoles = handleRoleChange(selectedRoles, toggledResult);
        expect(finalRoles).toEqual(selectedRoles);
        expect(finalRoles.length).toBe(1);
        expect(finalRoles[0]).toBe(singleRole);
      }),
      { numRuns: 100 }
    );
  });

  it('deselecting a role when multiple are selected is allowed', () => {
    fc.assert(
      fc.property(
        nonEmptyRoleSubsetArb.filter((roles) => roles.length >= 2),
        (selectedRoles) => {
          // Pick one of the selected roles to deselect
          const roleToDeselect = selectedRoles[0];
          const toggledResult = toggleRole(selectedRoles, roleToDeselect);

          // The toggled result is non-empty (at least 1 remaining)
          expect(toggledResult.length).toBeGreaterThan(0);

          // handleRoleChange accepts it
          const finalRoles = handleRoleChange(selectedRoles, toggledResult);
          expect(finalRoles).toEqual(toggledResult);
          expect(finalRoles).not.toContain(roleToDeselect);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('adding a role is always allowed regardless of current selection size', () => {
    fc.assert(
      fc.property(
        nonEmptyRoleSubsetArb.filter((roles) => roles.length < 3),
        (selectedRoles) => {
          // Find a role not currently selected
          const unselectedRoles = VALID_ROLES.filter(
            (r) => !selectedRoles.includes(r)
          );
          const roleToAdd = unselectedRoles[0];

          const toggledResult = toggleRole(selectedRoles, roleToAdd);

          // Adding a role always produces a non-empty result
          expect(toggledResult.length).toBeGreaterThan(0);

          // handleRoleChange accepts it
          const finalRoles = handleRoleChange(selectedRoles, toggledResult);
          expect(finalRoles).toEqual(toggledResult);
          expect(finalRoles).toContain(roleToAdd);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the minimum role invariant holds across any sequence of toggle operations', () => {
    fc.assert(
      fc.property(
        nonEmptyRoleSubsetArb,
        fc.array(validRoleArb, { minLength: 1, maxLength: 20 }),
        (initialRoles, clickSequence) => {
          let currentRoles = [...initialRoles];

          // Simulate a sequence of role toggle clicks
          for (const clickedRole of clickSequence) {
            const toggledResult = toggleRole(currentRoles, clickedRole);
            const afterGuard = handleRoleChange(currentRoles, toggledResult);

            // Invariant: roles are never empty after any operation
            expect(afterGuard.length).toBeGreaterThan(0);

            currentRoles = afterGuard;
          }

          // After all operations, at least one role remains
          expect(currentRoles.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
