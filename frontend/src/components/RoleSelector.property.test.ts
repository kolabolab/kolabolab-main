import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: post-signup-onboarding, Property 2: Role selection toggle behavior
 * Feature: post-signup-onboarding, Property 3: Confirmation button enabled iff at least one role is selected
 *
 * **Validates: Requirements 2.1, 2.3, 2.4, 2.5**
 *
 * These property tests validate the role selection toggle logic (as a pure function)
 * and the confirmation button enabled/disabled invariant based on selected roles.
 */

// --- Pure logic extracted from RoleSelector component ---

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
 * Determines whether the confirmation button should be enabled.
 * The button is enabled iff at least one role is selected.
 */
function isButtonEnabled(selectedRoles: string[]): boolean {
  return selectedRoles.length > 0;
}

// --- Arbitraries ---

/** Generates a single valid role */
const validRoleArb: fc.Arbitrary<ValidRole> = fc.constantFrom(...VALID_ROLES);

/** Generates a valid subset of roles (0 to 3, no duplicates) */
const roleSubsetArb: fc.Arbitrary<ValidRole[]> = fc.uniqueArray(
  fc.constantFrom(...VALID_ROLES),
  { minLength: 0, maxLength: 3 }
);

/** Generates a non-empty valid subset of roles (1 to 3, no duplicates) */
const nonEmptyRoleSubsetArb: fc.Arbitrary<ValidRole[]> = fc.uniqueArray(
  fc.constantFrom(...VALID_ROLES),
  { minLength: 1, maxLength: 3 }
);

// --- Property Tests ---

describe('Feature: post-signup-onboarding, Property 2: Role selection toggle behavior', () => {
  /**
   * Validates: Requirements 2.1, 2.5
   *
   * For any set of currently selected roles and any role that is clicked,
   * if the role was previously selected it SHALL be removed from the set,
   * and if it was previously unselected it SHALL be added to the set.
   * The resulting set SHALL support multiple simultaneous selections (up to all three roles).
   */
  it('clicking a selected role removes it from the selection', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArb, (selectedRoles) => {
        // Pick a role that is currently selected
        const clickedRole = selectedRoles[0];
        const result = toggleRole(selectedRoles, clickedRole);

        // The clicked role must no longer be in the result
        expect(result).not.toContain(clickedRole);

        // The result length must be one less
        expect(result.length).toBe(selectedRoles.length - 1);

        // All other roles remain unchanged
        for (const role of selectedRoles) {
          if (role !== clickedRole) {
            expect(result).toContain(role);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('clicking an unselected role adds it to the selection', () => {
    fc.assert(
      fc.property(
        roleSubsetArb.filter((roles) => roles.length < 3),
        (selectedRoles) => {
          // Find a role that is NOT currently selected
          const unselectedRoles = VALID_ROLES.filter(
            (r) => !selectedRoles.includes(r)
          );
          // There must be at least one unselected role since we filtered for length < 3
          const clickedRole = unselectedRoles[0];
          const result = toggleRole(selectedRoles, clickedRole);

          // The clicked role must now be in the result
          expect(result).toContain(clickedRole);

          // The result length must be one more
          expect(result.length).toBe(selectedRoles.length + 1);

          // All previously selected roles remain
          for (const role of selectedRoles) {
            expect(result).toContain(role);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('toggling a role twice returns to the original selection', () => {
    fc.assert(
      fc.property(roleSubsetArb, validRoleArb, (selectedRoles, clickedRole) => {
        const afterFirst = toggleRole(selectedRoles, clickedRole);
        const afterSecond = toggleRole(afterFirst, clickedRole);

        // Double toggle is an identity operation — same elements, same order for untouched ones
        expect(afterSecond.sort()).toEqual([...selectedRoles].sort());
      }),
      { numRuns: 100 }
    );
  });

  it('supports multiple simultaneous selections up to all three roles', () => {
    fc.assert(
      fc.property(roleSubsetArb, (selectedRoles) => {
        // Start from the given selection and add all missing roles
        let current = [...selectedRoles];
        for (const role of VALID_ROLES) {
          if (!current.includes(role)) {
            current = toggleRole(current, role);
          }
        }

        // All three roles must be selected
        expect(current.length).toBe(3);
        for (const role of VALID_ROLES) {
          expect(current).toContain(role);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('toggle never produces duplicates in the result', () => {
    fc.assert(
      fc.property(roleSubsetArb, validRoleArb, (selectedRoles, clickedRole) => {
        const result = toggleRole(selectedRoles, clickedRole);

        // No duplicates in the result
        const uniqueResult = new Set(result);
        expect(uniqueResult.size).toBe(result.length);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: post-signup-onboarding, Property 3: Confirmation button enabled iff at least one role is selected', () => {
  /**
   * Validates: Requirements 2.3, 2.4
   *
   * For any state of the role selection UI, the confirmation button SHALL be
   * enabled if and only if the set of selected roles is non-empty.
   */
  it('button is disabled when no roles are selected', () => {
    const emptySelection: string[] = [];
    expect(isButtonEnabled(emptySelection)).toBe(false);
  });

  it('button is enabled when at least one role is selected', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArb, (selectedRoles) => {
        expect(isButtonEnabled(selectedRoles)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('button enabled state is equivalent to selectedRoles.length > 0', () => {
    fc.assert(
      fc.property(roleSubsetArb, (selectedRoles) => {
        const enabled = isButtonEnabled(selectedRoles);
        const hasRoles = selectedRoles.length > 0;

        // Biconditional: enabled iff at least one role
        expect(enabled).toBe(hasRoles);
      }),
      { numRuns: 100 }
    );
  });

  it('button becomes disabled after removing the last selected role', () => {
    fc.assert(
      fc.property(validRoleArb, (singleRole) => {
        // Start with exactly one role selected
        const selectedRoles = [singleRole];
        expect(isButtonEnabled(selectedRoles)).toBe(true);

        // Remove the only selected role
        const afterToggle = toggleRole(selectedRoles, singleRole);
        expect(isButtonEnabled(afterToggle)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('button becomes enabled after adding a role to empty selection', () => {
    fc.assert(
      fc.property(validRoleArb, (role) => {
        // Start with no roles selected
        const emptySelection: string[] = [];
        expect(isButtonEnabled(emptySelection)).toBe(false);

        // Add a role
        const afterToggle = toggleRole(emptySelection, role);
        expect(isButtonEnabled(afterToggle)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
