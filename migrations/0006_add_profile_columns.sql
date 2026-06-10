-- Add profile columns to existing users table for Public User Profiles feature
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN skills TEXT DEFAULT '[]';
ALTER TABLE users ADD COLUMN experience TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN avatarUrl TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN linkedinUrl TEXT DEFAULT NULL;
