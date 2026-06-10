export interface RichRole {
  title: string;
  description?: string;
  skills?: string[];
  commitment?: string;
}

export type RoleEntry = string | RichRole;

/** Commitment options available in the UI */
export const COMMITMENT_OPTIONS = [
  'Full-time',
  'Part-time',
  'Flexible',
  'Contract',
] as const;

export type CommitmentLevel = (typeof COMMITMENT_OPTIONS)[number];
