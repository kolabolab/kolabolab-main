# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AUTONOMOUS DEVELOPMENT MODE

**CRITICAL**: This project is configured for fully autonomous development. Claude Code should work independently without requiring any environment variables, user input, or external configuration. All development, testing, and deployment should be self-contained and executable from start to finish.

### Autonomous Development Guidelines

1. **Self-Contained Setup**: Always create complete development environments with mock data, test databases, and sample configurations
2. **No External Dependencies**: Use local alternatives for all external services during development (SQLite for PostgreSQL, in-memory Redis, mock APIs)
3. **Automated Testing**: Create comprehensive test suites that run without user intervention
4. **Mock Data Generation**: Generate realistic test data for all user types (entrepreneurs, investors, collaborators)
5. **Documentation-Driven**: Implement features based on the comprehensive documentation in this repository
6. **Progressive Enhancement**: Start with basic functionality and incrementally add advanced features

## Project Overview

Kolabolab is a tech-for-good collaboration platform inspired by DemocracyLab that connects entrepreneurs, skilled volunteers, and socially responsible companies. The platform emphasizes inclusive design and accessibility (WCAG 2.2 AA compliance) to serve users from all walks of life, with a focus on social impact and meaningful technological contributions.

## Technical Architecture

### Frontend Stack (Vite + React + TypeScript)
- **Build Tool**: Vite with lightning-fast HMR and ESM-native development
- **Framework**: React 18 with Concurrent Features and Suspense
- **Language**: TypeScript (strict mode) for type safety
- **State Management**: Zustand (lightweight) + TanStack Query (server state)
- **UI Library**: Chakra UI (built-in accessibility) + React Aria for WCAG 2.2 AA
- **Routing**: React Router v6 with code splitting and lazy loading
- **Real-time**: Socket.IO client with automatic reconnection

### Backend Stack (NestJS + Microservices)
- **Framework**: NestJS (Node.js + TypeScript) with modular architecture
- **API Gateway**: GraphQL Federation with REST fallbacks
- **Authentication**: JWT + OAuth2 (Google, LinkedIn, GitHub)
- **Real-time**: Socket.IO with Redis clustering for horizontal scaling
- **Database**: PostgreSQL 15+ with pgvector extension for AI matching
- **Cache**: Redis for sessions, rate limiting, and pub/sub messaging
- **Search**: Elasticsearch/OpenSearch for full-text and semantic search

### AI & Machine Learning
- **ML Framework**: Python FastAPI microservice with scikit-learn and PyTorch
- **NLP**: Hugging Face Transformers (BERT embeddings for semantic matching)
- **Vector Storage**: pgvector PostgreSQL extension for similarity search
- **Bias Detection**: Algorithmic fairness monitoring with automated alerts

### Infrastructure & Deployment
- **Cloud**: AWS (primary) with multi-region deployment
- **Orchestration**: Kubernetes (EKS) with auto-scaling and rolling updates
- **CDN**: Cloudflare with global edge network and DDoS protection
- **Monitoring**: Prometheus + Grafana + Jaeger for observability
- **CI/CD**: GitHub Actions with automated testing and security scanning

## Autonomous Development Workflow

### Phase 1: Project Initialization (Self-Contained)
```bash
# Initialize project structure
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
npm install @testing-library/react @testing-library/jest-dom vitest
npm install @axe-core/react eslint-plugin-jsx-a11y

# Create backend structure
mkdir -p backend/src/{auth,users,startups,collaborations,search}
cd backend && npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install @nestjs/testing jest supertest sqlite3
npm install @types/node typescript ts-node

# Setup development database (SQLite for autonomy)
mkdir -p data
touch data/kolabolab.db
```

### Phase 2: Core Development Commands
```bash
# Frontend Development (Autonomous)
npm run dev              # Start Vite with mock API integration
npm run build           # Production build with all optimizations
npm run test           # Run all tests with mock data
npm run test:a11y      # Accessibility testing (automated)
npm run storybook      # Component library with mock data

# Backend Development (Self-Contained)
npm run start:dev      # Start with SQLite and in-memory cache
npm run test          # Complete test suite with fixtures
npm run db:setup     # Initialize SQLite with schema and seed data
npm run mock:api     # Generate mock API responses

# AI/ML Services (Local Development)
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn scikit-learn pandas numpy
python app.py         # Start ML service with mock models
python tests/test_matching.py  # Test matching algorithms
```

### Phase 3: Integration & Testing (No External Dependencies)
```bash
# Full Stack Testing
npm run test:integration   # Frontend + Backend integration tests
npm run test:e2e          # End-to-end tests with Playwright
npm run test:accessibility # Complete WCAG 2.2 AA validation
npm run test:performance  # Lighthouse CI automated testing

# Mock Services for Development
npm run mock:elasticsearch  # Local search service simulation
npm run mock:redis         # In-memory cache simulation  
npm run mock:ai           # ML model simulation
```

### Required Mock Data Generation
When starting development, automatically generate:
- 100+ realistic user profiles (social entrepreneurs, volunteers, corporate partners)
- 50+ tech-for-good project ideas across different social impact areas (environment, healthcare, education, civic tech)
- Sample project collaborations and success stories
- Role-based user testimonials (similar to DemocracyLab's corporate partnership testimonials)
- Accessibility test scenarios
- Multi-language content samples
- Corporate partnership and sponsorship examples

### Self-Contained Testing Strategy
- **Unit Tests**: 90%+ coverage with Jest/Vitest
- **Integration Tests**: API endpoints with SQLite database
- **E2E Tests**: Playwright with accessibility assertions
- **Performance Tests**: Lighthouse CI with local server
- **Security Tests**: OWASP ZAP automated scanning

## MCP (Model Context Protocol) Integration

### Available MCP Tools for Development
```bash
# Current MCP servers configured:
claude mcp list
# - deepseek: AI reasoning and code generation
# - playwright: Automated browser testing
# - brave-search: Web research and validation
# - memory: Knowledge graph for project relationships
# - desktop-commander: System operations

# Add additional MCP tools as needed:
claude mcp add github "npx @modelcontextprotocol/server-github"
claude mcp add filesystem "npx @modelcontextprotocol/server-filesystem"
claude mcp add sqlite "npx @modelcontextprotocol/server-sqlite"
```

### MCP-Enhanced Development Workflow
1. **Research & Validation**: Use Brave Search MCP to validate technical decisions and find best practices
2. **Code Generation**: Use DeepSeek MCP for complex algorithm implementation and optimization
3. **Browser Testing**: Use Playwright MCP for automated accessibility and user experience testing
4. **Knowledge Management**: Use Memory MCP to track component relationships and architectural decisions
5. **System Integration**: Use Desktop Commander MCP for file operations and system configuration

### Autonomous MCP Usage Guidelines
- Leverage DeepSeek for implementing complex matching algorithms and accessibility features
- Use Playwright for comprehensive E2E testing including screen reader simulation
- Utilize Brave Search for researching latest accessibility standards and startup platform trends
- Apply Memory MCP to maintain context about user journeys and feature relationships
- Execute file operations through Desktop Commander to maintain system independence

## Core Features to Implement (Inspired by DemocracyLab)

### 1. Inclusive User Onboarding
- Progressive profiling to reduce cognitive load
- Voice input support for form fields
- Multiple authentication methods including social logins
- Role-based onboarding (Volunteer, Create Project, Be a Partner tabs)
- Accessibility preference capture during signup

### 2. Smart Project-Volunteer Matching System
- Skills-based project recommendations
- "Roles Needed" categorization system
- Location and remote work preferences
- AI-powered compatibility scoring with bias detection
- Impact area filtering (environment, healthcare, education, civic tech)

### 3. Project Showcase and Discovery
- Active project gallery with real-time updates
- Project cards showing location, website, timeline, and needed roles
- Category-based browsing (similar to DemocracyLab's project categories)
- Search and filter functionality
- Project impact metrics and success stories

### 4. Corporate Partnership Platform
- "Be a Partner" workflow for companies
- Sponsorship and in-kind support tracking
- Corporate volunteer program integration
- Partnership testimonials and case studies
- CSR impact reporting

### 5. Collaboration Tools
- Real-time project communication
- Role assignment and task management
- Document sharing with accessibility support
- Progress tracking and milestone management
- Team formation and volunteer onboarding

## User Types & Journeys

The platform serves six primary user personas (inspired by DemocracyLab's model):
1. **Social Impact Entrepreneurs** (including those with disabilities)
2. **Skilled Volunteers** (developers, designers, marketers, subject matter experts)
3. **Socially Responsible Companies** (seeking meaningful CSR partnerships)
4. **Project Leaders** (managing tech-for-good initiatives)
5. **Global Users** (emerging markets with connectivity constraints)
6. **Mentors & Advisors** (providing guidance and connections)

## Accessibility Implementation Notes

### Required Standards
- All interactive elements must have keyboard navigation
- Color contrast ratios must meet WCAG 2.2 AA standards
- Screen reader compatibility with proper ARIA labels
- Voice input support for critical user flows
- Real-time captions for all video content

### Testing Strategy
- Automated accessibility testing in CI/CD pipeline using axe-core
- Manual testing with screen readers (NVDA, JAWS, VoiceOver)
- User testing with people with disabilities
- Quarterly third-party accessibility audits

## Success Metrics

### Platform Health
- Volunteer retention: 85% at 90 days
- Project completion: 70% of formed teams complete their projects
- Volunteer-to-project matching: <30 days average
- Corporate engagement: 60% of partner companies provide ongoing support
- Accessibility compliance: 100% WCAG 2.2 AA

### Social Impact Metrics
- Projects completed with measurable social outcomes: 80%
- Corporate partnerships with sustained engagement: 75%
- Global reach: 150+ countries supported
- Success rate parity: <5% variance across demographic groups
- Language coverage: 50+ languages with real-time translation

## Search Architecture & Keywords

### Primary Search Keywords
The platform is optimized for discovery using these core keywords:
- `#startup` - Core startup ecosystem content
- `#angel` - Angel investor connections
- `#funding` - Funding opportunities and rounds
- `#invest` - Investment-related content
- `#collaborate` - Collaboration opportunities
- `#volunteer` - Volunteer and pro-bono work
- `#opportunity` - General opportunities
- `#success` - Success stories and testimonials
- `#testimonial` - User testimonials and reviews

### Secondary Keywords
- `#innovation`, `#entrepreneurship`, `#mentorship`, `#networking`
- `#pitch`, `#equity`, `#seed`, `#series-a`, `#accelerator`, `#incubator`
- `#remote`, `#global`, `#accessibility`, `#inclusion`, `#diversity`

### Search Implementation
- **Elasticsearch**: Full-text search with n-grams and edge n-grams
- **AI Semantic Search**: BERT embeddings for meaning-based matching
- **Multi-language**: Search support for 50+ languages
- **Faceted Search**: Filter by skills, location, project category, time commitment, remote/in-person
- **Role-Based Search**: Find projects needing specific technical roles
- **Impact Area Filtering**: Search by social impact categories
- **Auto-complete**: Type-ahead with typo tolerance and suggestions

## API Architecture

### GraphQL Federation
- **API Gateway**: Single endpoint with federated schemas
- **Microservices**: User, Startup, Collaboration, Investment, Search services
- **Real-time**: WebSocket subscriptions for live updates
- **REST Fallbacks**: Traditional REST endpoints for simple operations

### Key API Features
- **Type Safety**: Full TypeScript integration across frontend and backend
- **Rate Limiting**: Per-user and per-endpoint limits with graceful degradation
- **Caching**: Multi-layer caching (Redis, CDN, browser)
- **Security**: JWT authentication, OAuth2 integration, input validation

## Documentation Structure

- `PRD.md`: Comprehensive product requirements with competitive analysis
- `USER_JOURNEY_MAPS.md`: Detailed user flows for all stakeholder types
- `TECHNICAL_ARCHITECTURE.md`: Complete technical specifications and system design
- `API_SPECIFICATIONS.md`: GraphQL schemas, REST endpoints, and data models
- `DEPLOYMENT_INFRASTRUCTURE.md`: Kubernetes, cloud architecture, and DevOps
- `CLAUDE.md`: Development guidance for future Claude Code instances

## Success Metrics & KPIs

### Platform Health
- **User Retention**: 85% at 90 days (target)
- **Collaboration Success**: 70% of teams formed complete projects
- **First Investor Connection**: <60 days average time
- **Search Performance**: <200ms response time for queries
- **Accessibility Compliance**: 100% WCAG 2.2 AA conformance

### Inclusivity Metrics
- **Global Reach**: 150+ countries supported
- **Language Coverage**: 50+ languages with real-time translation
- **Success Rate Parity**: <5% variance across demographic groups
- **Accessibility User Satisfaction**: 90%+ satisfaction score

## Key Differentiators (Inspired by DemocracyLab)

1. **Social Impact Focus**: Tech-for-good projects with measurable social outcomes
2. **Corporate Social Responsibility**: Direct integration with company volunteer programs
3. **Accessibility-First Design**: Built from ground up with WCAG 2.2 AA compliance
4. **Skills-Based Volunteering**: Precise matching of technical skills to project needs
5. **Global Inclusion**: Multi-language, multi-currency, low-bandwidth support
6. **Partnership Ecosystem**: Corporate sponsors, in-kind support, and foundation backing
7. **Impact Measurement**: Success metrics focused on social good rather than profit

## Development Philosophy (Inspired by DemocracyLab)

- **Social Impact First**: Every feature should contribute to meaningful social good
- **Accessibility First**: Every feature must work for users with disabilities
- **Corporate Responsibility**: Design for meaningful corporate engagement beyond donations
- **Skills-Based Matching**: Precise alignment of technical skills with project needs
- **Performance**: Sub-second response times with global CDN optimization
- **Security**: Zero-trust architecture with end-to-end encryption
- **Scalability**: Microservices architecture supporting millions of users
- **Inclusivity**: Design for emerging markets and diverse user needs

When implementing features, always prioritize social impact measurement, accessibility, and inclusive design as core requirements, not afterthoughts. Test with assistive technologies and conduct regular accessibility audits. Focus on creating sustainable partnerships between technologists and social impact organizations.