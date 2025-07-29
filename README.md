# KolaboLab - Revolutionary Startup Collaboration Platform

> **A modern, AI-powered platform connecting entrepreneurs, collaborators, and investors worldwide with accessibility-first design and bias-free matching algorithms.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Accessibility](https://img.shields.io/badge/WCAG-2.2_AA-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

## 🚀 Vision & Mission

KolaboLab revolutionizes how startups are born, grown, and funded by eliminating barriers and creating meaningful connections in the global tech ecosystem. Inspired by DemocracyLab's tech-for-good approach, we focus on social impact technology and inclusive participation.

### Core Values
- **🌍 Global Accessibility**: WCAG 2.2 AA compliant with 50+ language support
- **🤖 AI-Powered Matching**: Bias-free algorithms for fair opportunities
- **⚡ Innovation First**: Cutting-edge design and user experience
- **🤝 Inclusive Collaboration**: Breaking down barriers for all participants

## 🏗️ Architecture Overview

### Monorepo Structure
```
kolabolab/
├── frontend/          # React 18 + TypeScript + Vite
├── backend/           # NestJS API + PostgreSQL + Redis
├── docker-compose.yml # Complete development environment
├── nginx/             # Production reverse proxy
└── docs/              # Documentation and guides
```

### Technology Stack

#### Frontend (React + Vite)
- **⚛️ React 18** with TypeScript and Vite for lightning-fast development
- **🎨 Revolutionary Design System** with custom CSS variables and Chakra UI
- **🔄 State Management**: Zustand for client state, TanStack Query for server state
- **🎯 Authentication**: JWT with persistent storage and automatic refresh
- **🌐 Real-time**: Socket.IO for live collaboration features
- **♿ Accessibility**: WCAG 2.2 AA compliance with screen reader support
- **🧪 Testing**: Vitest + Testing Library + Playwright for comprehensive coverage

#### Backend (NestJS + PostgreSQL)
- **🛡️ NestJS Framework** with TypeORM for robust API development
- **🗄️ PostgreSQL 15** with pgvector for AI-powered matching
- **🔐 Authentication**: JWT + OAuth2 (Google, LinkedIn, GitHub)
- **⚡ Real-time**: Socket.IO with Redis clustering
- **📊 Search**: Elasticsearch integration for startup discovery
- **🤖 AI Services**: Python FastAPI microservice for ML algorithms
- **📚 Documentation**: Auto-generated Swagger/OpenAPI

### Design System Innovation

Our revolutionary design system breaks away from traditional templates with:

#### 🎨 Modern Button Variants
- **Asymmetric Shapes**: Dynamic clip-path polygons for unique aesthetics
- **Gradient Systems**: Context-aware color gradients for different user types
- **Micro-interactions**: Physics-based animations with cubic-bezier easing
- **Glassmorphism**: Advanced backdrop-filter effects for depth

#### 🌈 Color Psychology
- **Primary Blue (#1890FF)**: Trust and collaboration
- **Startup Orange (#FF9500)**: Innovation and energy  
- **Investment Green (#52C41A)**: Growth and success
- **Semantic Gradients**: Role-based visual language

#### 📱 Responsive Excellence
- **Mobile-first**: Enhanced touch targets (44px minimum)
- **Fluid Typography**: clamp() functions for perfect scaling
- **Adaptive Layouts**: CSS Grid with intelligent breakpoints
- **Dark Mode**: Automatic system preference with manual override

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 15+ (for local development)

### 1. Clone and Setup
```bash
git clone https://github.com/your-org/kolabolab.git
cd kolabolab

# Install dependencies
npm install --prefix frontend
npm install --prefix backend
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update environment variables with your settings
```

### 3. Start Development Environment
```bash
# Start infrastructure
docker-compose up -d postgres redis

# Start backend
cd backend && npm run start:dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## 🛠️ Development Commands

### Frontend Development
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test              # Unit tests with Vitest
npm run test:ui          # Interactive test UI
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests
npm run test:a11y        # Accessibility testing

# Linting and formatting
npm run lint             # ESLint with accessibility rules
npm run lint:fix         # Auto-fix issues
npm run type-check       # TypeScript validation
```

### Backend Development
```bash
cd backend

# Development with hot reload
npm run start:dev

# Build and start production
npm run build
npm run start:prod

# Database operations
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
npm run schema:sync      # Development only
npm run seed            # Seed database

# Testing
npm run test            # Jest unit tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # API integration tests
```

### Docker Operations
```bash
# Full stack development
docker-compose up -d

# Infrastructure only
docker-compose up -d postgres redis

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Database access
docker-compose exec postgres psql -U kolabolab -d kolabolab
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=KolaboLab
VITE_ENABLE_ANALYTICS=false
```

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://kolabolab:password@localhost:5432/kolabolab

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate with: openssl rand -hex 64)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🎨 Design System Usage

### Button Variants
```tsx
// Revolutionary button designs
<Button variant="startup">Launch Startup</Button>
<Button variant="investor">Invest Now</Button>
<Button variant="asymmetric">Get Started</Button>
<Button variant="glass">Transparent Action</Button>
```

### Card Components
```tsx
// Glassmorphism cards with context-aware styling
<Card variant="startup" className="card-hover">
  <CardBody>Startup content</CardBody>
</Card>

<Card variant="investor" className="card-hover">
  <CardBody>Investment content</CardBody>
</Card>
```

### Animation Classes
```tsx
// Built-in animation utilities
<Box className="fade-in">Content that fades in</Box>
<Icon className="float-animation">Floating icon</Icon>
<Button className="interactive-element">Micro-interactions</Button>
```

## ♿ Accessibility Features

### WCAG 2.2 AA Compliance
- **Color Contrast**: All text meets 4.5:1 minimum ratio
- **Touch Targets**: Minimum 44px for all interactive elements
- **Screen Readers**: Full compatibility with NVDA, JAWS, VoiceOver
- **Keyboard Navigation**: Complete keyboard accessibility
- **Focus Management**: Enhanced focus indicators and skip links

### Global Inclusion
- **50+ Languages**: Real-time translation with i18next
- **Voice Input**: Form field voice input support
- **High Contrast**: Automatic high contrast mode detection
- **Reduced Motion**: Respects prefers-reduced-motion
- **Live Captions**: Video call accessibility features

## 🧪 Testing Strategy

### Test Coverage Requirements
- **Unit Tests**: >90% coverage for business logic
- **Integration Tests**: All API endpoints and database operations
- **E2E Tests**: Critical user journeys and accessibility flows
- **Visual Regression**: Automated screenshot comparison

### Running Tests
```bash
# Frontend tests
npm run test:all          # All frontend tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:a11y         # Accessibility tests

# Backend tests
npm run test:unit         # Unit tests
npm run test:integration  # API integration tests
npm run test:e2e          # Full system tests
```

## 🚀 Deployment

### Production Deployment
```bash
# Build applications
npm run build --prefix frontend
npm run build --prefix backend

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud platforms
npm run deploy:vercel     # Frontend to Vercel
npm run deploy:heroku     # Backend to Heroku
```

### Environment Setup
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Heroku, Railway, or AWS ECS
- **Database**: PostgreSQL on AWS RDS, Google Cloud SQL, or Railway
- **Redis**: Redis Cloud, AWS ElastiCache, or Railway

## 📖 API Documentation

### Authentication Endpoints
```bash
POST /auth/login          # User login
POST /auth/register       # User registration
POST /auth/refresh        # Token refresh
POST /auth/logout         # User logout
GET  /auth/profile        # Current user profile
```

### Startup Endpoints
```bash
GET    /startups          # List startups with filters
POST   /startups          # Create new startup
GET    /startups/:id      # Get startup details
PUT    /startups/:id      # Update startup
DELETE /startups/:id      # Delete startup
```

### Collaboration Endpoints
```bash
GET  /collaborations      # User collaborations
POST /collaborations      # Apply for collaboration
PUT  /collaborations/:id  # Update collaboration status
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled with comprehensive types
- **ESLint**: Accessibility and React best practices
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages
- **Test Coverage**: All new features must include tests

### Design Contributions
- Follow the established design system patterns
- Ensure WCAG 2.2 AA compliance for all new components
- Test with screen readers and keyboard navigation
- Consider global accessibility and internationalization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DemocracyLab**: Inspiration for tech-for-good platform approach
- **Chakra UI**: Foundation for our enhanced component system
- **Accessibility Community**: Guidance on inclusive design practices
- **Open Source Contributors**: The amazing developers who make this possible

## 📞 Support & Contact

- **Documentation**: [docs.kolabolab.com](https://docs.kolabolab.com)
- **Discord Community**: [discord.gg/kolabolab](https://discord.gg/kolabolab)
- **Email Support**: support@kolabolab.com
- **Security Issues**: security@kolabolab.com

---

**Built with ❤️ for global collaboration and innovation**

*Join us in revolutionizing how startups connect, collaborate, and succeed worldwide.*✅ Login API integration complete - ready for testing
