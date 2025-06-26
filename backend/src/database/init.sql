-- KolaboLab Database Initialization Script
-- PostgreSQL 15+ with pgvector extension for AI matching

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable Row Level Security
ALTER DATABASE kolabolab SET row_security = on;

-- Create custom types
CREATE TYPE user_role AS ENUM ('entrepreneur', 'collaborator', 'investor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE startup_stage AS ENUM ('idea', 'validation', 'prototype', 'mvp', 'early_traction', 'growth', 'expansion', 'mature');
CREATE TYPE startup_status AS ENUM ('active', 'inactive', 'paused', 'completed', 'discontinued');
CREATE TYPE funding_status AS ENUM ('not_seeking', 'seeking_seed', 'seeking_series_a', 'seeking_series_b', 'seeking_later_stage', 'fully_funded');
CREATE TYPE collaboration_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn', 'completed');
CREATE TYPE investment_type AS ENUM ('seed', 'series_a', 'series_b', 'series_c', 'bridge', 'convertible', 'grant');
CREATE TYPE investment_status AS ENUM ('pending', 'due_diligence', 'term_sheet', 'completed', 'declined');

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users USING btree (email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users USING btree (username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_roles ON users USING gin (roles);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON users USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users USING btree (created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_name ON startups USING btree (name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_industry ON startups USING btree (industry);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_stage ON startups USING btree (stage);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_status ON startups USING btree (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_funding_status ON startups USING btree (funding_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_location ON startups USING btree (location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_categories ON startups USING gin (categories);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_tags ON startups USING gin (tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_skills_needed ON startups USING gin (skills_needed);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_tech_stack ON startups USING gin (tech_stack);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_created_at ON startups USING btree (created_at);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_startups_search ON startups USING gin (
  to_tsvector('english', name || ' ' || COALESCE(tagline, '') || ' ' || description || ' ' || industry)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search ON users USING gin (
  to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(bio, '') || ' ' || array_to_string(skills, ' '))
);

-- Vector similarity indexes for AI matching (requires pgvector extension)
-- These will be added by TypeORM migrations when needed

-- Functions for search and matching
CREATE OR REPLACE FUNCTION search_startups(query_text TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name TEXT,
  tagline TEXT,
  description TEXT,
  industry TEXT,
  stage startup_stage,
  funding_status funding_status,
  location TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.tagline,
    s.description,
    s.industry,
    s.stage,
    s.funding_status,
    s.location,
    ts_rank(
      to_tsvector('english', s.name || ' ' || COALESCE(s.tagline, '') || ' ' || s.description || ' ' || s.industry),
      plainto_tsquery('english', query_text)
    ) AS rank
  FROM startups s
  WHERE 
    s.is_public = true 
    AND s.status = 'active'
    AND to_tsvector('english', s.name || ' ' || COALESCE(s.tagline, '') || ' ' || s.description || ' ' || s.industry) @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC, s.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_users(query_text TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  bio TEXT,
  location TEXT,
  skills TEXT[],
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.username,
    u.bio,
    u.location,
    u.skills,
    ts_rank(
      to_tsvector('english', u.first_name || ' ' || u.last_name || ' ' || COALESCE(u.bio, '') || ' ' || array_to_string(u.skills, ' ')),
      plainto_tsquery('english', query_text)
    ) AS rank
  FROM users u
  WHERE 
    u.is_active = true 
    AND u.status = 'active'
    AND to_tsvector('english', u.first_name || ' ' || u.last_name || ' ' || COALESCE(u.bio, '') || ' ' || array_to_string(u.skills, ' ')) @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC, u.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Performance and analytics views
CREATE OR REPLACE VIEW startup_analytics AS
SELECT 
  s.id,
  s.name,
  s.industry,
  s.stage,
  s.funding_status,
  s.view_count,
  s.like_count,
  COUNT(DISTINCT c.id) as collaboration_requests,
  COUNT(DISTINCT i.id) as investment_offers,
  COUNT(DISTINCT sc.user_id) as collaborator_count,
  COALESCE(SUM(i.amount), 0) as total_funding_received,
  s.created_at,
  s.updated_at
FROM startups s
LEFT JOIN collaborations c ON s.id = c.startup_id
LEFT JOIN investments i ON s.id = i.startup_id AND i.status = 'completed'
LEFT JOIN user_startup_collaborations sc ON s.id = sc.startup_id
WHERE s.is_public = true
GROUP BY s.id, s.name, s.industry, s.stage, s.funding_status, s.view_count, s.like_count, s.created_at, s.updated_at;

CREATE OR REPLACE VIEW user_analytics AS
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.username,
  u.roles,
  u.location,
  array_length(u.skills, 1) as skill_count,
  COUNT(DISTINCT fs.id) as founded_startups,
  COUNT(DISTINCT cs.startup_id) as collaborating_startups,
  COUNT(DISTINCT c.id) as collaboration_requests,
  COUNT(DISTINCT i.id) as investment_offers,
  u.login_count,
  u.last_login_at,
  u.created_at
FROM users u
LEFT JOIN startups fs ON u.id = fs.founder_id
LEFT JOIN user_startup_collaborations cs ON u.id = cs.user_id
LEFT JOIN collaborations c ON u.id = c.collaborator_id
LEFT JOIN investments i ON u.id = i.investor_id
WHERE u.is_active = true
GROUP BY u.id, u.first_name, u.last_name, u.username, u.roles, u.location, u.skills, u.login_count, u.last_login_at, u.created_at;

-- Seed data for development
INSERT INTO users (
  id, email, username, password, first_name, last_name, roles, status, 
  is_email_verified, is_active, bio, location, skills, created_at, updated_at
) VALUES 
(
  gen_random_uuid(),
  'admin@kolabolab.com',
  'admin',
  crypt('admin123', gen_salt('bf')),
  'Admin',
  'User',
  ARRAY['admin', 'entrepreneur']::user_role[],
  'active',
  true,
  true,
  'Platform administrator and tech enthusiast',
  'Global',
  ARRAY['Platform Management', 'System Administration', 'Community Building'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'sarah@kolabolab.com',
  'sarah_founder',
  crypt('password123', gen_salt('bf')),
  'Sarah',
  'Johnson',
  ARRAY['entrepreneur']::user_role[],
  'active',
  true,
  true,
  'Serial entrepreneur passionate about climate tech and sustainability',
  'San Francisco, CA',
  ARRAY['Product Management', 'Climate Tech', 'Fundraising', 'Team Building'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'alex@kolabolab.com',
  'alex_dev',
  crypt('password123', gen_salt('bf')),
  'Alex',
  'Chen',
  ARRAY['collaborator']::user_role[],
  'active',
  true,
  true,
  'Full-stack developer with expertise in React, Node.js, and blockchain',
  'Toronto, Canada',
  ARRAY['React', 'Node.js', 'TypeScript', 'Blockchain', 'Smart Contracts'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'investor@kolabolab.com',
  'maria_investor',
  crypt('password123', gen_salt('bf')),
  'Maria',
  'Rodriguez',
  ARRAY['investor']::user_role[],
  'active',
  true,
  true,
  'Angel investor focused on early-stage tech startups with social impact',
  'Madrid, Spain',
  ARRAY['Angel Investing', 'Due Diligence', 'Mentoring', 'Social Impact'],
  NOW(),
  NOW()
);

-- Insert sample startups
INSERT INTO startups (
  id, name, tagline, description, industry, categories, stage, status, funding_status,
  founder_id, website, location, is_remote, tech_stack, skills_needed, roles_needed,
  problem_statement, solution, target_market, business_model, is_public, 
  is_accepting_collaborators, is_accepting_investors, created_at, updated_at
) VALUES 
(
  gen_random_uuid(),
  'EcoTrack',
  'AI-powered carbon footprint tracking for small businesses',
  'EcoTrack helps small and medium businesses automatically track, analyze, and reduce their carbon footprint using AI and IoT sensors.',
  'Climate Tech',
  ARRAY['Sustainability', 'AI', 'IoT', 'B2B SaaS'],
  'mvp',
  'active',
  'seeking_series_a',
  (SELECT id FROM users WHERE email = 'sarah@kolabolab.com'),
  'https://ecotrack-demo.com',
  'San Francisco, CA',
  true,
  ARRAY['React', 'Node.js', 'Python', 'TensorFlow', 'PostgreSQL', 'IoT Sensors'],
  ARRAY['Machine Learning', 'IoT Development', 'Sales', 'Marketing'],
  ARRAY['ML Engineer', 'IoT Developer', 'Sales Manager', 'Marketing Specialist'],
  'Small businesses struggle to measure and reduce their environmental impact due to lack of affordable, easy-to-use tools.',
  'An AI-powered platform that automatically tracks carbon emissions through IoT sensors and provides actionable insights for reduction.',
  'Small to medium businesses (10-500 employees) looking to improve their sustainability practices',
  'SaaS subscription model with tiered pricing based on company size and features',
  true,
  true,
  true,
  NOW(),
  NOW()
);

-- Create admin user with all permissions if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@kolabolab.com') THEN
    INSERT INTO users (
      id, email, username, password, first_name, last_name, roles, status,
      is_email_verified, is_active, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      'admin@kolabolab.com',
      'admin',
      crypt('KolaboLabAdmin2024!', gen_salt('bf')),
      'Platform',
      'Administrator',
      ARRAY['admin', 'entrepreneur', 'investor']::user_role[],
      'active',
      true,
      true,
      NOW(),
      NOW()
    );
  END IF;
END $$;