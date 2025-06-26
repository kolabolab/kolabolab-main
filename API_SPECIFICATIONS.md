# Kolabolab API Specifications

## Overview
Comprehensive API specifications for Kolabolab platform, designed with GraphQL federation, REST fallbacks, and accessibility-first principles.

---

## 1. GraphQL Schema Design

### Core Types
```graphql
# User Management
type User {
  id: ID!
  email: String!
  profile: UserProfile!
  accessibilityPreferences: AccessibilityPreferences
  skills: [Skill!]!
  location: Location
  reputation: ReputationScore!
  collaborations: [Collaboration!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserProfile {
  firstName: String!
  lastName: String!
  bio: String
  avatar: String
  portfolioUrl: String
  linkedInUrl: String
  githubUrl: String
  preferredLanguages: [Language!]!
  timezone: String!
  availability: AvailabilityStatus!
}

type AccessibilityPreferences {
  screenReaderOptimized: Boolean!
  highContrastMode: Boolean!
  reducedMotion: Boolean!
  voiceInputEnabled: Boolean!
  keyboardNavigationOnly: Boolean!
  fontSize: FontSize!
  colorBlindnessType: ColorBlindnessType
  assistiveTechnologies: [AssistiveTechnology!]!
}

# Startup & Collaboration
type Startup {
  id: ID!
  title: String!
  description: String!
  tags: [Tag!]!
  fundingStage: FundingStage!
  targetMarket: String!
  pitchDeck: File
  businessPlan: File
  founder: User!
  team: [TeamMember!]!
  requiredSkills: [Skill!]!
  equityOffered: Float
  estimatedTimeline: String
  isPublic: Boolean!
  accessibilityCompliant: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Collaboration {
  id: ID!
  startup: Startup!
  collaborator: User!
  role: CollaborationRole!
  status: CollaborationStatus!
  equityPercentage: Float
  contributions: [Contribution!]!
  startDate: DateTime!
  endDate: DateTime
  testimonial: Testimonial
}

# Investment & Funding
type Investment {
  id: ID!
  startup: Startup!
  investor: User!
  amount: Float!
  stage: FundingStage!
  terms: InvestmentTerms!
  status: InvestmentStatus!
  documents: [File!]!
  createdAt: DateTime!
  closedAt: DateTime
}

type InvestmentTerms {
  valuation: Float!
  equityPercentage: Float!
  liquidationPreference: String!
  boardSeats: Int!
  antidilutionRights: Boolean!
  dividendRights: Boolean!
}

# Enums
enum FundingStage {
  IDEA
  PROTOTYPE
  MVP
  SEED
  SERIES_A
  SERIES_B
  SERIES_C
  IPO
}

enum CollaborationRole {
  CO_FOUNDER
  TECHNICAL_LEAD
  DESIGNER
  MARKETER
  BUSINESS_DEVELOPER
  ADVISOR
  VOLUNTEER
}

enum CollaborationStatus {
  PENDING
  ACTIVE
  COMPLETED
  TERMINATED
}

enum AvailabilityStatus {
  FULL_TIME
  PART_TIME
  WEEKEND_ONLY
  UNAVAILABLE
}

enum FontSize {
  SMALL
  MEDIUM
  LARGE
  EXTRA_LARGE
}
```

### Query Operations
```graphql
type Query {
  # User Queries
  me: User
  user(id: ID!): User
  users(
    filters: UserFilters
    pagination: PaginationInput!
  ): UserConnection!
  
  # Startup Queries
  startup(id: ID!): Startup
  startups(
    filters: StartupFilters
    pagination: PaginationInput!
  ): StartupConnection!
  
  # Search Queries
  search(
    query: String!
    type: SearchType!
    filters: SearchFilters
    pagination: PaginationInput!
  ): SearchResults!
  
  # Matching Queries
  findCollaborators(
    startupId: ID!
    requiredSkills: [String!]
    filters: CollaboratorFilters
  ): [UserMatch!]!
  
  findInvestors(
    startupId: ID!
    fundingStage: FundingStage!
    amount: Float!
    filters: InvestorFilters
  ): [InvestorMatch!]!
  
  # Analytics Queries
  userAnalytics(
    userId: ID!
    timeRange: TimeRange!
  ): UserAnalytics!
  
  platformMetrics(
    metrics: [MetricType!]!
    timeRange: TimeRange!
  ): PlatformMetrics!
}

# Filter Types
input UserFilters {
  skills: [String!]
  location: LocationInput
  availability: AvailabilityStatus
  accessibilityNeeds: [AccessibilityType!]
  experienceLevel: ExperienceLevel
  languages: [String!]
}

input StartupFilters {
  tags: [String!]
  fundingStage: [FundingStage!]
  location: LocationInput
  targetMarket: [String!]
  accessibilityCompliant: Boolean
  equityRange: FloatRange
}

input SearchFilters {
  dateRange: DateRange
  location: LocationInput
  tags: [String!]
  verified: Boolean
}

# Match Types
type UserMatch {
  user: User!
  compatibilityScore: Float!
  matchReasons: [MatchReason!]!
  sharedConnections: [User!]!
  estimatedCollaborationSuccess: Float!
}

type InvestorMatch {
  investor: User!
  investmentHistory: [Investment!]!
  portfolioAlignment: Float!
  averageInvestmentSize: Float!
  matchScore: Float!
  introductionPath: [User!]
}

type MatchReason {
  type: MatchReasonType!
  description: String!
  weight: Float!
}

enum MatchReasonType {
  SKILL_MATCH
  EXPERIENCE_MATCH
  LOCATION_PROXIMITY
  INTEREST_ALIGNMENT
  NETWORK_CONNECTION
  ACCESSIBILITY_COMPATIBILITY
}
```

### Mutation Operations
```graphql
type Mutation {
  # Authentication
  signUp(input: SignUpInput!): AuthPayload!
  signIn(input: SignInInput!): AuthPayload!
  refreshToken(token: String!): AuthPayload!
  signOut: Boolean!
  
  # User Management
  updateProfile(input: UpdateProfileInput!): User!
  updateAccessibilityPreferences(
    input: AccessibilityPreferencesInput!
  ): User!
  deleteAccount: Boolean!
  
  # Startup Management
  createStartup(input: CreateStartupInput!): Startup!
  updateStartup(
    id: ID!
    input: UpdateStartupInput!
  ): Startup!
  deleteStartup(id: ID!): Boolean!
  
  # Collaboration Management
  requestCollaboration(input: CollaborationRequestInput!): Collaboration!
  respondToCollaboration(
    id: ID!
    response: CollaborationResponse!
  ): Collaboration!
  updateCollaboration(
    id: ID!
    input: UpdateCollaborationInput!
  ): Collaboration!
  
  # Investment Management
  makeInvestmentOffer(input: InvestmentOfferInput!): Investment!
  respondToInvestmentOffer(
    id: ID!
    response: InvestmentResponse!
  ): Investment!
  
  # Communication
  sendMessage(input: MessageInput!): Message!
  createTestimonial(input: TestimonialInput!): Testimonial!
  
  # File Management
  uploadFile(file: Upload!): File!
  deleteFile(id: ID!): Boolean!
}

# Input Types
input SignUpInput {
  email: String!
  password: String!
  profile: UserProfileInput!
  accessibilityPreferences: AccessibilityPreferencesInput
  agreedToTerms: Boolean!
}

input CreateStartupInput {
  title: String!
  description: String!
  tags: [String!]!
  fundingStage: FundingStage!
  targetMarket: String!
  requiredSkills: [String!]!
  equityOffered: Float
  estimatedTimeline: String
  isPublic: Boolean!
  pitchDeckFile: Upload
  businessPlanFile: Upload
}

input CollaborationRequestInput {
  startupId: ID!
  message: String!
  proposedRole: CollaborationRole!
  equityExpectation: Float
  availabilityCommitment: String!
}

input InvestmentOfferInput {
  startupId: ID!
  amount: Float!
  terms: InvestmentTermsInput!
  message: String
  dueDiligenceDocuments: [Upload!]
}
```

### Subscription Operations
```graphql
type Subscription {
  # Real-time Notifications
  notifications(userId: ID!): Notification!
  
  # Real-time Collaboration
  collaborationUpdates(collaborationId: ID!): CollaborationUpdate!
  
  # Live Chat
  messages(conversationId: ID!): Message!
  
  # Live Document Editing
  documentChanges(documentId: ID!): DocumentChange!
  
  # Investment Updates
  investmentUpdates(startupId: ID!): InvestmentUpdate!
  
  # Platform Events
  platformAnnouncements: Announcement!
}

type Notification {
  id: ID!
  type: NotificationType!
  title: String!
  message: String!
  actionUrl: String
  isRead: Boolean!
  createdAt: DateTime!
}

enum NotificationType {
  COLLABORATION_REQUEST
  INVESTMENT_OFFER
  MESSAGE_RECEIVED
  STARTUP_UPDATE
  MATCH_FOUND
  TESTIMONIAL_RECEIVED
  SYSTEM_ANNOUNCEMENT
}
```

---

## 2. REST API Endpoints

### Authentication Endpoints
```typescript
// Authentication & Authorization
POST /api/v1/auth/signup
POST /api/v1/auth/signin
POST /api/v1/auth/refresh
POST /api/v1/auth/signout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email

// OAuth Endpoints
GET  /api/v1/auth/google
GET  /api/v1/auth/linkedin
GET  /api/v1/auth/github
POST /api/v1/auth/oauth/callback
```

### User Management
```typescript
// User CRUD Operations
GET    /api/v1/users/me
PUT    /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/:id
GET    /api/v1/users/:id/startups
GET    /api/v1/users/:id/collaborations
GET    /api/v1/users/:id/investments
POST   /api/v1/users/:id/testimonials

// User Search & Discovery
GET    /api/v1/users/search?q=:query&skills=:skills&location=:location
GET    /api/v1/users/recommendations/:userId
GET    /api/v1/users/matches/:startupId
```

### Startup Management
```typescript
// Startup CRUD
POST   /api/v1/startups
GET    /api/v1/startups/:id
PUT    /api/v1/startups/:id
DELETE /api/v1/startups/:id
GET    /api/v1/startups

// Startup Discovery
GET    /api/v1/startups/search?q=:query&stage=:stage&tags=:tags
GET    /api/v1/startups/trending
GET    /api/v1/startups/recommendations/:userId
GET    /api/v1/startups/:id/similar

// Startup Team Management
POST   /api/v1/startups/:id/team/invite
PUT    /api/v1/startups/:id/team/:memberId
DELETE /api/v1/startups/:id/team/:memberId
GET    /api/v1/startups/:id/applicants
```

### Investment & Funding
```typescript
// Investment Operations
POST   /api/v1/investments/offer
GET    /api/v1/investments/:id
PUT    /api/v1/investments/:id/response
GET    /api/v1/investments/portfolio/:userId
GET    /api/v1/investments/opportunities/:userId

// Funding Analytics
GET    /api/v1/analytics/funding-trends
GET    /api/v1/analytics/market-insights
GET    /api/v1/analytics/startup/:id/metrics
```

### Search & Discovery
```typescript
// Universal Search
GET    /api/v1/search?q=:query&type=:type&filters=:filters
GET    /api/v1/search/suggestions?q=:query
GET    /api/v1/search/autocomplete?q=:query

// Advanced Search
POST   /api/v1/search/advanced
GET    /api/v1/search/saved/:userId
POST   /api/v1/search/save
DELETE /api/v1/search/saved/:id
```

### Communication
```typescript
// Messaging
GET    /api/v1/conversations/:userId
POST   /api/v1/conversations
GET    /api/v1/conversations/:id/messages
POST   /api/v1/conversations/:id/messages
PUT    /api/v1/messages/:id
DELETE /api/v1/messages/:id

// Notifications
GET    /api/v1/notifications/:userId
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/read-all
DELETE /api/v1/notifications/:id
```

---

## 3. WebSocket Events

### Real-time Collaboration
```typescript
// Connection Events
interface SocketEvents {
  // User Presence
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
  'user:typing': (conversationId: string, userId: string) => void;
  
  // Collaboration Events
  'collaboration:join': (collaborationId: string) => void;
  'collaboration:leave': (collaborationId: string) => void;
  'collaboration:update': (update: CollaborationUpdate) => void;
  
  // Document Collaboration
  'document:join': (documentId: string) => void;
  'document:change': (delta: DocumentDelta) => void;
  'document:cursor': (position: CursorPosition) => void;
  
  // Live Chat
  'message:send': (message: MessageData) => void;
  'message:receive': (message: Message) => void;
  'message:edit': (messageId: string, content: string) => void;
  'message:delete': (messageId: string) => void;
  
  // Notifications
  'notification:new': (notification: Notification) => void;
  'notification:read': (notificationId: string) => void;
  
  // Startup Updates
  'startup:update': (startupId: string, update: StartupUpdate) => void;
  'startup:team_join': (startupId: string, memberId: string) => void;
  'startup:funding_update': (startupId: string, funding: FundingUpdate) => void;
}

interface CollaborationUpdate {
  type: 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'ROLE_UPDATED' | 'STATUS_CHANGED';
  collaborationId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

interface DocumentDelta {
  documentId: string;
  operations: Operation[];
  userId: string;
  timestamp: Date;
}
```

---

## 4. Data Models & Database Schema

### PostgreSQL Schema
```sql
-- Users table with accessibility features
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  location GEOGRAPHY(POINT),
  timezone VARCHAR(50),
  accessibility_preferences JSONB,
  skills TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  reputation_score INTEGER DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'UNVERIFIED',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- AI matching vectors
  profile_embedding vector(768),
  skills_embedding vector(384)
);

-- Startups table
CREATE TABLE startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  funding_stage VARCHAR(20) NOT NULL,
  target_market VARCHAR(200),
  equity_offered DECIMAL(5,2),
  estimated_timeline VARCHAR(100),
  is_public BOOLEAN DEFAULT true,
  accessibility_compliant BOOLEAN DEFAULT false,
  pitch_deck_url VARCHAR(500),
  business_plan_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector,
  content_embedding vector(768)
);

-- Collaborations table
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id),
  collaborator_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  equity_percentage DECIMAL(5,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(startup_id, collaborator_id)
);

-- Investments table
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id),
  investor_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  stage VARCHAR(20) NOT NULL,
  valuation DECIMAL(15,2),
  equity_percentage DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'PENDING',
  terms JSONB,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'TEXT',
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  accessibility_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search optimization indexes
CREATE INDEX idx_startups_search ON startups USING gin(search_vector);
CREATE INDEX idx_startups_tags ON startups USING gin(tags);
CREATE INDEX idx_startups_funding_stage ON startups(funding_stage);
CREATE INDEX idx_startups_location ON startups USING gist(ST_GeogFromWKB(location));

-- AI matching indexes
CREATE INDEX idx_users_profile_embedding ON users USING ivfflat (profile_embedding vector_cosine_ops);
CREATE INDEX idx_startups_content_embedding ON startups USING ivfflat (content_embedding vector_cosine_ops);

-- Performance indexes
CREATE INDEX idx_collaborations_startup_status ON collaborations(startup_id, status);
CREATE INDEX idx_investments_investor_status ON investments(investor_id, status);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
```

### MongoDB Collections (Supplementary Data)
```javascript
// Chat conversations and activity feeds
db.conversations.createIndex({ participants: 1, updatedAt: -1 });
db.conversations.createIndex({ "lastMessage.createdAt": -1 });

// User activity tracking
db.user_activities.createIndex({ userId: 1, timestamp: -1 });
db.user_activities.createIndex({ type: 1, timestamp: -1 });

// Search analytics
db.search_queries.createIndex({ query: "text", timestamp: -1 });
db.search_queries.createIndex({ userId: 1, timestamp: -1 });

// File metadata
db.files.createIndex({ uploadedBy: 1, createdAt: -1 });
db.files.createIndex({ type: 1, tags: 1 });
```

---

## 5. API Error Handling

### Error Response Format
```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    suggestions?: string[];
    accessibilityFriendlyMessage?: string;
  };
  timestamp: string;
  path: string;
  traceId: string;
}

// Example error responses
const ValidationError = {
  error: {
    code: 'VALIDATION_FAILED',
    message: 'The provided data is invalid',
    details: {
      email: 'Email format is invalid',
      password: 'Password must be at least 8 characters'
    },
    accessibilityFriendlyMessage: 'Please check the email format and ensure password has at least 8 characters'
  },
  timestamp: '2024-01-15T10:30:00Z',
  path: '/api/v1/auth/signup',
  traceId: 'abc123'
};
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic errors)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

---

## 6. Rate Limiting & Security

### Rate Limiting Rules
```typescript
// Per-endpoint rate limits
const rateLimits = {
  'POST /api/v1/auth/signin': '5 requests/minute',
  'POST /api/v1/auth/signup': '3 requests/minute',
  'GET /api/v1/search': '60 requests/minute',
  'POST /api/v1/messages': '30 requests/minute',
  'POST /api/v1/startups': '10 requests/hour',
  'POST /api/v1/investments/offer': '5 requests/hour'
};

// User tier-based limits
const tierLimits = {
  free: '1000 requests/day',
  pro: '10000 requests/day',
  enterprise: 'unlimited'
};
```

### Security Headers
```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

This comprehensive API specification ensures Kolabolab can handle all platform operations with proper accessibility, security, and scalability considerations built-in from the start.