# Authentication Testing Guide

## Prerequisites
✅ Backend running on http://localhost:3001/api
✅ Database connected (PostgreSQL)
✅ Frontend ready to start on http://localhost:3000

## Current Status
**Backend Health Check:**
```json
{
  "status": "ok",
  "database": {"connected": true},
  "services": {"api": "ok", "auth": "ok"}
}
```

## Test Plan

### Test 1: User Registration Flow
**Objective:** Verify new user can register successfully

**Steps:**
1. Navigate to http://localhost:3000/register
2. Fill in registration form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `Test123!@`
   - Confirm Password: `Test123!@`
   - ✅ Agree to Terms

**Expected Results:**
- ✅ Form validates correctly
- ✅ API call to `POST /api/auth/register`
- ✅ Success message appears
- ✅ Redirect to verification page
- ✅ No console errors

**API Test (via curl):**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@",
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

---

### Test 2: User Login Flow
**Objective:** Verify registered user can login successfully

**Steps:**
1. Navigate to http://localhost:3000/login
2. Fill in login form:
   - Email: `test@example.com`
   - Password: `Test123!@`
3. Click "Sign In"

**Expected Results:**
- ✅ Form validates correctly
- ✅ API call to `POST /api/auth/login`
- ✅ Receives JWT tokens (access & refresh)
- ✅ User data stored in Zustand
- ✅ Redirect to /dashboard
- ✅ No console errors
- ✅ Navbar shows user profile

**API Test (via curl):**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "roles": ["entrepreneur"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Test 3: Protected Routes
**Objective:** Verify authentication guards work correctly

**Test 3a: Access Protected Route While Logged Out**
1. Clear browser storage (logout if needed)
2. Try to access http://localhost:3000/dashboard
3. **Expected:** Redirect to /login

**Test 3b: Access Protected Route While Logged In**
1. Login with valid credentials
2. Access http://localhost:3000/dashboard
3. **Expected:** Dashboard loads successfully

**Test 3c: Access Profile**
1. While logged in, click on user avatar in navbar
2. Click "My Profile"
3. **Expected:** Profile page loads with user data

---

### Test 4: Token Persistence
**Objective:** Verify tokens persist across page refreshes

**Steps:**
1. Login successfully
2. Note you're on /dashboard
3. Refresh the page (F5 or Cmd+R)
4. **Expected:** 
   - Still logged in
   - Still on /dashboard
   - User info still visible in navbar

---

### Test 5: Logout Flow
**Objective:** Verify user can logout successfully

**Steps:**
1. While logged in, click user avatar in navbar
2. Click "Logout"

**Expected Results:**
- ✅ Zustand store cleared
- ✅ Tokens removed from storage
- ✅ Redirect to home page (/)
- ✅ Navbar shows "Sign In" and "Sign Up" buttons
- ✅ Cannot access protected routes

---

### Test 6: Error Handling
**Objective:** Verify proper error messages

**Test 6a: Invalid Email Format**
1. Go to /register
2. Enter invalid email: `notanemail`
3. **Expected:** Validation error before API call

**Test 6b: Password Mismatch**
1. Go to /register
2. Enter different passwords
3. **Expected:** "Passwords do not match" error

**Test 6c: Duplicate Email**
1. Try to register with existing email
2. **Expected:** "Email already exists" error from API

**Test 6d: Wrong Password**
1. Go to /login
2. Enter correct email but wrong password
3. **Expected:** "Invalid email or password" error

**Test 6e: Non-existent User**
1. Go to /login
2. Enter email that doesn't exist
3. **Expected:** "Invalid email or password" error

---

### Test 7: API Configuration
**Objective:** Verify all API calls use correct endpoints

**Check in Browser DevTools (Network Tab):**
1. All auth API calls should go to: `http://localhost:3001/api/auth/*`
2. No hardcoded URLs visible in requests
3. Proper headers included (Content-Type, Authorization)

**Expected Endpoints:**
- ✅ POST `/api/auth/register`
- ✅ POST `/api/auth/login`
- ✅ POST `/api/auth/logout`
- ✅ GET `/api/auth/profile`

---

### Test 8: Token Refresh (Advanced)
**Objective:** Verify token refresh works when access token expires

**Note:** This requires waiting for token expiration or manually testing with expired token

**Expected Behavior:**
- When access token expires, interceptor catches 401
- Automatically calls `/api/auth/refresh` with refresh token
- Gets new access token
- Retries original request
- User remains logged in

---

## Manual Testing Checklist

### Registration Page
- [ ] Form fields validate correctly
- [ ] Password strength indicator works
- [ ] Terms checkbox is required
- [ ] Submit button disabled until form is valid
- [ ] Loading state shows during submission
- [ ] Success message appears after registration
- [ ] Redirects to verification page
- [ ] Error messages display properly

### Login Page
- [ ] Form fields validate correctly
- [ ] Password visibility toggle works
- [ ] "Forgot Password" link visible
- [ ] Submit button disabled until form is valid
- [ ] Loading state shows during submission
- [ ] Success toast appears after login
- [ ] Redirects to dashboard after login
- [ ] Error messages display properly
- [ ] OAuth buttons visible (Google, LinkedIn, GitHub)

### Dashboard (Protected Route)
- [ ] Cannot access when logged out
- [ ] Loads successfully when logged in
- [ ] User data displays correctly
- [ ] All features accessible

### Navbar
- [ ] Shows "Sign In" and "Sign Up" when logged out
- [ ] Shows user avatar and menu when logged in
- [ ] User name displays correctly
- [ ] Profile menu works
- [ ] Logout button works

---

## Automated API Tests

You can run these curl commands to test the API directly:

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Register New User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "automated@test.com",
    "password": "AutoTest123!@",
    "firstName": "Auto",
    "lastName": "Test",
    "username": "autotest"
  }' | jq
```

### 3. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "automated@test.com",
    "password": "AutoTest123!@"
  }' | jq
```

### 4. Get Profile (with token)
```bash
# Save token from login response
TOKEN="your_access_token_here"

curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Common Issues and Solutions

### Issue 1: "Cannot connect to API"
**Solution:** 
- Check backend is running: `ps aux | grep nest`
- Check port 3001: `lsof -i:3001`
- Verify .env file exists in backend/

### Issue 2: "Database connection failed"
**Solution:**
- Check PostgreSQL is running: `docker-compose ps`
- Verify database credentials in backend/.env
- Check database exists: `docker-compose exec postgres psql -U kolabolab -d kolabolab`

### Issue 3: "Tokens not persisting"
**Solution:**
- Check browser localStorage (DevTools > Application > Local Storage)
- Verify Zustand store is configured with `persist`
- Check for console errors

### Issue 4: "CORS errors"
**Solution:**
- Verify FRONTEND_URL in backend/.env matches frontend URL
- Check CORS configuration in backend/src/main.ts
- Clear browser cache

### Issue 5: "OAuth not working"
**Solution:**
- OAuth requires provider configuration (Google, LinkedIn, GitHub)
- Set up OAuth credentials in respective developer consoles
- Update backend/.env with client IDs and secrets

---

## Success Criteria

Before merging to main, ALL of these must pass:

- [x] ✅ Backend health check passes
- [ ] ✅ Can register new user
- [ ] ✅ Can login with registered user
- [ ] ✅ Tokens persist across page refresh
- [ ] ✅ Protected routes redirect when not logged in
- [ ] ✅ Protected routes accessible when logged in
- [ ] ✅ Can logout successfully
- [ ] ✅ Error messages display correctly
- [ ] ✅ No console errors during normal flow
- [ ] ✅ UI alignment is perfect
- [ ] ✅ All buttons and forms work correctly

---

## Next Steps After Testing

1. Document any issues found
2. Fix any bugs discovered
3. Re-test after fixes
4. When all tests pass, merge to main
5. Deploy to production
