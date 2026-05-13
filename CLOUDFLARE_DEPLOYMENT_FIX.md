# Cloudflare Workers Deployment Fix

## Problem
The Cloudflare Workers deployment was failing with the following errors:
```
✘ [ERROR] Could not resolve "hono"
✘ [ERROR] Could not resolve "hono/cors"
✘ [ERROR] Could not resolve "hono/jwt"
✘ [ERROR] Could not resolve "hono/http-exception"
```

## Root Cause
The deployment process was trying to build `backend/workers-main.ts` but the Hono dependencies were not properly installed before the wrangler build process.

## Solution Applied

### 1. Updated wrangler.toml
- Enabled the build configuration to run `npm ci` in the backend directory
- This ensures dependencies are installed before the Workers code is built

```toml
[build]
command = "npm ci"
cwd = "backend"
```

### 2. Updated GitHub Workflow
- Modified `.github/workflows/staging-deploy.yml` to explicitly install backend dependencies
- Changed the deployment process to run from the root directory after installing dependencies

### 3. Created Deployment Script
- Added `deploy-cloudflare.sh` script for manual deployments
- Ensures proper order: frontend build → backend deps → wrangler deploy

## Deployment Process

### Manual Deployment
```bash
# Use the deployment script
./deploy-cloudflare.sh

# Or run manually:
cd frontend && npm ci && npm run build && cd ..
cd backend && npm ci && cd ..
npx wrangler deploy --env staging
```

### Automated Deployment
The GitHub workflow now automatically:
1. Builds the frontend
2. Installs backend dependencies
3. Deploys to Cloudflare Workers

## Dependencies
The backend package.json includes:
- `hono: "^4.8.5"` - Main Hono framework
- All required Hono middleware packages are included in the main Hono package

## Environment Configuration
Make sure these secrets are set in your Cloudflare/GitHub environment:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- Other environment-specific secrets as defined in wrangler.toml

## Testing the Fix
To verify the deployment works:
1. Push changes to trigger the staging deployment workflow
2. Check that the Workers deployment step completes successfully
3. Verify the API is accessible at the staging URL

## Future Considerations
- Monitor Hono version updates for compatibility
- Consider using a dedicated package.json for Workers if dependencies diverge significantly
- Ensure all required environment variables are properly configured