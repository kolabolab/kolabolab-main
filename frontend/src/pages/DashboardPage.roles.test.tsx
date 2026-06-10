/**
 * Unit Tests and Property-Based Tests for Dashboard Role-Based Rendering
 *
 * Feature: post-signup-onboarding, Property 8: Dashboard quick actions adapt to role combination
 *
 * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
 *
 * Property: For any non-empty subset of roles assigned to a user, the DashboardPage SHALL render
 * quick action buttons that correspond to each role present:
 * - entrepreneur → "Create Startup" (/create-startup), "Manage Startups" (/startups)
 * - collaborator → "Discover Teams" (/search), "My Collaborations" (/collaborations)
 * - investor → "Browse Opportunities" (/investments), "My Portfolio" (/portfolio)
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getQuickActionsForRoles } from './DashboardPage'

const VALID_ROLES = ['entrepreneur', 'collaborator', 'investor'] as const

const ROLE_EXPECTED_ACTIONS: Record<string, { label: string; path: string }[]> = {
  entrepreneur: [
    { label: 'Create Startup', path: '/create-startup' },
    { label: 'Manage Startups', path: '/startups' },
  ],
  collaborator: [
    { label: 'Discover Teams', path: '/search' },
    { label: 'My Collaborations', path: '/collaborations' },
  ],
  investor: [
    { label: 'Browse Opportunities', path: '/investments' },
    { label: 'My Portfolio', path: '/portfolio' },
  ],
}

/**
 * Arbitrary for generating a non-empty subset of valid roles
 */
const nonEmptyRoleSubsetArbitrary = fc.subarray([...VALID_ROLES], { minLength: 1, maxLength: 3 })

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Feature: post-signup-onboarding, Property 8: Dashboard quick actions adapt to role combination', () => {
  it('returns actions corresponding to each role in any non-empty subset of roles', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArbitrary, (roles) => {
        const actions = getQuickActionsForRoles(roles)

        // Build expected actions based on roles present
        const expectedActions = roles.flatMap((role) => ROLE_EXPECTED_ACTIONS[role])

        // The returned actions should have the same labels as expected
        const actionLabels = actions.map((a) => a.label)
        const expectedLabels = expectedActions.map((a) => a.label)

        expect(actionLabels).toEqual(expectedLabels)

        // The returned actions should have the correct paths
        const actionPaths = actions.map((a) => a.path)
        const expectedPaths = expectedActions.map((a) => a.path)

        expect(actionPaths).toEqual(expectedPaths)
      }),
      { numRuns: 100 }
    )
  })

  it('returns exactly 2 actions per role present in the combination', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArbitrary, (roles) => {
        const actions = getQuickActionsForRoles(roles)

        // Each role contributes exactly 2 actions
        expect(actions.length).toBe(roles.length * 2)
      }),
      { numRuns: 100 }
    )
  })

  it('includes entrepreneur actions if and only if entrepreneur role is present', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArbitrary, (roles) => {
        const actions = getQuickActionsForRoles(roles)
        const labels = actions.map((a) => a.label)

        if (roles.includes('entrepreneur')) {
          expect(labels).toContain('Create Startup')
          expect(labels).toContain('Manage Startups')
        } else {
          expect(labels).not.toContain('Create Startup')
          expect(labels).not.toContain('Manage Startups')
        }
      }),
      { numRuns: 100 }
    )
  })

  it('includes collaborator actions if and only if collaborator role is present', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArbitrary, (roles) => {
        const actions = getQuickActionsForRoles(roles)
        const labels = actions.map((a) => a.label)

        if (roles.includes('collaborator')) {
          expect(labels).toContain('Discover Teams')
          expect(labels).toContain('My Collaborations')
        } else {
          expect(labels).not.toContain('Discover Teams')
          expect(labels).not.toContain('My Collaborations')
        }
      }),
      { numRuns: 100 }
    )
  })

  it('includes investor actions if and only if investor role is present', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArbitrary, (roles) => {
        const actions = getQuickActionsForRoles(roles)
        const labels = actions.map((a) => a.label)

        if (roles.includes('investor')) {
          expect(labels).toContain('Browse Opportunities')
          expect(labels).toContain('My Portfolio')
        } else {
          expect(labels).not.toContain('Browse Opportunities')
          expect(labels).not.toContain('My Portfolio')
        }
      }),
      { numRuns: 100 }
    )
  })

  it('each action has a non-empty label, icon, colorScheme, and path', () => {
    fc.assert(
      fc.property(nonEmptyRoleSubsetArbitrary, (roles) => {
        const actions = getQuickActionsForRoles(roles)

        for (const action of actions) {
          expect(action.label).toBeTruthy()
          expect(action.icon).toBeTruthy()
          expect(action.colorScheme).toBeTruthy()
          expect(action.path).toBeTruthy()
          expect(action.path.startsWith('/')).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Unit Tests - Specific Role Combinations
// ============================================================================

describe('DashboardPage role-based quick actions - unit tests', () => {
  describe('single role combinations', () => {
    it('entrepreneur role returns Create Startup and Manage Startups actions', () => {
      const actions = getQuickActionsForRoles(['entrepreneur'])

      expect(actions).toHaveLength(2)
      expect(actions[0].label).toBe('Create Startup')
      expect(actions[0].path).toBe('/create-startup')
      expect(actions[1].label).toBe('Manage Startups')
      expect(actions[1].path).toBe('/startups')
    })

    it('collaborator role returns Discover Teams and My Collaborations actions', () => {
      const actions = getQuickActionsForRoles(['collaborator'])

      expect(actions).toHaveLength(2)
      expect(actions[0].label).toBe('Discover Teams')
      expect(actions[0].path).toBe('/search')
      expect(actions[1].label).toBe('My Collaborations')
      expect(actions[1].path).toBe('/collaborations')
    })

    it('investor role returns Browse Opportunities and My Portfolio actions', () => {
      const actions = getQuickActionsForRoles(['investor'])

      expect(actions).toHaveLength(2)
      expect(actions[0].label).toBe('Browse Opportunities')
      expect(actions[0].path).toBe('/investments')
      expect(actions[1].label).toBe('My Portfolio')
      expect(actions[1].path).toBe('/portfolio')
    })
  })

  describe('dual role combinations', () => {
    it('entrepreneur + collaborator returns 4 actions in correct order', () => {
      const actions = getQuickActionsForRoles(['entrepreneur', 'collaborator'])

      expect(actions).toHaveLength(4)
      expect(actions.map((a) => a.label)).toEqual([
        'Create Startup',
        'Manage Startups',
        'Discover Teams',
        'My Collaborations',
      ])
    })

    it('entrepreneur + investor returns 4 actions in correct order', () => {
      const actions = getQuickActionsForRoles(['entrepreneur', 'investor'])

      expect(actions).toHaveLength(4)
      expect(actions.map((a) => a.label)).toEqual([
        'Create Startup',
        'Manage Startups',
        'Browse Opportunities',
        'My Portfolio',
      ])
    })

    it('collaborator + investor returns 4 actions in correct order', () => {
      const actions = getQuickActionsForRoles(['collaborator', 'investor'])

      expect(actions).toHaveLength(4)
      expect(actions.map((a) => a.label)).toEqual([
        'Discover Teams',
        'My Collaborations',
        'Browse Opportunities',
        'My Portfolio',
      ])
    })
  })

  describe('all three roles', () => {
    it('entrepreneur + collaborator + investor returns all 6 actions', () => {
      const actions = getQuickActionsForRoles(['entrepreneur', 'collaborator', 'investor'])

      expect(actions).toHaveLength(6)
      expect(actions.map((a) => a.label)).toEqual([
        'Create Startup',
        'Manage Startups',
        'Discover Teams',
        'My Collaborations',
        'Browse Opportunities',
        'My Portfolio',
      ])
    })
  })

  describe('edge cases', () => {
    it('empty roles array returns no actions', () => {
      const actions = getQuickActionsForRoles([])
      expect(actions).toHaveLength(0)
    })

    it('admin role returns admin-specific actions (overrides other roles)', () => {
      const actions = getQuickActionsForRoles(['admin', 'entrepreneur'])

      expect(actions).toHaveLength(2)
      expect(actions[0].label).toBe('Review Startups')
      expect(actions[1].label).toBe('Manage Users')
    })

    it('unknown role is ignored and returns no actions for that role', () => {
      const actions = getQuickActionsForRoles(['unknown_role' as any])
      expect(actions).toHaveLength(0)
    })

    it('duplicate roles do not produce duplicate actions', () => {
      const actions = getQuickActionsForRoles(['entrepreneur', 'entrepreneur'])

      // The function uses includes() so duplicates still produce 2 actions (not 4)
      expect(actions).toHaveLength(2)
      expect(actions[0].label).toBe('Create Startup')
      expect(actions[1].label).toBe('Manage Startups')
    })
  })

  describe('colorScheme assignments', () => {
    it('entrepreneur actions use brand colorScheme', () => {
      const actions = getQuickActionsForRoles(['entrepreneur'])
      actions.forEach((a) => expect(a.colorScheme).toBe('brand'))
    })

    it('collaborator actions use accent colorScheme', () => {
      const actions = getQuickActionsForRoles(['collaborator'])
      actions.forEach((a) => expect(a.colorScheme).toBe('accent'))
    })

    it('investor actions use purple colorScheme', () => {
      const actions = getQuickActionsForRoles(['investor'])
      actions.forEach((a) => expect(a.colorScheme).toBe('purple'))
    })
  })
})
