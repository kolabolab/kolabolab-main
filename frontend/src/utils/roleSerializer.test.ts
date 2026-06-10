import { describe, it, expect } from 'vitest';
import {
  isRichRole,
  normalizeRole,
  serializeRoles,
  deserializeRoles,
  parseSkills,
  validateDescription,
  validateSkill,
} from './roleSerializer';

describe('roleSerializer', () => {
  describe('isRichRole', () => {
    it('returns true for an object with a title field', () => {
      expect(isRichRole({ title: 'CTO' })).toBe(true);
    });

    it('returns true for a rich role with detail fields', () => {
      expect(
        isRichRole({ title: 'CTO', description: 'Lead tech', skills: ['React'], commitment: 'Full-time' })
      ).toBe(true);
    });

    it('returns false for a plain string', () => {
      expect(isRichRole('Designer')).toBe(false);
    });
  });

  describe('normalizeRole', () => {
    it('wraps a plain string into a RichRole with only title', () => {
      expect(normalizeRole('Designer')).toEqual({ title: 'Designer' });
    });

    it('returns a RichRole object as-is', () => {
      const role = { title: 'CTO', description: 'Lead tech' };
      expect(normalizeRole(role)).toEqual(role);
    });
  });

  describe('serializeRoles', () => {
    it('serializes roles with no details as plain strings', () => {
      const roles = [{ title: 'CTO' }, { title: 'Designer' }];
      expect(serializeRoles(roles)).toEqual(['CTO', 'Designer']);
    });

    it('serializes roles with details as RichRole objects', () => {
      const roles = [{ title: 'CTO', description: 'Lead tech', skills: ['React'], commitment: 'Full-time' }];
      const result = serializeRoles(roles);
      expect(result).toEqual([
        { title: 'CTO', description: 'Lead tech', skills: ['React'], commitment: 'Full-time' },
      ]);
    });

    it('produces a mixed array for mixed input', () => {
      const roles = [
        { title: 'Designer' },
        { title: 'CTO', description: 'Lead tech' },
      ];
      const result = serializeRoles(roles);
      expect(result).toEqual(['Designer', { title: 'CTO', description: 'Lead tech' }]);
    });

    it('trims description whitespace', () => {
      const roles = [{ title: 'CTO', description: '  Lead tech  ' }];
      const result = serializeRoles(roles);
      expect(result).toEqual([{ title: 'CTO', description: 'Lead tech' }]);
    });

    it('excludes empty detail fields from the serialized object', () => {
      const roles = [{ title: 'CTO', description: 'Lead', skills: [], commitment: '' }];
      const result = serializeRoles(roles);
      expect(result).toEqual([{ title: 'CTO', description: 'Lead' }]);
    });
  });

  describe('deserializeRoles', () => {
    it('returns empty array for null', () => {
      expect(deserializeRoles(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
      expect(deserializeRoles(undefined)).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      expect(deserializeRoles('')).toEqual([]);
    });

    it('returns empty array for invalid JSON', () => {
      expect(deserializeRoles('not json')).toEqual([]);
    });

    it('returns empty array for non-array JSON', () => {
      expect(deserializeRoles('{"title":"CTO"}')).toEqual([]);
    });

    it('deserializes plain string arrays', () => {
      const json = JSON.stringify(['CTO', 'Designer']);
      expect(deserializeRoles(json)).toEqual([{ title: 'CTO' }, { title: 'Designer' }]);
    });

    it('deserializes rich role arrays', () => {
      const json = JSON.stringify([{ title: 'CTO', description: 'Lead tech' }]);
      expect(deserializeRoles(json)).toEqual([{ title: 'CTO', description: 'Lead tech' }]);
    });

    it('deserializes mixed arrays', () => {
      const json = JSON.stringify(['Designer', { title: 'CTO', skills: ['React'] }]);
      expect(deserializeRoles(json)).toEqual([
        { title: 'Designer' },
        { title: 'CTO', skills: ['React'] },
      ]);
    });
  });

  describe('parseSkills', () => {
    it('splits comma-separated values into trimmed array', () => {
      expect(parseSkills('React, TypeScript, Node.js')).toEqual(['React', 'TypeScript', 'Node.js']);
    });

    it('filters out empty entries', () => {
      expect(parseSkills('React,,TypeScript, , Node.js')).toEqual(['React', 'TypeScript', 'Node.js']);
    });

    it('returns empty array for empty string', () => {
      expect(parseSkills('')).toEqual([]);
    });

    it('handles single skill', () => {
      expect(parseSkills('React')).toEqual(['React']);
    });
  });

  describe('validateDescription', () => {
    it('returns null for valid description', () => {
      expect(validateDescription('A short description')).toBeNull();
    });

    it('returns null for exactly 500 characters', () => {
      expect(validateDescription('a'.repeat(500))).toBeNull();
    });

    it('returns error for description exceeding 500 characters', () => {
      expect(validateDescription('a'.repeat(501))).toBe('Description must not exceed 500 characters');
    });
  });

  describe('validateSkill', () => {
    it('returns null for valid skill', () => {
      expect(validateSkill('React')).toBeNull();
    });

    it('returns null for exactly 50 characters', () => {
      expect(validateSkill('a'.repeat(50))).toBeNull();
    });

    it('returns error for skill exceeding 50 characters', () => {
      expect(validateSkill('a'.repeat(51))).toBe('Each skill must not exceed 50 characters');
    });
  });
});
