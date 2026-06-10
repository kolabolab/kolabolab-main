-- Migration: Create admin user for platform administration
-- Requirements: 1.2, 1.3
-- Description: One-time admin setup - creates the admin@kolabolab.com user with admin role
-- Login credentials: admin@kolabolab.com / Admin@123

-- Insert admin user (password is not used for verification - login is hardcoded in the worker)
INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, avatar, isVerified, roles, onboarding_completed, createdAt, updatedAt)
VALUES (
  'admin-kolabolab-001',
  'admin@kolabolab.com',
  'not-used-hardcoded-login',
  'Admin',
  'KolaboLab',
  '',
  1,
  '["admin"]',
  1,
  datetime('now'),
  datetime('now')
);
