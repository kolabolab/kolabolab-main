# 🔧 Post-Merge Workflow Fixes

## 🎉 **Congratulations! Pipeline is Now Active!**

All 15 workflow files are now on main branch. Let's systematically fix the failing ones.

## 🔍 **Common Failure Patterns & Quick Fixes:**

### **1. Missing Dependencies (Most Common)**

#### **Frontend Dependencies:**
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @playwright/test
npm install --save-dev eslint @typescript-eslint/eslint-plugin
```

#### **Backend Dependencies:**
```bash
cd backend  
npm install --save-dev jest @types/jest
npm install --save-dev supertest @types/supertest
npm install --save-dev eslint @typescript-eslint/eslint-plugin
```

### **2. Missing Scripts in package.json**

#### **Add to frontend/package.json:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test --grep accessibility",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix"
  }
}
```

#### **Add to backend/package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  }
}
```

### **3. Missing Configuration Files**

#### **Create .eslintrc.js files if missing:**
```bash
# Frontend ESLint config
cat > frontend/.eslintrc.js << 'EOF'
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  rules: {}
}
EOF

# Backend ESLint config  
cat > backend/.eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  root: true,
  env: { node: true, jest: true },
  rules: {}
}
EOF
```

### **4. Optional Secrets for Advanced Features**

Add these to GitHub Secrets for enhanced functionality:
- `CODECOV_TOKEN` - Code coverage reporting
- `SEMGREP_APP_TOKEN` - Advanced security scanning  
- `SLACK_WEBHOOK_URL` - Notifications
- `LHCI_GITHUB_APP_TOKEN` - Lighthouse CI

## 🚀 **Quick Fix Script:**

```bash
# Run this to fix most common issues
cd kolabolab-main

# 1. Add missing dependencies
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @playwright/test
cd ../backend
npm install --save-dev jest @types/jest supertest @types/supertest

# 2. Create basic ESLint configs (if missing)
if [ ! -f "frontend/.eslintrc.js" ]; then
  echo 'module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: ["eslint:recommended", "@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    rules: {}
  }' > frontend/.eslintrc.js
fi

if [ ! -f "backend/.eslintrc.js" ]; then
  echo 'module.exports = {
    parser: "@typescript-eslint/parser", 
    extends: ["eslint:recommended", "@typescript-eslint/recommended"],
    env: { node: true, jest: true },
    rules: {}
  }' > backend/.eslintrc.js
fi

# 3. Commit fixes
git add .
git commit -m "fix: Add missing dependencies and configurations for workflows"
git push origin main
```

## 📊 **Expected Results After Fixes:**

### **Should Pass:**
- ✅ CI Pipeline
- ✅ Basic Security Scan
- ✅ PR Checks  
- ✅ Build Processes
- ✅ Code Quality Checks

### **May Still Need Tweaks:**
- ⚠️ Advanced security scans (optional tokens)
- ⚠️ Performance tests (configuration)
- ⚠️ Complex integrations (setup required)

## 🎯 **Systematic Approach:**

1. **Fix one workflow at a time**
2. **Start with most critical (CI, Security)**
3. **Add optional features gradually**
4. **Monitor improvements after each fix**

## 📋 **What I Need From You:**

1. **List of failing workflow names**
2. **Specific error messages from logs**
3. **Priority order (which to fix first)**

Let's turn those ❌ into ✅ one by one! 🌟