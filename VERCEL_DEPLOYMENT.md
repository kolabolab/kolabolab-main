# Dual Vercel Deployment Guide

## 🚀 Two Separate Vercel Deployments

### 📋 Overview
- **Frontend**: `kolabolab-frontend.vercel.app`
- **Backend API**: `kolabolab-backend.vercel.app`

This setup provides better scalability, independent scaling, and cleaner separation of concerns.

## 🔧 Backend API Deployment

### Step 1: Deploy Backend to Vercel

1. **Create New Vercel Project**:
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Deploy to Vercel
   vercel --prod
   ```

2. **Or via Vercel Dashboard**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - "New Project" → Import from GitHub
   - Select this repository
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - Deploy

3. **Environment Variables** (Add in Vercel Dashboard):
   ```env
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   JWT_REFRESH_SECRET=your-refresh-secret-here
   
   # Database (use external service)
   DATABASE_URL=postgresql://user:pass@host:5432/db
   
   # Optional services
   REDIS_URL=redis://host:6379
   ELASTICSEARCH_HOST=your-es-host
   ```

### Step 2: Test Backend Deployment

```bash
# Test health endpoint
curl https://kolabolab-backend.vercel.app/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "api": "ok",
    "auth": "ok"
  }
}
```

## 🎨 Frontend Deployment

### Step 1: Deploy Frontend to Vercel

1. **Create New Vercel Project**:
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Deploy to Vercel
   vercel --prod
   ```

2. **Or via Vercel Dashboard**:
   - "New Project" → Import from GitHub
   - Select this repository
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - Deploy

3. **Environment Variables** (Add in Vercel Dashboard):
   ```env
   NODE_ENV=production
   VITE_API_URL=https://kolabolab-backend.vercel.app/api
   VITE_WS_URL=wss://kolabolab-backend.vercel.app
   ```

### Step 2: Update API URLs

The frontend is pre-configured to connect to:
```
https://kolabolab-backend.vercel.app/api
```

If your backend has a different URL, update the environment variables.

## 🔗 Connection Configuration

### Backend CORS Setup
The backend is configured to accept requests from:
- `https://kolabolab.vercel.app`
- `https://kolabolab-frontend.vercel.app`
- All `*.vercel.app` subdomains

### Frontend API Client
The frontend automatically connects to the backend using:
```typescript
// Environment variables
VITE_API_URL=https://kolabolab-backend.vercel.app/api
VITE_WS_URL=wss://kolabolab-backend.vercel.app
```

## 📊 Deployment URLs

After deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://kolabolab-frontend.vercel.app` | Main application |
| **Backend API** | `https://kolabolab-backend.vercel.app/api` | REST API endpoints |
| **API Docs** | `https://kolabolab-backend.vercel.app/api/docs` | Swagger documentation |
| **Health Check** | `https://kolabolab-backend.vercel.app/api/health` | API status |

## 🛠️ Development Workflow

### Local Development
```bash
# Root directory - runs both frontend and backend
npm run dev

# Frontend only
cd frontend && npm run dev

# Backend only  
cd backend && npm run start:dev
```

### Deploy Both Services
```bash
# Deploy backend
cd backend && vercel --prod

# Deploy frontend  
cd frontend && vercel --prod
```

## 🔍 Testing Full Stack

### 1. Test Backend API
```bash
curl https://kolabolab-backend.vercel.app/api/health
```

### 2. Test Frontend
Visit: `https://kolabolab-frontend.vercel.app`

### 3. Test Integration
- Frontend should load without CORS errors
- API calls should work from frontend
- Real-time features should connect

## 🚨 Troubleshooting

### Backend Issues
- **Cold starts**: First request may be slow (Vercel serverless)
- **Database**: Use external PostgreSQL service (Neon, PlanetScale)
- **File uploads**: Use external storage (AWS S3, Cloudinary)

### Frontend Issues
- **API connection**: Check VITE_API_URL environment variable
- **CORS errors**: Verify backend CORS configuration
- **Build errors**: Check all dependencies are installed

### Common Fixes
```bash
# Rebuild and redeploy backend
cd backend && vercel --prod --force

# Rebuild and redeploy frontend  
cd frontend && vercel --prod --force
```

## 📈 Benefits of Dual Deployment

✅ **Independent Scaling**: Scale frontend and backend separately
✅ **Better Performance**: Optimized for each service type
✅ **Easier Debugging**: Isolated deployments and logs
✅ **Flexible Updates**: Deploy frontend/backend independently
✅ **Cost Optimization**: Pay only for what you use

## 🔄 Alternative: Single Vercel Deployment

If you prefer a single deployment, use the root `vercel.json` which builds both services together.

## 📋 Post-Deployment Checklist

- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads successfully
- [ ] API calls work from frontend to backend
- [ ] No CORS errors in browser console
- [ ] Environment variables properly set
- [ ] SSL certificates active for both deployments
- [ ] Real-time features working (if applicable)

Your KolaboLab platform is now ready for production with dual Vercel deployments!