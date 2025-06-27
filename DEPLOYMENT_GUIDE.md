# KolaboLab Deployment Guide

## 🚀 Backend Deployment to Railway

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Connect GitHub Repository**: Link your GitHub account and select this repository
3. **Create New Project**: 
   ```bash
   # Railway will automatically detect the nixpacks.toml configuration
   # and build using: npm run install:all && npm run build:backend
   ```

4. **Add Environment Variables** in Railway dashboard:
   ```env
   NODE_ENV=production
   PORT=3001
   
   # Database (Railway provides PostgreSQL)
   DATABASE_URL=postgresql://user:pass@host:5432/db
   
   # Optional - Railway provides Redis
   REDIS_URL=redis://host:6379
   
   # JWT Secrets
   JWT_SECRET=your-secret-key-here
   JWT_REFRESH_SECRET=your-refresh-secret-here
   
   # Elasticsearch (optional - can use external service)
   ELASTICSEARCH_HOST=your-elasticsearch-host
   ELASTICSEARCH_PORT=9200
   ```

5. **Deploy**: Railway will automatically deploy on git push

### Step 2: Get Your Backend URL

After Railway deployment completes, you'll get a URL like:
```
https://your-app-name.up.railway.app
```

Your API will be available at:
```
https://your-app-name.up.railway.app/api
```

### Step 3: Update Frontend Configuration

Update the Vercel configuration with your real Railway URL:

\`\`\`json
{
  "env": {
    "VITE_API_URL": "https://YOUR-REAL-RAILWAY-URL.up.railway.app/api"
  }
}
\`\`\`

## 🌐 Frontend Deployment to Vercel

The frontend is already configured to deploy automatically to Vercel on git push with the unified build system.

## 🔄 Alternative Deployment Options

### Option A: Railway (Recommended for MVP)
- ✅ Full-stack: Backend + PostgreSQL + Redis
- ✅ Auto-deployments from Git
- ✅ Free tier available
- 💰 $5-20/month

### Option B: Render
- ✅ Free PostgreSQL tier
- ✅ Background workers for search indexing
- ✅ Auto-SSL and CDN
- 💰 Free-$25/month

### Option C: Heroku
- ✅ Add-ons for PostgreSQL, Redis, Elasticsearch
- ✅ Traditional PaaS approach
- 💰 $7-50/month

### Option D: AWS/GCP (Production Scale)
- ✅ Full container orchestration
- ✅ Managed databases and services
- ✅ Enterprise security and scaling
- 💰 $50-200/month

## 📋 Post-Deployment Checklist

- [ ] Backend deployed and responding at `/api/health`
- [ ] Database connected and migrations applied
- [ ] Frontend deployed and loading
- [ ] API endpoints working from frontend
- [ ] Search functionality operational (if Elasticsearch configured)
- [ ] Real-time features working (Socket.IO)
- [ ] SSL certificates active
- [ ] Environment variables properly set

## 🔧 Quick Commands

```bash
# Test local unified build
npm run install:all
npm run build
npm run dev

# Deploy backend to Railway
git push origin main  # Triggers automatic deployment

# Deploy frontend to Vercel  
git push origin main  # Triggers automatic deployment
```

## 🆘 Troubleshooting

**Backend not starting?**
- Check Railway logs for build errors
- Verify all environment variables are set
- Ensure PORT is set to Railway's provided port

**Frontend can't connect to API?**
- Update VITE_API_URL in vercel.json
- Check CORS settings in backend
- Verify API URL is accessible

**Database connection issues?**
- Use Railway's provided DATABASE_URL
- Check network connectivity
- Verify PostgreSQL version compatibility