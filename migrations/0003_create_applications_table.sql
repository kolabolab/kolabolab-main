-- Migration: Create applications table
-- Requirements: 6.1, 6.2
-- Description: Creates the applications table for the Role Application System,
-- storing role applications from users to startup roles with status tracking.

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  applicantId TEXT NOT NULL,
  startupId TEXT NOT NULL,
  roleTitle TEXT NOT NULL,
  message TEXT NOT NULL,
  highlightedSkills TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (applicantId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (startupId) REFERENCES startups(id) ON DELETE CASCADE
);

-- Unique constraint: one application per user per role per startup
CREATE UNIQUE INDEX idx_applications_unique
  ON applications(applicantId, startupId, roleTitle);

-- Index for querying by startup (creator's view)
CREATE INDEX idx_applications_startup
  ON applications(startupId, createdAt DESC);

-- Index for querying by applicant (applicant's view)
CREATE INDEX idx_applications_applicant
  ON applications(applicantId, createdAt DESC);

-- Index for status filtering
CREATE INDEX idx_applications_status
  ON applications(status);
