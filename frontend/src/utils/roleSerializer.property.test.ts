import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  parseSkills,
  deserializeRoles,
  validateDescription,
  validateSkill,
  serializeRoles,
} from '@/utils/roleSerializer';
import { RichRole } from '@/types/roles';

/**
 * Property-based tests for roleSerializer utilities.
 * Feature: rich-role-details
 */

/**
 * Property 2: Plain String Serialization
 * **Validates: Requirements 1.3, 3.1**
 */
describe('Feature: rich-role-details, Property 2: Plain String Serialization', () => {
  it('roles with no detail fields always serialize as plain strings', () => {
    const plainRoleArb: fc.Arbitrary<RichRole> = fc
      .string({ minLength: 1 })
      .map((title) => ({ title }));
    fc.assert(
      fc.property(plainRoleArb, (role) => {
        const [serialized] = serializeRoles([role]);
        expect(typeof serialized).toBe('string');
        expect(serialized).toBe(role.title);
      }),
      { numRuns: 200 }
    );
  });

  it('roles with empty/whitespace-only detail fields serialize as plain strings', () => {
    const plainRoleWithEmptyFieldsArb: fc.Arbitrary<RichRole> = fc
      .record({
        title: fc.string({ minLength: 1 }),
        description: fc.constantFrom('', '   ', undefined),
        skills: fc.constantFrom([] as string[], undefined),
        commitment: fc.constantFrom('', '   ', undefined),
      })
      .map(({ title, description, skills, commitment }) => {
        const role: RichRole = { title };
        if (description !== undefined) role.description = description;
        if (skills !== undefined) role.skills = skills;
        if (commitment !== undefined) role.commitment = commitment;
        return role;
      });
    fc.assert(
      fc.property(plainRoleWithEmptyFieldsArb, (role) => {
        const [serialized] = serializeRoles([role]);
        expect(typeof serialized).toBe('string');
        expect(serialized).toBe(role.title);
      }),
      { numRuns: 200 }
    );
  });
});

/**
 * Property 3: Rich Object Serialization
 * **Validates: Requirements 1.4, 3.2**
 */
describe('Feature: rich-role-details, Property 3: Rich Object Serialization', () => {
  it('roles with at least one non-empty detail field always serialize as objects with a title field', () => {
    const nonEmptyDescriptionArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const nonEmptySkillsArb = fc.array(fc.string({ minLength: 1 }), { minLength: 1 });
    const nonEmptyCommitmentArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    const richRoleArb: fc.Arbitrary<RichRole> = fc
      .record({
        title: fc.string({ minLength: 1 }),
        hasDescription: fc.boolean(),
        hasSkills: fc.boolean(),
        hasCommitment: fc.boolean(),
        description: nonEmptyDescriptionArb,
        skills: nonEmptySkillsArb,
        commitment: nonEmptyCommitmentArb,
      })
      .filter(({ hasDescription, hasSkills, hasCommitment }) => hasDescription || hasSkills || hasCommitment)
      .map(({ title, hasDescription, hasSkills, hasCommitment, description, skills, commitment }) => {
        const role: RichRole = { title };
        if (hasDescription) role.description = description;
        if (hasSkills) role.skills = skills;
        if (hasCommitment) role.commitment = commitment;
        return role;
      });

    fc.assert(
      fc.property(richRoleArb, (role) => {
        const [serialized] = serializeRoles([role]);
        expect(typeof serialized).toBe('object');
        expect(serialized).not.toBeNull();
        expect((serialized as RichRole).title).toBe(role.title);
      }),
      { numRuns: 200 }
    );
  });
});

/**
 * Property 4: Skills Parsing
 * **Validates: Requirements 2.5**
 */
describe('Feature: rich-role-details, Property 4: Skills Parsing', () => {
  const commaSeparatedStringArb = fc.array(
    fc.tuple(
      fc.string({ minLength: 0, maxLength: 20 }),
      fc.nat({ max: 3 }),
      fc.nat({ max: 3 })
    ),
    { minLength: 0, maxLength: 10 }
  ).map((parts) =>
    parts.map(([word, leadSpaces, trailSpaces]) =>
      `${' '.repeat(leadSpaces)}${word}${' '.repeat(trailSpaces)}`
    ).join(',')
  );

  it('parseSkills always produces trimmed, non-empty strings', () => {
    fc.assert(
      fc.property(commaSeparatedStringArb, (input) => {
        const result = parseSkills(input);
        for (const skill of result) {
          expect(skill.length).toBeGreaterThan(0);
          expect(skill).toBe(skill.trim());
        }
      }),
      { numRuns: 200 }
    );
  });

  it('parseSkills output never contains empty strings', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 100 }), (input) => {
        const result = parseSkills(input);
        expect(result).not.toContain('');
        for (const skill of result) {
          expect(skill.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('parseSkills output never contains strings with leading or trailing whitespace', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 100 }), (input) => {
        const result = parseSkills(input);
        for (const skill of result) {
          expect(skill).not.toMatch(/^\s/);
          expect(skill).not.toMatch(/\s$/);
        }
      }),
      { numRuns: 200 }
    );
  });
});

/**
 * Property 5: Deserialization Graceful Fallback
 * **Validates: Requirements 4.4**
 *
 * For any input that is null, undefined, or not valid JSON, deserializeRoles
 * SHALL return an empty array without throwing an exception.
 * More broadly, deserializeRoles never throws for ANY input string.
 */
describe('Feature: rich-role-details, Property 5: Deserialization Graceful Fallback', () => {
  it('deserializeRoles never throws for any arbitrary string input and always returns an array', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = deserializeRoles(input);
        expect(Array.isArray(result)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('deserializeRoles never throws for null or undefined', () => {
    expect(Array.isArray(deserializeRoles(null))).toBe(true);
    expect(Array.isArray(deserializeRoles(undefined))).toBe(true);
  });

  it('deserializeRoles always returns an array for strings with special characters', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme-ascii' }),
        (input) => {
          const result = deserializeRoles(input);
          expect(Array.isArray(result)).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });
});

/**
 * Property 6: Validation Rejects Oversized Fields
 * **Validates: Requirements 7.2, 7.3**
 *
 * For any string with length > 500, validateDescription SHALL return a non-null error message.
 * For any string with length <= 500, validateDescription SHALL return null.
 * For any string with length > 50, validateSkill SHALL return a non-null error message.
 * For any string with length <= 50, validateSkill SHALL return null.
 */
describe('Feature: rich-role-details, Property 6: Validation Rejects Oversized Fields', () => {
  it('validateDescription returns a non-null error for any string longer than 500 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 501, maxLength: 2000 }),
        (input) => {
          const result = validateDescription(input);
          expect(result).not.toBeNull();
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 200 }
    );
  });

  it('validateDescription returns null for any string of 500 characters or fewer', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        (input) => {
          const result = validateDescription(input);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 200 }
    );
  });

  it('validateSkill returns a non-null error for any string longer than 50 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 51, maxLength: 500 }),
        (input) => {
          const result = validateSkill(input);
          expect(result).not.toBeNull();
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 200 }
    );
  });

  it('validateSkill returns null for any string of 50 characters or fewer', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (input) => {
          const result = validateSkill(input);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 200 }
    );
  });
});
