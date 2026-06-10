-- Migration: Create notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  recipientId TEXT NOT NULL,
  type TEXT NOT NULL,
  referenceId TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  isRead INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for listing notifications by user (most recent first)
CREATE INDEX idx_notifications_recipient_created
  ON notifications(recipientId, createdAt DESC);

-- Index for counting unread notifications
CREATE INDEX idx_notifications_recipient_unread
  ON notifications(recipientId, isRead);
