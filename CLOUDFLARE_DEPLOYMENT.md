# Cloudflare Deployment Guide

🚫 **GitHub Actions Disabled** - All deployments now use Cloudflare directly to avoid billing charges.

## 🚀 Quick Deployment Commands

### Deploy Everything (Staging)
```bash
npm run deploy
# or
./deploy-cloudflare-manual.sh staging
```

### Deploy to Production
```bash
npm run deploy:production
# or
./deploy-cloudflare-manual.sh production
```

### Deploy Only Frontend
```bash
npm run deploy:frontend
# or
./deploy-cloudflare-manual.sh staging true false
```

### Deploy Only Backend
```bash
npm run deploy:backend
# or
./deploy-cloudflare-manual.sh staging false true
```

## 🧪 Testing

### Local Testing
```bash
# Run all tests locally
npm test

# Test frontend only
npm run test:frontend

# Test backend only
npm run test:backend

# Test in Cloudflare Workers environment
npm run test:cloudflare
```

### Cloudflare Workers Testing
```bash
# Deploy test environment
wrangler deploy cloudflare-testing.js --name kolabolab-test

# Run tests in Cloudflare
curl https://kolabolab-test.your-subdomain.workers.dev/test
```

## 🌐 Deployment Environments

### Staging
- **Frontend**: https://staging.kolabolab.com (Cloudflare Pages)
- **Backend**: https://staging-api.kolabolab.com (Cloudflare Workers)
- **Testing**: https://kolabolab-test.your-subdomain.workers.dev

### Production
- **Frontend**: https://kolabolab.com (Cloudflare Pages)
- **Backend**: https://api.kolabolab.com (Cloudflare Workers)

## 📋 Prerequisites

1. **Wrangler CLI installed**:
   ```bash
   npm install -g wrangler
   ```

2. **Cloudflare authentication**:
   ```bash
   wrangler login
   ```

3. **Environment secrets configured**:
   ```bash
   # Set secrets for staging
   wrangler secret put JWT_SECRET --env staging
   wrangler secret put JWT_REFRESH_SECRET --env staging
   wrangler secret put RESEND_API_KEY --env staging
   
   # Set secrets for production
   wrangler secret put JWT_SECRET --env production
   wrangler secret put JWT_REFRESH_SECRET --env production
   wrangler secret put RESEND_API_KEY --env production
   ```

## 🔧 Manual Deployment Steps

### Frontend (Cloudflare Pages)
1. Build the frontend:
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   wrangler pages deploy dist --project-name kolabolab
   ```

### Backend (Cloudflare Workers)
1. Install dependencies and build:
   ```bash
   cd backend
   npm ci
   npm run build
   ```

2. Deploy to Cloudflare Workers:
   ```bash
   # Staging
   wrangler deploy --env staging
   
   # Production
   wrangler deploy --env production
   ```

## 💰 Cost Benefits

- ✅ **Zero GitHub Actions charges**
- ✅ **Free Cloudflare Pages hosting**
- ✅ **Free Cloudflare Workers (100k requests/day)**
- ✅ **Global CDN included**
- ✅ **Automatic HTTPS**
- ✅ **DDoS protection**

## 🔍 Monitoring

### Check Deployment Status
```bash
# Check Workers deployment
wrangler tail --env staging

# Check Pages deployment
wrangler pages deployment list --project-name kolabolab
```

### Health Checks
```bash
# Backend health
curl https://staging-api.kolabolab.com/health

# Frontend health
curl https://staging.kolabolab.com

# Test endpoint
curl https://kolabolab-test.your-subdomain.workers.dev/test
```

## 🚨 Troubleshooting

### Common Issues
1. **Wrangler not authenticated**: Run `wrangler login`
2. **Missing secrets**: Set required environment variables
3. **Build failures**: Check Node.js version (use Node 20)
4. **Domain not configured**: Update DNS settings in Cloudflare

### Debug Commands
```bash
# Check wrangler configuration
wrangler whoami

# Validate wrangler.toml
wrangler validate

# View logs
wrangler tail --env staging
```

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)