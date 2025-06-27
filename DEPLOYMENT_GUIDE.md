# KolaboLab Deployment Guide

## 🚨 IMMEDIATE ACTION REQUIRED

**You've exposed your Resend API key: `re_LDsLDNHv_6GH4Zq7iPsh59o5sUJYmjFkk`**

### Step 1: Revoke Exposed Key (DO THIS NOW)
1. Go to https://resend.com/api-keys
2. Find and delete the exposed key
3. Generate a new API key
4. Copy the new key for deployment

### Step 2: Quick Deployment Fix
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Set new API key
cd backend
vercel env add RESEND_API_KEY production
# Paste your NEW API key when prompted

# Redeploy
vercel --prod
```

### Step 3: Verify Security
- Check Resend usage logs for unauthorized activity
- Monitor billing for unexpected charges
- Test email functionality with new key

## Complete Setup Guide

### Environment Variables (Production)
```bash
# Email (NEW KEY REQUIRED)
RESEND_API_KEY=re_your_NEW_secure_api_key
FROM_EMAIL=noreply@kolabolab.com
FROM_NAME=KolaboLab Team

# Application
NODE_ENV=production
FRONTEND_URL=https://kolabolab.com

# Database
DB_HOST=your_postgres_host
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=kolabolab

# JWT (Generate with: openssl rand -hex 64)
JWT_SECRET=your_64_char_secret
JWT_REFRESH_SECRET=your_64_char_refresh_secret
```

### Deployment Commands
```bash
# Backend deployment
cd backend
vercel --prod

# Frontend deployment  
cd frontend
vercel --prod
```

## Security Best Practices
- Never commit API keys to code
- Use different keys for dev/prod
- Rotate keys every 3-6 months
- Monitor usage regularly

## Health Check
After deployment, verify:
- Email service works: Test registration/password reset
- API endpoints respond correctly
- Frontend connects to backend

For security issues, see `backend/SECURITY.md`