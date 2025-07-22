# Deploy KolaboLab to Cloudflare Workers

## Quick Setup Instructions

### 1. Install Hono (Lightweight Web Framework)
```bash
cd backend
npm install hono
```

### 2. Update wrangler.toml
Replace the main entry point:
```toml
main = "backend/src/workers-main.ts"
```

### 3. Create D1 Database and Set IDs
```bash
# Create staging database
wrangler d1 create kolabolab-staging

# Copy the database_id from output and update wrangler.toml:
# database_id = "your-actual-database-id"
```

### 4. Set Required Secrets
```bash
# JWT secrets
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_REFRESH_SECRET --env staging

# Email service
wrangler secret put RESEND_API_KEY --env staging
```

### 5. Deploy
```bash
wrangler deploy --env staging
```

## What This Provides

✅ **Lightweight API** - Uses Hono instead of heavy NestJS
✅ **Full Authentication** - Register, login, JWT tokens
✅ **Email Verification** - Resend integration
✅ **D1 Database** - SQLite database for users
✅ **KV Storage** - For sessions and caching
✅ **CORS Support** - Frontend integration ready

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile (protected)
- `GET /api/init-db` - Initialize database tables

## Frontend Integration

Update your frontend API base URL to:
```
https://staging-api.kolabolab.com
```

The API is fully compatible with your existing frontend authentication flow!