# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KolaboLab is a full-stack startup collaboration platform connecting entrepreneurs, collaborators, and investors. Built with modern web technologies and emphasizing accessibility (WCAG 2.2 AA compliance), the platform facilitates meaningful connections in the tech startup ecosystem.

**Inspired by DemocracyLab**: The platform draws inspiration from DemocracyLab's tech-for-good approach, adapting their volunteer-project matching model for startup collaboration and investment. KolaboLab focuses on social impact technology and meaningful partnerships between technologists and entrepreneurs.

**Core Mission**: Enable inclusive startup ecosystem participation through bias-free matching algorithms, accessibility-first design, and support for 50+ languages with real-time translation.

## Architecture

### Monorepo Structure
- `frontend/` - React 18 + TypeScript + Vite application
- `backend/` - NestJS API with PostgreSQL and Redis
- `docker-compose.yml` - Complete development environment setup

### Frontend Architecture (React + Vite)
- **State Management**: Zustand for client state, TanStack Query for server state
- **UI Framework**: Chakra UI with custom accessibility-first theme
- **Authentication**: JWT tokens with persistent storage via Zustand
- **Real-time**: Socket.IO client for live features
- **Routing**: React Router v6 with lazy-loaded components and protected routes
- **Testing**: Vitest + Testing Library + Playwright for E2E

**Key Frontend Patterns:**
- All pages are lazy-loaded React components in `src/pages/`
- Layout components (`Navbar`, `Sidebar`, `Footer`) wrap main content
- Authentication state managed via `useAuth` hook and `AuthProvider`
- Protected routes wrap authenticated pages with `ProtectedRoute` component
- Theme system supports light/dark modes with accessibility compliance

### Backend Architecture (NestJS + PostgreSQL)
- **Framework**: NestJS with TypeORM for database operations
- **Database**: PostgreSQL 15 with pgvector extension for AI matching and comprehensive schema in `backend/src/database/init.sql`
- **Authentication**: JWT strategy with Passport, OAuth2 providers (Google, LinkedIn, GitHub)
- **Real-time**: Socket.IO with Redis clustering for horizontal scaling
- **Documentation**: Auto-generated Swagger/OpenAPI at `/api/docs`
- **Security**: Helmet, CORS, rate limiting, input validation
- **Search**: Elasticsearch integration with startup ecosystem keywords (startup, angel, funding, invest, collaborate, volunteer, opportunity, success, testimonial)
- **AI Services**: Python FastAPI microservice for ML algorithms, collaborative filtering, and BERT embeddings

**Key Backend Patterns:**
- Feature modules (`auth`, `users`, `startups`, `collaborations`, `investments`)
- Configuration modules for database, JWT, and Redis settings
- Entity-first approach with TypeORM decorators
- Service-controller-module pattern throughout
- Comprehensive error handling and validation

## MCP Integration & Development Tools

### Available MCP Tools
The project integrates with Model Context Protocol (MCP) for enhanced development:
- **Memory MCP**: Knowledge graph tracking project relationships, architecture decisions, and development context
- **Playwright MCP**: Automated browser testing with accessibility validation
- **DeepSeek MCP**: AI-powered code generation and complex algorithm implementation
- **Desktop Commander MCP**: System operations and file management
- **IDE MCP**: Code diagnostics and execution within development environment

### Development Workflow with MCP
1. **Research & Validation**: Use memory graph to understand existing patterns and decisions
2. **Code Generation**: Leverage AI tools for complex authentication and matching algorithms
3. **Testing**: Automated accessibility testing with Playwright MCP
4. **System Integration**: File operations and environment management via desktop tools

## Development Commands

### Environment Setup
```bash
# Start infrastructure (PostgreSQL + Redis)
docker-compose up -d postgres redis

# Install dependencies
npm install --prefix frontend
npm install --prefix backend
```

### Frontend Development
```bash
cd frontend
npm run dev              # Start dev server on http://localhost:3000
npm run build           # Production build
npm run lint            # ESLint with accessibility rules
npm run test            # Run unit tests with Vitest
npm run test:ui         # Interactive test UI
npm run test:coverage   # Coverage report
npm run test:e2e        # Playwright E2E tests
npm run test:a11y       # Accessibility testing with axe-core
```

### Backend Development
```bash
cd backend
npm run start:dev       # Start with watch mode
npm run build          # Compile TypeScript
npm run lint           # ESLint + auto-fix
npm run test           # Jest unit tests
npm run test:watch     # Jest in watch mode
npm run test:cov       # Coverage report
npm run test:e2e       # End-to-end API tests
```

### Database Operations
```bash
cd backend
npm run migration:generate -- -n MigrationName  # Generate migration
npm run migration:run                           # Apply migrations
npm run migration:revert                        # Revert last migration
npm run schema:sync                             # Sync schema (dev only)
npm run seed                                    # Seed database
```

### Docker Operations
```bash
# Full stack with Docker
docker-compose up -d                    # All services
docker-compose up -d postgres redis     # Infrastructure only
docker-compose logs -f backend          # View backend logs
docker-compose exec postgres psql -U kolabolab -d kolabolab  # Database CLI
```

## Core Configuration

### Environment Variables
- Frontend: `VITE_API_URL`, `VITE_WS_URL` for API endpoints
- Backend: Database, Redis, JWT secrets, OAuth credentials (see `.env.example`)
- JWT secrets generated with OpenSSL: `openssl rand -hex 64`

### Brand Colors & Design System
- **Primary Blue**: #1890FF (brand color)
- **Startup Orange**: #FF9500 (entrepreneur features)
- **Investment Green**: #52C41A (investor features)
- **Typography**: Inter font family for enhanced readability
- **Accessibility**: High contrast mode support, enhanced focus states

### Database Schema
- PostgreSQL with custom types for enums (user roles, startup stages, etc.)
- Full-text search indexes with tsvector for efficient searching
- Vector extension support for AI-powered matching (pgvector)
- Comprehensive seed data for development in `backend/src/database/init.sql`

### AI Matching & Search System
- **Vector Search**: pgvector PostgreSQL extension for similarity matching
- **NLP Processing**: Hugging Face Transformers with BERT embeddings for semantic analysis
- **Search Keywords**: Optimized for startup ecosystem terms (startup, angel, funding, invest, collaborate, volunteer, opportunity, success, testimonial)
- **Bias Mitigation**: Anonymized profile matching and AI-powered bias detection
- **Batch Processing**: Daily cron jobs for user notifications and matching updates

### Authentication Flow
1. Frontend auth state managed by Zustand store (`useAuth` hook)
2. JWT tokens stored persistently with automatic refresh
3. API client interceptors handle token attachment and 401 responses
4. Protected routes redirect unauthenticated users to login
5. Role-based access control via user roles array

### Real-time Features
- Socket.IO connection managed by `SocketProvider`
- Authentication tokens passed via socket auth
- Automatic reconnection and error handling
- Redis pub/sub for multi-instance scaling

## Testing Strategy

### Frontend Testing
- Unit tests with Vitest and React Testing Library
- Accessibility testing with axe-core integration
- E2E testing with Playwright including visual regression
- Component testing in isolation with Storybook patterns

### Backend Testing
- Unit tests with Jest and NestJS testing utilities
- Integration tests with in-memory database
- API endpoint testing with Supertest
- Authentication flow testing with mocked JWT

## Deployment

### Cloud Deployment Options
- **Vercel**: Frontend with serverless functions for backend
- **Cloudflare**: Pages for frontend, Workers for backend API
- **Traditional**: Docker containers with orchestration

### Production Considerations
- Environment-specific configuration via config modules
- Database migrations managed via TypeORM CLI
- Redis clustering for session storage and real-time scaling
- CDN integration for static assets and global performance

## Accessibility & Inclusion Requirements

This platform maintains WCAG 2.2 AA compliance with enhanced features:
- **Universal Design**: All interactive elements have keyboard navigation
- **Visual Accessibility**: Color contrast ratios meet AA standards, high contrast mode support
- **Screen Reader**: Compatible with NVDA, JAWS, VoiceOver with proper ARIA labels
- **Cognitive Accessibility**: Progressive profiling to reduce cognitive load
- **Motor Accessibility**: Voice input support for form fields and navigation
- **Global Inclusion**: Real-time translation for 50+ languages with i18next integration
- **Live Communication**: Live captions and sign language interpreter support for video calls
- **Focus Management**: Enhanced focus states for single-page application patterns
- **Dynamic Content**: Real-time announcements for live updates and notifications

### Bias Reduction Features
- Anonymized profile matching to reduce unconscious bias
- AI-powered bias detection in matching algorithms
- Inclusive language checking in content and communications
- Diverse representation in UI imagery and examples