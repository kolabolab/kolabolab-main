-- Migration: Create startupUpdates table for the Startup Updates feature
-- Requirements: 5.1, 5.2, 5.3, 5.6

CREATE TABLE startupUpdates (
  id TEXT PRIMARY KEY,
  startupId TEXT NOT NULL,
  authorId TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (startupId) REFERENCES startups(id) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for querying updates by startup (feed view)
CREATE INDEX idx_startup_updates_startup ON startupUpdates(startupId, createdAt DESC);

-- Index for querying updates by author (dashboard feed)
CREATE INDEX idx_startup_updates_author ON startupUpdates(authorId, createdAt DESC);
