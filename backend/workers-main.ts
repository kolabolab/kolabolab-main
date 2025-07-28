// Cloudflare Workers compatible entry point
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';

// Types for Cloudflare Workers environment
interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  UPLOADS: R2Bucket;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  RESEND_API_KEY: string;
  FRONTEND_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: (origin) => origin,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV || 'development'
  });
});

// OAuth Routes
app.get('/auth/google', (c) => {
  const clientId = c.env?.GOOGLE_CLIENT_ID || '361419093704-i6mig7fi7jtkhm525990u7llm02tbald.apps.googleusercontent.com';
  const redirectUri = 'http://localhost:3001/auth/google/callback';
  const scope = 'email profile';
  
  const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  
  return c.redirect(googleAuthUrl);
});

app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  const error = c.req.query('error');
  
  if (error) {
    const frontendUrl = c.env?.FRONTEND_URL || 'http://localhost:3000';
    return c.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
  
  if (!code) {
    const frontendUrl = c.env?.FRONTEND_URL || 'http://localhost:3000';
    return c.redirect(`${frontendUrl}/login?error=no_code`);
  }
  
  try {
    // Exchange code for tokens
    const clientId = c.env?.GOOGLE_CLIENT_ID || '361419093704-i6mig7fi7jtkhm525990u7llm02tbald.apps.googleusercontent.com';
    const clientSecret = c.env?.GOOGLE_CLIENT_SECRET || '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';
    const redirectUri = 'http://localhost:3001/auth/google/callback';
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });
    
    const userInfo = await userResponse.json();
    
    // For now, just redirect with user info (in production, create JWT tokens)
    const frontendUrl = c.env?.FRONTEND_URL || 'http://localhost:3000';
    const mockToken = btoa(JSON.stringify({ email: userInfo.email, name: userInfo.name }));
    
    return c.redirect(`${frontendUrl}/auth/callback?token=${mockToken}&refresh=mock_refresh_token`);
    
  } catch (error) {
    console.error('OAuth error:', error);
    const frontendUrl = c.env?.FRONTEND_URL || 'http://localhost:3000';
    return c.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});

// Auth routes
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, firstName, lastName } = await c.req.json();
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      throw new HTTPException(400, { message: 'Missing required fields' });
    }
    
    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      throw new HTTPException(409, { message: 'User already exists' });
    }
    
    // Hash password (simple implementation for demo)
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const userId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO users (id, email, password, firstName, lastName, isVerified, createdAt)
      VALUES (?, ?, ?, ?, ?, false, datetime('now'))
    `).bind(userId, email, hashedPassword, firstName, lastName).run();
    
    // Send verification email (simplified)
    await sendVerificationEmail(c.env.RESEND_API_KEY, email, firstName);
    
    return c.json({ 
      message: 'User registered successfully. Please check your email for verification.',
      userId 
    });
    
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Registration error:', error);
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      throw new HTTPException(400, { message: 'Email and password required' });
    }
    
    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT id, email, password, firstName, lastName, isVerified FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (!user) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password as string);
    if (!isValidPassword) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }
    
    if (!user.isVerified) {
      throw new HTTPException(401, { message: 'Please verify your email first' });
    }
    
    // Generate JWT tokens
    const accessToken = await generateJWT({
      userId: user.id,
      email: user.email
    }, c.env.JWT_SECRET, '7d');
    
    const refreshToken = await generateJWT({
      userId: user.id,
      type: 'refresh'
    }, c.env.JWT_REFRESH_SECRET, '30d');
    
    // Store refresh token in KV
    await c.env.CACHE.put(`refresh_token:${user.id}`, refreshToken, {
      expirationTtl: 30 * 24 * 60 * 60 // 30 days
    });
    
    return c.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Login error:', error);
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Protected route example
app.get('/api/user/profile', jwt({ secret: async (c) => c.env.JWT_SECRET }), async (c) => {
  const payload = c.get('jwtPayload');
  
  const user = await c.env.DB.prepare(
    'SELECT id, email, firstName, lastName, avatar, bio FROM users WHERE id = ?'
  ).bind(payload.userId).first();
  
  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }
  
  return c.json({ user });
});

// Utility functions
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

async function generateJWT(payload: any, secret: string, expiresIn: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (expiresIn === '7d' ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60);
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const jwtPayload = { ...payload, iat: now, exp };
  
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(jwtPayload));
  
  const message = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${message}.${signatureB64}`;
}

async function sendVerificationEmail(apiKey: string, email: string, firstName: string): Promise<void> {
  const verificationCode = Math.random().toString(36).substring(2, 15);
  
  // Store verification code in KV (expires in 1 hour)
  // await c.env.CACHE.put(`verify:${email}`, verificationCode, { expirationTtl: 3600 });
  
  // Send email via Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@kolabolab.com',
      to: email,
      subject: 'Verify your KolaboLab account',
      html: `
        <h2>Welcome to KolaboLab, ${firstName}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="https://staging.kolabolab.com/verify?code=${verificationCode}&email=${email}">
          Verify Email Address
        </a>
        <p>This link will expire in 1 hour.</p>
      `
    })
  });
  
  if (!response.ok) {
    console.error('Failed to send verification email:', await response.text());
  }
}

// Manual user verification (for testing)
app.post('/api/auth/verify-manual', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      throw new HTTPException(400, { message: 'Email required' });
    }
    
    // Update user to verified
    const result = await c.env.DB.prepare(
      'UPDATE users SET isVerified = 1 WHERE email = ?'
    ).bind(email).run();
    
    if (result.changes === 0) {
      throw new HTTPException(404, { message: 'User not found' });
    }
    
    return c.json({ 
      message: 'User verified successfully',
      email: email
    });
    
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Manual verification error:', error);
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Database initialization
app.get('/api/init-db', async (c) => {
  try {
    // Create users table with D1-compatible syntax
    const result = await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        avatar TEXT,
        bio TEXT,
        isVerified INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      )
    `).run();
    
    return c.json({ 
      message: 'Database initialized successfully',
      result: result.success 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return c.json({ 
      error: 'Failed to initialize database',
      details: error.message 
    }, 500);
  }
});

export default app;