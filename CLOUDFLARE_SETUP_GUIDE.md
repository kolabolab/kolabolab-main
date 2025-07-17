# ☁️ Cloudflare API Setup Guide

## 🎯 **Getting Your Cloudflare Credentials**

### **Step 1: Get Your Account ID**

#### **Method 1: From Dashboard (Easiest)**
1. **Go to** [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Login** to your Cloudflare account
3. **Select any domain** (or go to overview)
4. **Look at the right sidebar** → You'll see **"Account ID"**
5. **Copy the Account ID** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

#### **Method 2: From URL**
- When you're in your dashboard, the URL shows: `https://dash.cloudflare.com/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- The long string after `/` is your Account ID

---

### **Step 2: Create API Token**

#### **🔐 Go to API Tokens Page:**
1. **Go to** [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. **Click** "Create Token"

#### **🛠️ Token Configuration:**
**Option A: Use Custom Token (Recommended)**
1. **Click** "Custom token" → "Get started"
2. **Token name**: `KolaboLab-CI-CD`
3. **Permissions**:
   - `Zone:Zone:Read`
   - `Zone:DNS:Edit` 
   - `Account:Cloudflare Pages:Edit`
   - `Account:Account Settings:Read`
   - `User:User Details:Read`

4. **Account Resources**: 
   - Include: `All accounts` (or select your specific account)

5. **Zone Resources**:
   - Include: `All zones` (or select your specific domain)

6. **Client IP Address Filtering**: Leave blank (allows GitHub Actions)

7. **TTL**: Leave default or set to never expire

8. **Click** "Continue to summary" → "Create Token"

**Option B: Use Template (Easier)**
1. **Find** "Custom token" template
2. **Or use** "Edit Cloudflare Workers" template
3. **Modify permissions** as needed

#### **🔑 Save Your Token:**
- **Copy the token immediately** (starts with `ghp_` or similar)
- **Store it safely** - you won't see it again!

---

### **Step 3: Add to GitHub Secrets**

#### **🔧 GitHub Repository Setup:**
1. **Go to** your GitHub repository: `github.com/ztevens/kolabolab-main`
2. **Click** "Settings" (top menu)
3. **Click** "Secrets and variables" → "Actions" (left sidebar)
4. **Click** "New repository secret"

#### **🔐 Add Secrets:**

**Secret 1: CLOUDFLARE_API_TOKEN**
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: `your_api_token_here` (paste the token you copied)
- **Click** "Add secret"

**Secret 2: CLOUDFLARE_ACCOUNT_ID**
- **Name**: `CLOUDFLARE_ACCOUNT_ID`  
- **Value**: `your_account_id_here` (paste the account ID)
- **Click** "Add secret"

---

### **Step 4: Verify Setup**

#### **🧪 Test Your Credentials:**
```bash
# You can test locally with curl (optional)
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json"

# Should return: {"result":{"id":"...","status":"active"},"success":true}
```

#### **📊 Check GitHub Actions:**
1. **Go to** "Actions" tab in your GitHub repo
2. **Re-run** any failed workflows
3. **Check** if deployment workflows now pass

---

## 🎯 **What These Enable:**

### **✅ With API Token:**
- **Cloudflare Pages** deployment (frontend)
- **Cloudflare Workers** deployment (backend)  
- **DNS management** (if needed)
- **SSL certificate** management
- **CDN configuration**

### **✅ With Account ID:**
- **Account-level operations**
- **Resource identification**
- **Billing and usage** access
- **Team management** (if applicable)

---

## 🚀 **Expected Results:**

### **After Adding Secrets:**
- ✅ **staging-deploy.yml** should pass
- ✅ **production-deploy.yml** should pass
- ✅ **Frontend** can deploy to Cloudflare Pages
- ✅ **Backend** can deploy to Cloudflare Workers
- ✅ **Automated deployments** fully functional

### **Workflow Status:**
- **Before**: ❌ Deployment workflows failing
- **After**: ✅ All workflows passing (or most of them)

---

## 🔧 **Troubleshooting:**

### **If Token Doesn't Work:**
1. **Check permissions** - Ensure all required permissions are granted
2. **Check scope** - Ensure it includes your account/zones
3. **Check expiration** - Ensure token hasn't expired
4. **Regenerate** - Create a new token if needed

### **If Account ID Doesn't Work:**
1. **Double-check** the ID from dashboard
2. **Ensure** you're using the right account (if multiple)
3. **Copy carefully** - No extra spaces or characters

### **Common Issues:**
- **Wrong permissions** - Token lacks required access
- **Expired token** - Need to regenerate
- **Wrong account** - Using different account than expected
- **Typos** - Incorrect copy/paste

---

## 📋 **Quick Checklist:**

- [ ] ✅ Found Account ID in Cloudflare dashboard
- [ ] ✅ Created API token with correct permissions
- [ ] ✅ Added `CLOUDFLARE_API_TOKEN` to GitHub secrets
- [ ] ✅ Added `CLOUDFLARE_ACCOUNT_ID` to GitHub secrets
- [ ] ✅ Re-ran failed GitHub Actions workflows
- [ ] ✅ Verified deployment workflows are passing

---

## 🎉 **Once Complete:**

Your KolaboLab platform will have:
- 🚀 **Automated deployments** to Cloudflare
- 🌐 **Global CDN** for fast loading
- 🔒 **SSL certificates** automatically managed
- ⚡ **Edge computing** with Workers
- 📊 **Analytics** and monitoring
- 💰 **Cost-effective** hosting (generous free tier)

**Ready to set this up? Let me know if you need help with any step!** 🌟