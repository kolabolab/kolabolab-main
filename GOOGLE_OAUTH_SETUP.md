# 🔐 Google OAuth Setup Guide for KolaboLab

## Step-by-Step Google Cloud Console Configuration

### 1. **Access Google Cloud Console**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Sign in with your Google account

### 2. **Create or Select a Project**
```bash
# Option A: Create New Project
1. Click "Select a project" dropdown (top left)
2. Click "NEW PROJECT"
3. Project name: "KolaboLab" or "kolabolab-oauth"
4. Click "CREATE"

# Option B: Use Existing Project
1. Select your existing project from dropdown
```

### 3. **Enable Google+ API (Required for OAuth)**
```bash
1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Google+ API" 
3. Click on "Google+ API"
4. Click "ENABLE"

# Alternative: Enable People API (newer)
1. Search for "People API"
2. Click "ENABLE"
```

### 4. **Configure OAuth Consent Screen**
```bash
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (for public app) or "Internal" (for organization)
3. Click "CREATE"

# Fill out required fields:
App name: "KolaboLab"
User support email: your-email@domain.com
Developer contact: your-email@domain.com

# Optional but recommended:
App logo: Upload your KolaboLab logo
App domain: https://your-domain.com
Privacy policy: https://your-domain.com/privacy
Terms of service: https://your-domain.com/terms

4. Click "SAVE AND CONTINUE"
5. Add scopes (click "ADD OR REMOVE SCOPES"):
   - email
   - profile
   - openid
6. Click "SAVE AND CONTINUE"
7. Review and click "BACK TO DASHBOARD"
```

### 5. **Create OAuth 2.0 Credentials**
```bash
1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS"
3. Select "OAuth 2.0 Client IDs"

# Configure OAuth Client:
Application type: "Web application"
Name: "KolaboLab Web Client"

# Authorized JavaScript origins:
http://localhost:3000          # Development frontend
http://localhost:3001          # Development backend
https://your-domain.com        # Production frontend
https://api.your-domain.com    # Production backend

# Authorized redirect URIs:
http://localhost:3001/auth/google/callback    # Development
https://api.your-domain.com/auth/google/callback  # Production

4. Click "CREATE"
```

### 6. **Copy Your Credentials**
```bash
# You'll see a popup with:
Client ID: 1234567890-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: GOCSPX-abcdefghijklmnopqrstuvwxyz

# IMPORTANT: Copy these immediately!
```

## 🔧 Environment Configuration

### Development Setup (.env files)

#### Backend (.env)
```bash
# Create: kolabolab-main/backend/.env
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
FRONTEND_URL=http://localhost:3000

# Other required variables
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
DATABASE_URL=postgresql://user:password@localhost:5432/kolabolab
```

#### Frontend (.env)
```bash
# Create: kolabolab-main/frontend/.env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
```

### Production Setup (Cloudflare)

#### Set Cloudflare Secrets
```bash
cd kolabolab-main

# Set production secrets
wrangler secret put GOOGLE_CLIENT_ID
# Enter: 1234567890-abcdefghijklmnop.apps.googleusercontent.com

wrangler secret put GOOGLE_CLIENT_SECRET  
# Enter: GOCSPX-abcdefghijklmnopqrstuvwxyz

wrangler secret put FRONTEND_URL
# Enter: https://your-production-domain.com

# Update wrangler.toml
```

#### Update wrangler.toml
```toml
# Add to kolabolab-main/wrangler.toml
[env.production.vars]
GOOGLE_CALLBACK_URL = "https://your-api-domain.com/auth/google/callback"
FRONTEND_URL = "https://your-frontend-domain.com"
```

## 🧪 Testing OAuth Integration

### 1. **Start Development Servers**
```bash
# Terminal 1: Backend
cd kolabolab-main/backend
npm run start:dev

# Terminal 2: Frontend  
cd kolabolab-main/frontend
npm run dev
```

### 2. **Test OAuth Flow**
```bash
1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Should redirect to Google OAuth
4. After Google auth, should return to your app
5. User should be logged in automatically
```

### 3. **Verify in Browser Network Tab**
```bash
# Check these requests succeed:
1. GET /auth/google (redirects to Google)
2. GET /auth/google/callback (returns with tokens)
3. GET /auth/callback?token=... (frontend processes)
4. User lands on /dashboard (authenticated)
```

## 🚨 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"
```bash
# Problem: Redirect URI not authorized
# Solution: Add exact URI to Google Console:
http://localhost:3001/auth/google/callback
```

### Issue 2: "invalid_client"
```bash
# Problem: Wrong Client ID/Secret
# Solution: Double-check credentials in .env files
```

### Issue 3: "access_denied"
```bash
# Problem: OAuth consent screen not configured
# Solution: Complete OAuth consent screen setup
```

### Issue 4: CORS Errors
```bash
# Problem: Frontend can't reach backend
# Solution: Check VITE_API_URL in frontend .env
```

## 🔒 Security Best Practices

### 1. **Environment Variables**
```bash
# Never commit these to git:
.env
.env.local
.env.production

# Add to .gitignore:
echo ".env*" >> .gitignore
```

### 2. **Production Domains**
```bash
# Only add your actual domains to Google Console
# Remove localhost URIs from production OAuth client
```

### 3. **Scope Limitations**
```bash
# Only request necessary scopes:
- email (required)
- profile (for name/avatar)
# Avoid requesting unnecessary permissions
```

## 📋 Checklist

- [ ] Google Cloud project created
- [ ] Google+ API or People API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Authorized redirect URIs added
- [ ] Backend .env file configured
- [ ] Frontend .env file configured
- [ ] Cloudflare secrets set (for production)
- [ ] OAuth flow tested locally
- [ ] Production domains configured

## 🎯 Next Steps

After completing this setup:
1. Test OAuth locally
2. Deploy to production
3. Test OAuth in production
4. Add LinkedIn/GitHub OAuth (optional)
5. Monitor OAuth usage in Google Console

---

**Need help?** Check the troubleshooting section or ask for assistance with specific error messages!