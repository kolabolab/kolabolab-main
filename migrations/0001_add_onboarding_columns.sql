-- Migration: Add onboarding columns to users table
-- Requirements: 4.1, 4.2
-- Description: Adds roles and onboarding_completed columns to support post-signup onboarding flow

-- Add roles column: stores a JSON array of role strings
-- Valid values: "entrepreneur", "collaborator", "investor"
ALTER TABLE users ADD COLUMN roles TEXT DEFAULT '[]';

-- Add onboarding_completed column: boolean flag (0=false, 1=true)
ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;

-- Backfill existing users: assign entrepreneur role and mark onboarding as completed
-- This ensures existing users are not forced through the onboarding flow
UPDATE users SET roles = '["entrepreneur"]', onboarding_completed = 1 WHERE roles = '[]' OR roles IS NULL;
