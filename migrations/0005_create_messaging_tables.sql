-- Migration: Create messaging tables for in-app chat feature
-- Creates conversations and messages tables with indexes

-- Conversations table: one thread per user pair
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  participant1Id TEXT NOT NULL,
  participant2Id TEXT NOT NULL,
  lastMessage TEXT DEFAULT '',
  lastActivityAt TEXT NOT NULL DEFAULT (datetime('now')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (participant1Id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant2Id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table: individual messages within conversations
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  content TEXT NOT NULL,
  isRead INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
);

-- Unique constraint: one conversation per user pair (ordered)
CREATE UNIQUE INDEX idx_conversations_participants ON conversations(participant1Id, participant2Id);

-- Index for querying conversations by participant1
CREATE INDEX idx_conversations_participant1 ON conversations(participant1Id, lastActivityAt DESC);

-- Index for querying conversations by participant2
CREATE INDEX idx_conversations_participant2 ON conversations(participant2Id, lastActivityAt DESC);

-- Index for querying messages by conversation (chronological order)
CREATE INDEX idx_messages_conversation ON messages(conversationId, createdAt ASC);

-- Index for counting unread messages
CREATE INDEX idx_messages_unread ON messages(conversationId, senderId, isRead);
