# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## What this project is
KolaboLab is a full‑stack platform for startup collaboration. It’s a monorepo with a React (Vite + TypeScript + Chakra UI) frontend and a NestJS backend, using PostgreSQL, Redis, and optional Elasticsearch. Real‑time features use Socket.IO. Accessibility (WCAG 2.2 AA) is a core requirement (see CLAUDE.md).

## Commands you’ll use most

### Root (runs from repo root)
- Install everything once: `npm run install:all`
- Start both apps (dev): `npm run dev`
- Build apps: `npm run build` (frontend only) and `npm run build:backend`
- Test all (front+back): `npm run test`
- Lint all (front+back): `npm run lint`
- Docker up/down/logs: `npm run docker:up` | `npm run docker:down` | `npm run docker:logs`

### Frontend (run in `frontend/`)
- Dev server: `npm run dev` (Vite on http://localhost:3000)
- Build: `npm run build`
- Lint: `npm run lint`
- Unit tests: `npm run test`
- E2E tests (Playwright): `npm run test:e2e`
- Accessibility tests: `npm run test:a11y`
- Run a single test file: `npm run test -- src/path/to/File.test.tsx`
- Run a single test name: `npm run test -- -t "test name substring"`

### Backend (run in `backend/`)
- Dev API server: `npm run start:dev` (Nest on http://localhost:3001)
- Build/start prod: `npm run build` then `npm run start:prod`
- Lint: `npm run lint`
- Tests: `npm run test` | watch `npm run test:watch` | coverage `npm run test:cov`
- Run a single test file: `npm run test -- src/path/to/file.spec.ts`
- Run a single test name: `npm run test -- -t "test name substring"`
- TypeORM ops: `npm run migration:generate -- -n Name` | `npm run migration:run` | `npm run migration:revert` | `npm run schema:sync` (dev only) | `npm run seed`

### Local services (Docker Compose from project root)
- Infra only: `docker-compose up -d postgres redis`
- Full stack: `docker-compose up -d`
- Tail logs: `docker-compose logs -f backend` (or `frontend`)
- psql: `docker-compose exec postgres psql -U kolabolab -d kolabolab`

## High‑level architecture (big picture)

### Frontend (React + Vite)
- Routing: React Router v6 with lazy‑loaded pages. See `frontend/src/App.tsx` for route tree and ProtectedRoute usage.
- State: Zustand for client state; TanStack Query for server state/caching.
- Auth: `providers/AuthProvider.tsx` + `hooks/useAuth.ts`; JWT persisted; API client injects tokens (`services/apiClient.ts`).
- Real‑time: `providers/SocketProvider.tsx` (Socket.IO client).
- Styling/design system: Chakra theme + custom variants; accessibility utilities and skip links included in `App.tsx`.
- Dev proxy: Vite proxies `/api` and `/socket.io` to backend (see `frontend/vite.config.ts`).

Key entry points:
- `frontend/src/App.tsx` — routes, loaders, and accessibility scaffolding.
- `frontend/src/services/apiClient.ts` — Axios instance + interceptors.
- `frontend/vite.config.ts` — proxy and build chunking.

### Backend (NestJS)
- Composition: Standard module/service/controller layout (e.g., `src/auth`, `src/users`, `src/startups`, `src/collaborations`, `src/investments`, `src/search`).
- App setup: `backend/src/main.ts` configures security (Helmet), compression, CORS, global validation, `/api` prefix, and Swagger at `/api/docs`.
- Auth: JWT (Passport) + optional OAuth (Google/LinkedIn/GitHub). Role‑based access (entrepreneur, collaborator, investor, admin).
- Realtime: Socket.IO with Redis for scaling.
- Search: Elasticsearch integration (optional in dev).

Key entry points:
- `backend/src/main.ts` — app bootstrap, CORS, Swagger.
- `backend/src/auth/*` — controllers/services/strategies for JWT & OAuth.
- `backend/src/search/*` — search integration.

### Data layer
- PostgreSQL 15 with TypeORM; Redis for caching/queues; optional Elasticsearch for search.
- Schema and helpers: `backend/src/database/init.sql` sets extensions (uuid, pgcrypto, pgvector), defines enums, FTS indexes, utility functions (e.g., `search_startups`, `search_users`), and analytic views.
- Migrations: use TypeORM migrations for schema changes (do not rely on `schema:sync` in production).

## Environment configuration (what you must set)
Create `.env` files from the provided examples and adjust as needed:
- Frontend: copy `frontend/.env.example` to `frontend/.env` (e.g., `VITE_API_URL=http://localhost:3001`).
- Backend: copy `backend/.env.example` to `backend/.env` and set DB/Redis, JWT secrets (generate via `openssl rand -hex 64`), `FRONTEND_URL`, and any OAuth/email settings you intend to use.

## API surface (where to look)
- All endpoints are under `/api` (set in `main.ts`).
- Swagger UI at `http://localhost:3001/api/docs` (enabled in dev and when Swagger is configured).

## Agent rules distilled from CLAUDE.md (project‑specific)
- Treat WCAG 2.2 AA accessibility as non‑negotiable for UI changes (focus states, keyboard navigation, contrast, reduced‑motion, skip links).
- Prefer strict TypeScript and avoid `any`; keep controllers thin, put logic in services; validate input with DTOs (`class-validator`).
- Keep JWT/OAuth flows intact (tokens persisted on the client; API interceptors attach tokens; ProtectedRoute guards routes).
- Search and matching may rely on pgvector/Elasticsearch; keep those integrations optional in local dev but don’t remove hooks.
- For realtime features, preserve Socket.IO patterns and Redis compatibility.

## Where new contributors should start
- Start the dev stack: `docker-compose up -d postgres redis`, then `npm run dev` (or run backend/frontend separately in their folders).
- Open `frontend/src/App.tsx` and `backend/src/main.ts` to understand routing, guards, and global middleware.
- If backend errors mention CORS, verify `FRONTEND_URL` in backend `.env` and Vite proxy config.

## Notes pulled from README.md (only the essentials)
- Frontend on `http://localhost:3000`, API on `http://localhost:3001/api`, docs on `http://localhost:3001/api/docs`.
- Design system includes custom button/card variants and accessibility utilities; keep those patterns consistent.
- Testing spans unit/integration/E2E with high coverage goals; Playwright is used for E2E, axe for a11y checks.
