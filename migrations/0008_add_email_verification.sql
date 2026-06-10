ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN verificationToken TEXT;
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verificationToken);

-- Set existing users as verified so they aren't locked out
UPDATE users SET emailVerified = 1 WHERE emailVerified IS NULL OR emailVerified = 0;
