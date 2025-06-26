-- Database initialization script for Kolabolab
-- This script creates the necessary tables and seed data

-- Create funding stage enum
CREATE TYPE funding_stage_enum AS ENUM ('idea', 'pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'ipo');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bio TEXT,
    skills TEXT[],
    location VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    accessibility_features JSONB DEFAULT '{}',
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create startups table
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    funding_stage funding_stage_enum DEFAULT 'idea',
    target_market VARCHAR(255),
    equity_offered DECIMAL(5,2),
    estimated_timeline VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    accessibility_compliant BOOLEAN DEFAULT false,
    pitch_deck_url VARCHAR(255),
    business_plan_url VARCHAR(255),
    funding_goal VARCHAR(255),
    business_model TEXT,
    competitive_advantage TEXT,
    required_skills TEXT,
    team_size INTEGER DEFAULT 1,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    founder_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create collaborations table
CREATE TABLE IF NOT EXISTS collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id),
    collaborator_id UUID REFERENCES users(id),
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id),
    investor_id UUID REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL,
    equity_percentage DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID REFERENCES collaborations(id),
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users
INSERT INTO users (id, email, password, first_name, last_name, bio, skills, location) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '$2b$10$example', 'John', 'Doe', 'Passionate entrepreneur focused on sustainable technology', '{"JavaScript", "React", "Node.js"}', 'San Francisco, CA'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '$2b$10$example', 'Jane', 'Smith', 'Healthcare technology innovator', '{"Python", "AI/ML", "Healthcare"}', 'Boston, MA'),
('550e8400-e29b-41d4-a716-446655440003', 'alex.chen@example.com', '$2b$10$example', 'Alex', 'Chen', 'EdTech entrepreneur and former teacher', '{"React", "Education", "UX Design"}', 'Austin, TX');

-- Insert sample startups
INSERT INTO startups (id, title, description, tags, funding_stage, funding_goal, team_size, founder_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'EcoTech Solutions', 'Sustainable technology for environmental monitoring and carbon footprint reduction.', '{"CleanTech", "Sustainability", "IoT"}', 'seed', '$500,000', 8, '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', 'HealthAI', 'AI-powered healthcare diagnostics platform for early disease detection.', '{"HealthTech", "AI", "Diagnostics"}', 'series-a', '$2,000,000', 15, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440003', 'EduConnect', 'Connecting students worldwide through collaborative learning platforms.', '{"EdTech", "Education", "Social"}', 'pre-seed', '$250,000', 5, '550e8400-e29b-41d4-a716-446655440003');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_startups_funding_stage ON startups(funding_stage);
CREATE INDEX IF NOT EXISTS idx_startups_is_public ON startups(is_public);
CREATE INDEX IF NOT EXISTS idx_startups_tags ON startups USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_users_skills ON users USING GIN(skills);