# GitHub Actions Disabled

🚫 **All GitHub Actions workflows have been disabled to avoid billing charges.**

## What was moved:
- All `.yml` workflow files moved to `.github/workflows-disabled/`
- No workflows will run automatically on push/PR
- No GitHub Actions minutes will be consumed

## New Deployment Strategy:
- **Frontend**: Cloudflare Pages (automatic deployment)
- **Backend**: Cloudflare Workers (manual deployment via wrangler)
- **Testing**: Cloudflare Workers testing environment

## Manual Deployment Commands:
```bash
# Deploy frontend to Cloudflare Pages
cd frontend && npm run build
# Upload to Cloudflare Pages manually or via wrangler pages

# Deploy backend to Cloudflare Workers
cd backend && npm ci
npx wrangler deploy --env staging
npx wrangler deploy --env production

# Run tests locally
cd frontend && npm test
cd backend && npm test
```

## Benefits:
- ✅ Zero GitHub Actions billing
- ✅ Free Cloudflare hosting
- ✅ Fast global CDN
- ✅ Serverless backend
- ✅ Manual control over deployments