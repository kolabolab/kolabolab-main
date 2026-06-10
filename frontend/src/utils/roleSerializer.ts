import { RichRole, RoleEntry } from '@/types/roles';

/**
 * Determines if a RoleEntry is a RichRole object (has at least one detail field populated).
 */
export function isRichRole(entry: RoleEntry): entry is RichRole {
  return typeof entry === 'object' && entry !== null && 'title' in entry;
}

/**
 * Normalizes a RoleEntry into a consistent RichRole shape for display purposes.
 * Plain strings become { title: string } with no other fields.
 */
export function normalizeRole(entry: RoleEntry): RichRole {
  if (isRichRole(entry)) {
    return entry;
  }
  return { title: entry };
}

/**
 * Serializes form state into the storage format.
 * Roles with no detail fields are stored as plain strings.
 * Roles with at least one detail field are stored as RichRole objects.
 */
export function serializeRoles(roles: RichRole[]): RoleEntry[] {
  return roles.map((role) => {
    const hasDetails =
      (role.description && role.description.trim().length > 0) ||
      (role.skills && role.skills.length > 0) ||
      (role.commitment && role.commitment.trim().length > 0);

    if (!hasDetails) {
      return role.title;
    }

    const result: RichRole = { title: role.title };
    if (role.description && role.description.trim().length > 0) {
      result.description = role.description.trim();
    }
    if (role.skills && role.skills.length > 0) {
      result.skills = role.skills;
    }
    if (role.commitment && role.commitment.trim().length > 0) {
      result.commitment = role.commitment;
    }
    return result;
  });
}

/**
 * Deserializes stored JSON into normalized RichRole array.
 * Handles: null, invalid JSON, plain string arrays, rich arrays, mixed arrays.
 */
export function deserializeRoles(json: string | null | undefined): RichRole[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRole);
  } catch {
    return [];
  }
}

/**
 * Parses a comma-separated skills string into a trimmed, non-empty string array.
 */
export function parseSkills(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Validates a description field. Returns error message or null.
 */
export function validateDescription(value: string): string | null {
  if (value.length > 500) {
    return 'Description must not exceed 500 characters';
  }
  return null;
}

/**
 * Validates a single skill entry. Returns error message or null.
 */
export function validateSkill(value: string): string | null {
  if (value.length > 50) {
    return 'Each skill must not exceed 50 characters';
  }
  return null;
}
