// Native Cloudflare Workers handler without Hono

// JWT utility functions
async function createJWT(payload: any, secret: string, expiresIn: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  let exp: number;
  
  // Parse expiresIn (simple implementation for common cases)
  if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn.slice(0, -1));
    exp = now + (hours * 60 * 60);
  } else if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.slice(0, -1));
    exp = now + (days * 24 * 60 * 60);
  } else {
    exp = now + 3600; // Default 1 hour
  }
  
  const jwtPayload = {
    ...payload,
    iat: now,
    exp
  };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${data}.${encodedSignature}`;
}

// JWT verification function
async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;
    
    // Verify signature
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    // Decode the signature from base64url
    const sigStr = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const sigPadded = sigStr + '='.repeat((4 - sigStr.length % 4) % 4);
    const sigBytes = Uint8Array.from(atob(sigPadded), c => c.charCodeAt(0));
    
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return null;
    
    // Decode payload
    const payloadStr = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPadded = payloadStr + '='.repeat((4 - payloadStr.length % 4) % 4);
    const payload = JSON.parse(atob(payloadPadded));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

// Cloudflare Workers type definitions
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: any;
  error?: string;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

interface KVNamespace {
  get(key: string, options?: { type?: "text" | "json" | "arrayBuffer" | "stream" }): Promise<any>;
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: any): Promise<any>;
}

interface R2Bucket {
  get(key: string, options?: any): Promise<R2Object | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null, options?: any): Promise<R2Object>;
  delete(key: string | string[]): Promise<void>;
  list(options?: any): Promise<R2Objects>;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  body?: ReadableStream;
  bodyUsed?: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = any>(): Promise<T>;
  blob(): Promise<Blob>;
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
}

interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  UPLOADS: R2Bucket;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  RESEND_API_KEY: string;
  FRONTEND_URL: string;
  NODE_ENV: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
  LINKEDIN_CALLBACK_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_CALLBACK_URL: string;
}

// Admin authorization helper
interface AdminAuthResult {
  authorized: boolean;
  userId?: string;
  response?: Response;
}

async function requireAdmin(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<AdminAuthResult> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    };
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || !payload.userId) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    };
  }

  const userId = payload.userId;
  const user = await env.DB.prepare(
    'SELECT roles FROM users WHERE id = ?'
  ).bind(userId).first() as { roles: string | null } | null;

  if (!user) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    };
  }

  let roles: string[] = [];
  try {
    roles = user.roles ? JSON.parse(user.roles) : [];
  } catch {
    roles = [];
  }

  if (!roles.includes('admin')) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    };
  }

  return { authorized: true, userId };
}

// Send verification email via Resend API
async function sendVerificationEmail(env: any, email: string, firstName: string, verificationToken: string): Promise<void> {
  try {
    if (!env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return;
    }
    const frontendUrl = env.FRONTEND_URL || 'https://main.kolabolab-dev.pages.dev';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KolaboLab <noreply@kolabolab.com>',
        to: [email],
        subject: 'Verify your email - KolaboLab',
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B2A4A;">Welcome to KolaboLab, ${firstName}!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background: #00BFFF; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email</a>
          <p style="margin-top: 20px; color: #666;">Or copy this link: ${verificationUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't create an account on KolaboLab, you can ignore this email.</p>
        </div>`
      }),
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Non-blocking - don't fail the parent operation
  }
}

// Email verification guard helper
async function requireEmailVerified(userId: string, env: any, corsHeaders: Record<string, string>): Promise<{ verified: boolean; response?: Response }> {
  const user = await env.DB.prepare('SELECT emailVerified FROM users WHERE id = ?').bind(userId).first() as { emailVerified: number } | null;
  if (!user || user.emailVerified !== 1) {
    return { verified: false, response: new Response(JSON.stringify({ error: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }) };
  }
  return { verified: true };
}

// Password hashing utility functions
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${salt}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === hash;
}

// Non-blocking notification creation helper
async function createNotification(db: any, params: { recipientId: string; type: string; referenceId: string; title: string; message: string }): Promise<void> {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await db.prepare(
      `INSERT INTO notifications (id, recipientId, type, referenceId, title, message, isRead, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
    ).bind(id, params.recipientId, params.type, params.referenceId, params.title, params.message, now, now).run();
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

// Connection validation helper for messaging
// Checks if two users have a connection that permits messaging.
// A connection exists if:
// 1. User A applied to User B's startup and the application status is "accepted"
// 2. User B applied to User A's startup and the application status is "accepted"
// 3. Both users have accepted applications to the same startup
// 4. User A is the creator of a startup where User B has an accepted application
// 5. User B is the creator of a startup where User A has an accepted application
async function checkConnection(db: any, userA: string, userB: string): Promise<boolean> {
  try {
    const result = await db.prepare(`
      SELECT COUNT(*) as connectionCount FROM (
        SELECT 1 FROM applications a
        JOIN startups s ON a.startupId = s.id
        WHERE (a.applicantId = ? AND s.user_id = ? AND a.status = 'accepted')
           OR (a.applicantId = ? AND s.user_id = ? AND a.status = 'accepted')
        UNION
        SELECT 1 FROM applications a1
        JOIN applications a2 ON a1.startupId = a2.startupId
        WHERE a1.applicantId = ? AND a2.applicantId = ?
          AND a1.status = 'accepted' AND a2.status = 'accepted'
      )
    `).bind(userA, userB, userB, userA, userA, userB).first() as { connectionCount: number } | null;
    return (result?.connectionCount ?? 0) > 0;
  } catch (error) {
    console.error('Connection check error:', error);
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Health endpoints
      if (path === '/health' || path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: env.NODE_ENV || 'development'
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Root endpoint
      if (path === '/') {
        return new Response(JSON.stringify({
          message: 'KolaboLab API is running',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Login endpoint
      if (path === '/auth/login' && request.method === 'POST') {
        const body = await request.json() as { email: string; password: string };
        
        if (!body.email || !body.password) {
          return new Response(JSON.stringify({ error: 'Email and password are required' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        try {
          // Look up user in D1 database
          const dbUser = await env.DB.prepare(
            'SELECT id, email, password, firstName, lastName, roles, onboarding_completed, emailVerified FROM users WHERE email = ?'
          ).bind(body.email).first() as any;

          if (!dbUser || !dbUser.password) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Verify password
          const passwordValid = await verifyPassword(body.password, dbUser.password);
          if (!passwordValid) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const userRoles = dbUser.roles ? (typeof dbUser.roles === 'string' ? JSON.parse(dbUser.roles) : dbUser.roles) : [];
          const accessToken = await createJWT({
            userId: dbUser.id, email: dbUser.email, type: 'access', roles: userRoles, onboardingCompleted: dbUser.onboarding_completed === 1
          }, env.JWT_SECRET || 'fallback-secret', '7d');

          const refreshToken = await createJWT({
            userId: dbUser.id, email: dbUser.email, type: 'refresh', roles: userRoles
          }, env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', '7d');

          return new Response(JSON.stringify({
            message: 'Login successful',
            user: {
              id: dbUser.id,
              email: dbUser.email,
              firstName: dbUser.firstName,
              lastName: dbUser.lastName,
              roles: userRoles,
              onboardingCompleted: dbUser.onboarding_completed === 1,
              isEmailVerified: dbUser.emailVerified === 1
            },
            tokens: { accessToken, refreshToken }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Login error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Register endpoint
      if (path === '/auth/register' && request.method === 'POST') {
        const body = await request.json() as { 
          email: string; 
          password: string; 
          firstName: string; 
          lastName: string; 
        };
        
        if (!body.email || !body.password || !body.firstName || !body.lastName) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        try {
          // Check if user already exists
          const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
          if (existingUser) {
            return new Response(JSON.stringify({ error: 'A user with this email already exists', code: 'EMAIL_EXISTS' }), {
              status: 409,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const userId = crypto.randomUUID();
          const hashedPassword = await hashPassword(body.password);
          const verificationToken = crypto.randomUUID();

          await env.DB.prepare(`
            INSERT INTO users (id, email, password, firstName, lastName, emailVerified, verificationToken, roles, onboarding_completed, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, 0, ?, '[]', 0, datetime('now'), datetime('now'))
          `).bind(userId, body.email, hashedPassword, body.firstName, body.lastName, verificationToken).run();

          const accessToken = await createJWT({
            userId, email: body.email, type: 'access', roles: [], onboardingCompleted: false
          }, env.JWT_SECRET || 'fallback-secret', '7d');

          const refreshToken = await createJWT({
            userId, email: body.email, type: 'refresh', roles: []
          }, env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', '7d');

          // Send verification email (non-blocking)
          await sendVerificationEmail(env, body.email, body.firstName, verificationToken);

          return new Response(JSON.stringify({
            message: 'User registered successfully',
            user: {
              id: userId,
              email: body.email,
              firstName: body.firstName,
              lastName: body.lastName,
              isEmailVerified: false
            },
            tokens: {
              accessToken,
              refreshToken
            },
            verificationToken
          }), {
            status: 201,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Registration error:', error);
          return new Response(JSON.stringify({ error: 'Registration failed', details: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Verify email endpoint
      if (path === '/api/auth/verify-email' && request.method === 'GET') {
        const token = url.searchParams.get('token');
        if (!token) {
          return new Response(JSON.stringify({ error: 'Verification token is required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          const user = await env.DB.prepare('SELECT id, emailVerified FROM users WHERE verificationToken = ?').bind(token).first() as { id: string; emailVerified: number } | null;
          if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid or expired verification token' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (user.emailVerified === 1) {
            return new Response(JSON.stringify({ message: 'Email is already verified' }), {
              status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          await env.DB.prepare('UPDATE users SET emailVerified = 1, verificationToken = NULL, updatedAt = datetime(\'now\') WHERE id = ?').bind(user.id).run();

          return new Response(JSON.stringify({ message: 'Email verified successfully' }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Email verification error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Resend verification endpoint
      if (path === '/api/auth/resend-verification' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          const user = await env.DB.prepare('SELECT id, emailVerified FROM users WHERE id = ?').bind(payload.userId).first() as { id: string; emailVerified: number } | null;
          if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (user.emailVerified === 1) {
            return new Response(JSON.stringify({ error: 'Email is already verified' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const newToken = crypto.randomUUID();
          await env.DB.prepare('UPDATE users SET verificationToken = ?, updatedAt = datetime(\'now\') WHERE id = ?').bind(newToken, user.id).run();

          const frontendUrl = env.FRONTEND_URL || 'https://main.kolabolab-dev.pages.dev';
          const verificationUrl = `${frontendUrl}/verify-email?token=${newToken}`;

          // Send verification email
          const userDetails = await env.DB.prepare('SELECT email, firstName FROM users WHERE id = ?').bind(user.id).first() as { email: string; firstName: string } | null;
          if (userDetails) {
            await sendVerificationEmail(env, userDetails.email, userDetails.firstName, newToken);
          }

          return new Response(JSON.stringify({
            message: 'Verification email sent successfully',
            verificationToken: newToken,
            verificationUrl
          }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Resend verification error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Database initialization
      if (path === '/api/init-db' && request.method === 'GET') {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: 'Database not available' }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password TEXT,
              firstName TEXT NOT NULL,
              lastName TEXT NOT NULL,
              avatar TEXT,
              bio TEXT,
              isVerified INTEGER DEFAULT 0,
              emailVerified INTEGER DEFAULT 0,
              verificationToken TEXT,
              roles TEXT DEFAULT '[]',
              onboarding_completed INTEGER DEFAULT 0,
              createdAt TEXT DEFAULT (datetime('now')),
              updatedAt TEXT DEFAULT (datetime('now'))
            )
          `).run();
          
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS startups (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              name TEXT NOT NULL,
              stage TEXT NOT NULL DEFAULT 'idea',
              funding_amount INTEGER NOT NULL DEFAULT 0,
              status TEXT NOT NULL DEFAULT 'active',
              created_at TEXT NOT NULL DEFAULT (datetime('now')),
              updated_at TEXT NOT NULL DEFAULT (datetime('now')),
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
          `).run();
          
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS activities (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              type TEXT NOT NULL,
              message TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT (datetime('now')),
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
          `).run();
          
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS investors (
              id TEXT PRIMARY KEY,
              startup_id TEXT NOT NULL,
              name TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT (datetime('now')),
              FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
            )
          `).run();
          
          await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id)`).run();
          await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_activities_user_id_created ON activities(user_id, created_at DESC)`).run();
          await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_investors_startup_id ON investors(startup_id)`).run();
          
          return new Response(JSON.stringify({
            message: 'Database initialized successfully',
            result: true
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            error: 'Failed to initialize database',
            details: error instanceof Error ? error.message : 'Unknown error'
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Token debug endpoint
      if (path === '/test/token-debug' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
          return new Response(JSON.stringify({ error: 'No Authorization header' }), {
            status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const tokenPreview = token.substring(0, 50) + '...';
        const parts = token.split('.');
        
        let payloadDecoded = null;
        try {
          const payloadStr = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payloadPadded = payloadStr + '='.repeat((4 - payloadStr.length % 4) % 4);
          payloadDecoded = JSON.parse(atob(payloadPadded));
        } catch (e) {
          payloadDecoded = { error: 'Failed to decode payload' };
        }
        
        const verified = await verifyJWT(token, env.JWT_SECRET);
        
        return new Response(JSON.stringify({
          tokenPreview,
          parts: parts.length,
          payloadDecoded,
          verified: verified ? 'VALID' : 'INVALID',
          verifiedPayload: verified,
          jwtSecretSet: !!env.JWT_SECRET,
        }, null, 2), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Test endpoint for debugging OAuth
      if (path === '/test/oauth-debug' && request.method === 'GET') {
        const testCode = url.searchParams.get('code') || 'test-code';
        const testState = url.searchParams.get('state') || 'test-state';
        
        try {
          // Test token exchange
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: env.GOOGLE_CLIENT_ID,
              client_secret: env.GOOGLE_CLIENT_SECRET,
              code: testCode,
              grant_type: 'authorization_code',
              redirect_uri: env.GOOGLE_CALLBACK_URL || `${url.origin}/auth/google/callback`,
            }),
          });
          
          const tokenResult = await tokenResponse.text();
          
          return new Response(JSON.stringify({
            message: 'OAuth Debug Test',
            tokenResponse: {
              status: tokenResponse.status,
              ok: tokenResponse.ok,
              body: tokenResult
            },
            config: {
              clientId: env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
              clientSecret: env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
              callbackUrl: env.GOOGLE_CALLBACK_URL,
              frontendUrl: env.FRONTEND_URL,
              jwtSecret: env.JWT_SECRET ? 'SET' : 'NOT SET'
            }
          }, null, 2), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            error: 'Debug test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Google OAuth initiation
      if (path === '/auth/google' && request.method === 'GET') {
        const clientId = env.GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          return new Response(JSON.stringify({ 
            error: 'OAuth not configured',
            details: 'GOOGLE_CLIENT_ID not set'
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        const redirectUri = env.GOOGLE_CALLBACK_URL || `${url.origin}/auth/google/callback`;
        const scope = 'openid email profile';
        const state = crypto.randomUUID();
        
        // Store state in KV for validation
        if (env.CACHE) {
          await env.CACHE.put(`oauth_state_${state}`, 'valid', { expirationTtl: 600 }); // 10 minutes
        }
        
        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.set('client_id', clientId);
        googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
        googleAuthUrl.searchParams.set('response_type', 'code');
        googleAuthUrl.searchParams.set('scope', scope);
        googleAuthUrl.searchParams.set('state', state);
        googleAuthUrl.searchParams.set('access_type', 'offline');
        googleAuthUrl.searchParams.set('prompt', 'consent');
        
        return Response.redirect(googleAuthUrl.toString(), 302);
      }
      
      // Google OAuth callback
      if (path === '/auth/google/callback' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        
        if (error) {
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(error)}`, 302);
        }
        
        if (!code || !state) {
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=missing_code_or_state`, 302);
        }
        
        // Validate state
        if (env.CACHE) {
          const storedState = await env.CACHE.get(`oauth_state_${state}`);
          if (!storedState) {
            const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
            return Response.redirect(`${frontendUrl}/auth/callback?error=invalid_state`, 302);
          }
          // Clean up state
          await env.CACHE.delete(`oauth_state_${state}`);
        }
        
        try {
          // Exchange code for tokens
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: env.GOOGLE_CLIENT_ID,
              client_secret: env.GOOGLE_CLIENT_SECRET,
              code,
              grant_type: 'authorization_code',
              redirect_uri: env.GOOGLE_CALLBACK_URL || `${url.origin}/auth/google/callback`,
            }),
          });
          
          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', errorText);
            throw new Error(`Failed to exchange code for tokens: ${tokenResponse.status} ${errorText}`);
          }
          
          const tokens = await tokenResponse.json() as {
            access_token: string;
            id_token: string;
            refresh_token?: string;
          };
          
          // Get user info from Google
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          
          if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('User info fetch failed:', errorText);
            throw new Error(`Failed to get user info from Google: ${userResponse.status} ${errorText}`);
          }
          
          const googleUser = await userResponse.json() as {
            id: string;
            email: string;
            name: string;
            given_name: string;
            family_name: string;
            picture: string;
            verified_email: boolean;
          };
          
          console.log('Google user data:', JSON.stringify(googleUser, null, 2));
          
          // Create or update user in database
          let user: any;
          if (env.DB) {
            try {
              // Check if user exists
              const existingUser = await env.DB.prepare(
                'SELECT * FROM users WHERE email = ?'
              ).bind(googleUser.email).first() as any;
              
              if (existingUser) {
                // Update existing user - read actual roles and onboarding_completed from DB
                user = existingUser;
                console.log('Found existing user:', user.email);
              } else {
                // Create new user with empty roles and onboarding_completed = 0
                const userId = crypto.randomUUID();
                console.log('Creating new user:', googleUser.email);
                await env.DB.prepare(`
                  INSERT INTO users (id, email, firstName, lastName, avatar, isVerified, emailVerified, roles, onboarding_completed, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, 1, 1, '[]', 0, datetime('now'), datetime('now'))
                `).bind(
                  userId,
                  googleUser.email,
                  googleUser.given_name || googleUser.name.split(' ')[0] || 'User',
                  googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
                  googleUser.picture || ''
                ).run();
                
                user = {
                  id: userId,
                  email: googleUser.email,
                  firstName: googleUser.given_name || googleUser.name.split(' ')[0] || 'User',
                  lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
                  avatar: googleUser.picture || '',
                  isVerified: 1,
                  roles: '[]',
                  onboarding_completed: 0
                };
                console.log('Created new user:', user.email);
              }
            } catch (dbError) {
              console.error('Database error:', dbError);
              // Fallback to non-DB user creation
              user = {
                id: `google_${googleUser.id}`,
                email: googleUser.email,
                firstName: googleUser.given_name || googleUser.name.split(' ')[0] || 'User',
                lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
                avatar: googleUser.picture || '',
                isVerified: 1,
                roles: '[]',
                onboarding_completed: 0
              };
              console.log('Using fallback user creation:', user.email);
            }
          } else {
            // Fallback user object when DB is not available
            user = {
              id: `google_${googleUser.id}`,
              email: googleUser.email,
              firstName: googleUser.given_name || googleUser.name.split(' ')[0] || 'User',
              lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
              avatar: googleUser.picture || '',
              isVerified: 1,
              roles: '[]',
              onboarding_completed: 0
            };
            console.log('Using fallback user (no DB):', user.email);
          }
          
          // Create JWT tokens
          console.log('Creating JWT tokens for user:', user.email);
          const userRoles = user.roles ? (typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles) : [];
          const accessToken = await createJWT({
            userId: user.id,
            email: user.email,
            type: 'access',
            roles: userRoles,
            onboardingCompleted: user.onboarding_completed === 1
          }, env.JWT_SECRET || 'fallback-secret', '7d');
          
          const refreshToken = await createJWT({
            userId: user.id,
            email: user.email,
            type: 'refresh',
            roles: userRoles
          }, env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', '7d');
          
          // Encode user data for frontend
          const userOnboardingCompleted = user.onboarding_completed === 1;
          const userData = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            roles: userRoles,
            onboardingCompleted: userOnboardingCompleted,
            isEmailVerified: true
          }));
          
          console.log('Redirecting to frontend with tokens');
          // Redirect to frontend with tokens
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(
            `${frontendUrl}/auth/callback?token=${userData}&access=${accessToken}&refresh=${refreshToken}`,
            302
          );
          
        } catch (error) {
          console.error('Google OAuth callback error:', error);
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=oauth_failed`, 302);
        }
      }
      
      // LinkedIn OAuth initiation
      if (path === '/auth/linkedin' && request.method === 'GET') {
        const clientId = env.LINKEDIN_CLIENT_ID;
        
        if (!clientId) {
          return new Response(JSON.stringify({ 
            error: 'OAuth not configured',
            details: 'LINKEDIN_CLIENT_ID not set'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        const redirectUri = env.LINKEDIN_CALLBACK_URL || `${url.origin}/auth/linkedin/callback`;
        const scope = 'openid profile email';
        const state = crypto.randomUUID();
        
        if (env.CACHE) {
          await env.CACHE.put(`oauth_state_${state}`, 'linkedin', { expirationTtl: 600 });
        }
        
        const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
        linkedinAuthUrl.searchParams.set('response_type', 'code');
        linkedinAuthUrl.searchParams.set('client_id', clientId);
        linkedinAuthUrl.searchParams.set('redirect_uri', redirectUri);
        linkedinAuthUrl.searchParams.set('state', state);
        linkedinAuthUrl.searchParams.set('scope', scope);
        
        return Response.redirect(linkedinAuthUrl.toString(), 302);
      }
      
      // LinkedIn OAuth callback
      if (path === '/auth/linkedin/callback' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        
        if (error) {
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(error)}`, 302);
        }
        
        if (!code || !state) {
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=missing_code_or_state`, 302);
        }
        
        if (env.CACHE) {
          const storedState = await env.CACHE.get(`oauth_state_${state}`);
          if (!storedState) {
            const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
            return Response.redirect(`${frontendUrl}/auth/callback?error=invalid_state`, 302);
          }
          await env.CACHE.delete(`oauth_state_${state}`);
        }
        
        try {
          const redirectUri = env.LINKEDIN_CALLBACK_URL || `${url.origin}/auth/linkedin/callback`;
          
          // Exchange code for tokens
          const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code,
              client_id: env.LINKEDIN_CLIENT_ID,
              client_secret: env.LINKEDIN_CLIENT_SECRET,
              redirect_uri: redirectUri,
            }),
          });
          
          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('LinkedIn token exchange failed:', errorText);
            const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
            return Response.redirect(`${frontendUrl}/auth/callback?error=linkedin_token_failed&details=${encodeURIComponent(errorText.substring(0, 200))}`, 302);
          }
          
          const tokens = await tokenResponse.json() as { access_token: string };
          
          // Get user info from LinkedIn using OpenID Connect userinfo endpoint
          const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });
          
          if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('LinkedIn userinfo failed:', errorText);
            const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
            return Response.redirect(`${frontendUrl}/auth/callback?error=linkedin_userinfo_failed&details=${encodeURIComponent(errorText.substring(0, 200))}`, 302);
          }
          
          const linkedinUser = await userResponse.json() as {
            sub: string;
            email: string;
            name: string;
            given_name: string;
            family_name: string;
            picture: string;
            email_verified: boolean;
          };
          
          // Create or lookup user (same pattern as Google)
          let user: any;
          if (env.DB) {
            try {
              const existingUser = await env.DB.prepare(
                'SELECT * FROM users WHERE email = ?'
              ).bind(linkedinUser.email).first() as any;
              
              if (existingUser) {
                user = existingUser;
              } else {
                const userId = crypto.randomUUID();
                await env.DB.prepare(`
                  INSERT INTO users (id, email, firstName, lastName, avatar, isVerified, emailVerified, roles, onboarding_completed, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, 1, 1, '[]', 0, datetime('now'), datetime('now'))
                `).bind(
                  userId,
                  linkedinUser.email,
                  linkedinUser.given_name || linkedinUser.name?.split(' ')[0] || 'User',
                  linkedinUser.family_name || linkedinUser.name?.split(' ').slice(1).join(' ') || '',
                  linkedinUser.picture || ''
                ).run();
                
                user = {
                  id: userId,
                  email: linkedinUser.email,
                  firstName: linkedinUser.given_name || linkedinUser.name?.split(' ')[0] || 'User',
                  lastName: linkedinUser.family_name || linkedinUser.name?.split(' ').slice(1).join(' ') || '',
                  avatar: linkedinUser.picture || '',
                  roles: '[]',
                  onboarding_completed: 0
                };
              }
            } catch (dbError) {
              console.error('LinkedIn DB error:', dbError);
              user = {
                id: `linkedin_${linkedinUser.sub}`,
                email: linkedinUser.email,
                firstName: linkedinUser.given_name || linkedinUser.name?.split(' ')[0] || 'User',
                lastName: linkedinUser.family_name || linkedinUser.name?.split(' ').slice(1).join(' ') || '',
                avatar: linkedinUser.picture || '',
                roles: '[]',
                onboarding_completed: 0
              };
            }
          } else {
            user = {
              id: `linkedin_${linkedinUser.sub}`,
              email: linkedinUser.email,
              firstName: linkedinUser.given_name || linkedinUser.name?.split(' ')[0] || 'User',
              lastName: linkedinUser.family_name || linkedinUser.name?.split(' ').slice(1).join(' ') || '',
              avatar: linkedinUser.picture || '',
              roles: '[]',
              onboarding_completed: 0
            };
          }
          
          // Create JWT tokens
          const linkedinUserRoles = user.roles ? (typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles) : [];
          const accessToken = await createJWT({
            userId: user.id, email: user.email, type: 'access', roles: linkedinUserRoles, onboardingCompleted: user.onboarding_completed === 1
          }, env.JWT_SECRET || 'fallback-secret', '7d');
          
          const refreshToken = await createJWT({
            userId: user.id, email: user.email, type: 'refresh', roles: linkedinUserRoles
          }, env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', '7d');
          
          const linkedinOnboardingCompleted = user.onboarding_completed === 1;
          const userData = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            roles: linkedinUserRoles,
            onboardingCompleted: linkedinOnboardingCompleted,
            isEmailVerified: true
          }));
          
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(
            `${frontendUrl}/auth/callback?token=${userData}&access=${accessToken}&refresh=${refreshToken}`,
            302
          );
          
        } catch (error) {
          console.error('LinkedIn OAuth callback error:', error);
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=oauth_failed`, 302);
        }
      }
      
      // GitHub OAuth initiation
      if (path === '/auth/github' && request.method === 'GET') {
        const clientId = env.GITHUB_CLIENT_ID;
        
        if (!clientId) {
          return new Response(JSON.stringify({ 
            error: 'OAuth not configured',
            details: 'GITHUB_CLIENT_ID not set'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        const redirectUri = env.GITHUB_CALLBACK_URL || `${url.origin}/auth/github/callback`;
        const scope = 'read:user user:email';
        const state = crypto.randomUUID();
        
        if (env.CACHE) {
          await env.CACHE.put(`oauth_state_${state}`, 'github', { expirationTtl: 600 });
        }
        
        const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
        githubAuthUrl.searchParams.set('client_id', clientId);
        githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
        githubAuthUrl.searchParams.set('scope', scope);
        githubAuthUrl.searchParams.set('state', state);
        
        return Response.redirect(githubAuthUrl.toString(), 302);
      }
      
      // GitHub OAuth callback
      if (path === '/auth/github/callback' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        
        if (error) {
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(error)}`, 302);
        }
        
        if (!code || !state) {
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=missing_code_or_state`, 302);
        }
        
        if (env.CACHE) {
          const storedState = await env.CACHE.get(`oauth_state_${state}`);
          if (!storedState) {
            const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
            return Response.redirect(`${frontendUrl}/auth/callback?error=invalid_state`, 302);
          }
          await env.CACHE.delete(`oauth_state_${state}`);
        }
        
        try {
          // Exchange code for access token
          const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              client_id: env.GITHUB_CLIENT_ID,
              client_secret: env.GITHUB_CLIENT_SECRET,
              code,
              redirect_uri: env.GITHUB_CALLBACK_URL || `${url.origin}/auth/github/callback`,
            }),
          });
          
          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('GitHub token exchange failed:', errorText);
            throw new Error(`GitHub token exchange failed: ${tokenResponse.status}`);
          }
          
          const tokenData = await tokenResponse.json() as { access_token: string; error?: string };
          
          if (tokenData.error) {
            console.error('GitHub token error:', tokenData.error);
            throw new Error(`GitHub token error: ${tokenData.error}`);
          }
          
          // Get user info from GitHub
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              'User-Agent': 'KolaboLab-App',
            },
          });
          
          if (!userResponse.ok) {
            throw new Error(`GitHub user info failed: ${userResponse.status}`);
          }
          
          const githubUser = await userResponse.json() as {
            id: number;
            login: string;
            name: string;
            email: string;
            avatar_url: string;
          };
          
          // GitHub may not return email in profile, fetch from emails endpoint
          let email = githubUser.email;
          if (!email) {
            const emailsResponse = await fetch('https://api.github.com/user/emails', {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'User-Agent': 'KolaboLab-App',
              },
            });
            if (emailsResponse.ok) {
              const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
              const primaryEmail = emails.find(e => e.primary && e.verified);
              email = primaryEmail?.email || emails[0]?.email || `${githubUser.login}@github.noreply.com`;
            } else {
              email = `${githubUser.login}@github.noreply.com`;
            }
          }
          
          const nameParts = (githubUser.name || githubUser.login).split(' ');
          const firstName = nameParts[0] || githubUser.login;
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Create or lookup user
          let user: any;
          if (env.DB) {
            try {
              const existingUser = await env.DB.prepare(
                'SELECT * FROM users WHERE email = ?'
              ).bind(email).first() as any;
              
              if (existingUser) {
                user = existingUser;
              } else {
                const userId = crypto.randomUUID();
                await env.DB.prepare(`
                  INSERT INTO users (id, email, firstName, lastName, avatar, isVerified, emailVerified, roles, onboarding_completed, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, 1, 1, '[]', 0, datetime('now'), datetime('now'))
                `).bind(userId, email, firstName, lastName, githubUser.avatar_url || '').run();
                
                user = { id: userId, email, firstName, lastName, avatar: githubUser.avatar_url || '', roles: '[]', onboarding_completed: 0 };
              }
            } catch (dbError) {
              console.error('GitHub DB error:', dbError);
              user = { id: `github_${githubUser.id}`, email, firstName, lastName, avatar: githubUser.avatar_url || '', roles: '[]', onboarding_completed: 0 };
            }
          } else {
            user = { id: `github_${githubUser.id}`, email, firstName, lastName, avatar: githubUser.avatar_url || '', roles: '[]', onboarding_completed: 0 };
          }
          
          // Create JWT tokens
          const githubUserRoles = user.roles ? (typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles) : [];
          const accessToken = await createJWT({
            userId: user.id, email: user.email, type: 'access', roles: githubUserRoles, onboardingCompleted: user.onboarding_completed === 1
          }, env.JWT_SECRET || 'fallback-secret', '7d');
          
          const refreshToken = await createJWT({
            userId: user.id, email: user.email, type: 'refresh', roles: githubUserRoles
          }, env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', '7d');
          
          const githubOnboardingCompleted = user.onboarding_completed === 1;
          const userData = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            roles: githubUserRoles,
            onboardingCompleted: githubOnboardingCompleted,
            isEmailVerified: true
          }));
          
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(
            `${frontendUrl}/auth/callback?token=${userData}&access=${accessToken}&refresh=${refreshToken}`,
            302
          );
          
        } catch (error) {
          console.error('GitHub OAuth callback error:', error);
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=oauth_failed`, 302);
        }
      }
      
      // Search startups endpoint (public - no auth required)
      if (path === '/api/startups/search' && request.method === 'GET') {
        try {
          if (!env.DB) {
            return new Response(JSON.stringify({ startups: [], total: 0 }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const q = url.searchParams.get('q') || '';
          const industry = url.searchParams.get('industry') || '';
          const stageParam = url.searchParams.get('stage') || '';
          const roleTypeParam = url.searchParams.get('roleType') || '';
          const skillsParam = url.searchParams.get('skills') || '';

          const stages = stageParam ? stageParam.split(',').filter(Boolean) : [];
          const roleTypes = roleTypeParam ? roleTypeParam.split(',').filter(Boolean) : [];
          const skillsList = skillsParam ? skillsParam.split(',').filter(Boolean) : [];

          let sql = "SELECT id, name, description, industry, stage, tags, looking_for, compensation_type, location, team_size, funding_amount, created_at FROM startups WHERE status = 'active'";
          const bindings: any[] = [];

          if (q) {
            sql += " AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?))";
            const searchTerm = `%${q}%`;
            bindings.push(searchTerm, searchTerm, searchTerm);
          }

          if (industry) {
            sql += " AND industry = ?";
            bindings.push(industry);
          }

          if (stages.length > 0) {
            sql += ` AND stage IN (${stages.map(() => '?').join(',')})`;
            bindings.push(...stages);
          }

          if (roleTypes.length > 0) {
            const roleConditions = roleTypes.map(() => "looking_for LIKE ?");
            sql += ` AND (${roleConditions.join(' OR ')})`;
            bindings.push(...roleTypes.map(rt => `%${rt}%`));
          }

          if (skillsList.length > 0) {
            const skillConditions = skillsList.map(() => "looking_for LIKE ?");
            sql += ` AND (${skillConditions.join(' OR ')})`;
            bindings.push(...skillsList.map(s => `%${s}%`));
          }

          sql += " ORDER BY created_at DESC LIMIT 50";

          const stmt = env.DB.prepare(sql);
          const result = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all();

          const startups = (result.results ?? []).map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            industry: s.industry || '',
            stage: s.stage || '',
            tags: JSON.parse(s.tags || '[]'),
            lookingFor: JSON.parse(s.looking_for || '[]'),
            compensationType: s.compensation_type || 'equity',
            location: s.location || '',
            teamSize: s.team_size || 1,
            fundingAmount: s.funding_amount || 0,
            createdAt: s.created_at,
          }));

          return new Response(JSON.stringify({ startups, total: startups.length }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Search startups error:', error);
          return new Response(JSON.stringify({ startups: [], total: 0 }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Public startups listing (no auth required)
      if (path === '/api/startups/public' && request.method === 'GET') {
        try {
          if (!env.DB) {
            return new Response(JSON.stringify({ startups: [] }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          const result = await env.DB.prepare('SELECT id, name, stage, funding_amount, status, user_id, created_at FROM startups WHERE status = ? ORDER BY created_at DESC LIMIT 50').bind('active').all();
          const startups = (result.results ?? []).map((row: any) => ({
            id: row.id, name: row.name, stage: row.stage, fundingGoal: `$${(row.funding_amount / 100).toLocaleString()}`, status: row.status,
            description: '', industry: '', location: '', teamSize: 1, tags: [], logo: '', featured: false, lookingFor: [],
          }));
          return new Response(JSON.stringify({ startups }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ startups: [] }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Create startup endpoint (JWT protected)
      if (path === '/api/startups' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        
        // Try JWT verification first, then fall back to base64 user data lookup
        let userId: string | null = null;
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (payload && payload.userId) {
          userId = payload.userId;
        } else {
          // Fallback: try decoding as base64 user data and look up by email
          try {
            const decoded = JSON.parse(atob(token));
            if (decoded.email && env.DB) {
              const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(decoded.email).first() as any;
              if (user) userId = user.id;
            }
          } catch { /* not base64 user data */ }
        }
        
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        // Email verification guard
        const emailCheck = await requireEmailVerified(userId, env, corsHeaders);
        if (!emailCheck.verified) return emailCheck.response!;
        
        try {
          const body = await request.json() as any;
          
          if (!body.name) {
            return new Response(JSON.stringify({ error: 'Startup name is required' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          
          const startupId = crypto.randomUUID();
          const fundingAmount = Math.round((parseFloat(body.fundingGoal) || 0) * 100);
          
          await env.DB.prepare(`
            INSERT INTO startups (id, user_id, name, stage, funding_amount, status, description, industry, location, website, tags, looking_for, team_size, social_impact, founder_linkedin, pitch, compensation_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'pending_approval', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `).bind(
            startupId,
            userId,
            body.name,
            body.stage || 'idea',
            fundingAmount,
            body.description || '',
            body.industry || '',
            body.location || '',
            body.website || '',
            JSON.stringify(body.tags || []),
            JSON.stringify(body.lookingFor || []),
            parseInt(body.teamSize) || 1,
            body.socialImpact || '',
            body.founderLinkedin || '',
            body.pitch || '',
            body.compensationType || 'equity'
          ).run();
          
          // Log activity
          await env.DB.prepare(`
            INSERT INTO activities (id, user_id, type, message, created_at)
            VALUES (?, ?, 'startup', ?, datetime('now'))
          `).bind(
            crypto.randomUUID(),
            userId,
            `Created startup "${body.name}"`
          ).run();
          
          return new Response(JSON.stringify({
            message: 'Startup created successfully',
            startup: { id: startupId, name: body.name, stage: body.stage || 'idea', status: 'pending_approval' }
          }), {
            status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Create startup error:', error);
          return new Response(JSON.stringify({ error: 'Failed to create startup', details: error instanceof Error ? error.message : String(error) }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // ===== STARTUP UPDATES ENDPOINTS =====

      // DELETE /api/startups/:startupId/updates/:updateId (AUTH required, creator only)
      const deleteUpdateMatch = path.match(/^\/api\/startups\/([^/]+)\/updates\/([^/]+)$/) ;
      if (deleteUpdateMatch && request.method === 'DELETE') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        let userId: string | null = null;
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (payload && payload.userId) {
          userId = payload.userId;
        } else {
          try {
            const decoded = JSON.parse(atob(token));
            if (decoded.email && env.DB) {
              const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(decoded.email).first() as any;
              if (user) userId = user.id;
            }
          } catch { /* not base64 user data */ }
        }
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const startupId = deleteUpdateMatch[1];
        const updateId = deleteUpdateMatch[2];

        try {
          // Verify the update exists and belongs to the specified startup
          const update = await env.DB.prepare(
            'SELECT su.id, su.startupId FROM startupUpdates su WHERE su.id = ? AND su.startupId = ?'
          ).bind(updateId, startupId).first() as any;

          if (!update) {
            return new Response(JSON.stringify({ error: 'Update not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Verify the authenticated user is the startup creator
          const startup = await env.DB.prepare(
            'SELECT user_id FROM startups WHERE id = ?'
          ).bind(startupId).first() as any;

          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (startup.user_id !== userId) {
            return new Response(JSON.stringify({ error: 'Only the startup creator can delete updates' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Delete the update
          await env.DB.prepare('DELETE FROM startupUpdates WHERE id = ?').bind(updateId).run();

          return new Response(JSON.stringify({ message: 'Update deleted successfully' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Delete update error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // POST /api/startups/:startupId/updates (AUTH required, creator only)
      const postUpdateMatch = path.match(/^\/api\/startups\/([^/]+)\/updates$/);
      if (postUpdateMatch && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        let userId: string | null = null;
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (payload && payload.userId) {
          userId = payload.userId;
        } else {
          try {
            const decoded = JSON.parse(atob(token));
            if (decoded.email && env.DB) {
              const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(decoded.email).first() as any;
              if (user) userId = user.id;
            }
          } catch { /* not base64 user data */ }
        }
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const startupId = postUpdateMatch[1];

        try {
          // Verify startup exists
          const startup = await env.DB.prepare(
            'SELECT id, user_id FROM startups WHERE id = ?'
          ).bind(startupId).first() as any;

          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Verify authenticated user is the startup creator
          if (startup.user_id !== userId) {
            return new Response(JSON.stringify({ error: 'Only the startup creator can post updates' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Parse and validate content
          const body = await request.json() as { content?: string };
          const content = (body.content || '').trim();

          if (!content) {
            return new Response(JSON.stringify({ error: 'Update content is required' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (content.length > 2000) {
            return new Response(JSON.stringify({ error: 'Update content must not exceed 2000 characters' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Insert the update
          const updateId = crypto.randomUUID();
          const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

          await env.DB.prepare(
            'INSERT INTO startupUpdates (id, startupId, authorId, content, createdAt) VALUES (?, ?, ?, ?, ?)'
          ).bind(updateId, startupId, userId, content, createdAt).run();

          // Get author name for response
          const author = await env.DB.prepare(
            'SELECT firstName, lastName FROM users WHERE id = ?'
          ).bind(userId).first() as any;

          const authorName = author ? `${author.firstName} ${author.lastName}`.trim() : '';

          return new Response(JSON.stringify({
            message: 'Update posted successfully',
            update: {
              id: updateId,
              startupId,
              authorId: userId,
              authorName,
              content,
              createdAt,
            }
          }), {
            status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Create update error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/startups/:startupId/updates (PUBLIC - no auth required)
      const getUpdatesMatch = path.match(/^\/api\/startups\/([^/]+)\/updates$/);
      if (getUpdatesMatch && request.method === 'GET') {
        const startupId = getUpdatesMatch[1];

        try {
          // Verify startup exists
          const startup = await env.DB.prepare(
            'SELECT id FROM startups WHERE id = ?'
          ).bind(startupId).first() as any;

          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Parse pagination params
          const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
          const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
          const offset = (page - 1) * limit;

          // Get total count
          const countResult = await env.DB.prepare(
            'SELECT COUNT(*) as total FROM startupUpdates WHERE startupId = ?'
          ).bind(startupId).first() as any;
          const totalCount = countResult?.total || 0;
          const totalPages = Math.ceil(totalCount / limit);

          // Get paginated updates with author name
          const updatesResult = await env.DB.prepare(`
            SELECT su.id, su.startupId, su.authorId, su.content, su.createdAt,
                   (u.firstName || ' ' || u.lastName) as authorName
            FROM startupUpdates su
            LEFT JOIN users u ON su.authorId = u.id
            WHERE su.startupId = ?
            ORDER BY su.createdAt DESC
            LIMIT ? OFFSET ?
          `).bind(startupId, limit, offset).all() as D1Result<{
            id: string;
            startupId: string;
            authorId: string;
            content: string;
            createdAt: string;
            authorName: string;
          }>;

          const updates = (updatesResult.results || []).map(u => ({
            id: u.id,
            startupId: u.startupId,
            authorId: u.authorId,
            authorName: u.authorName || '',
            content: u.content,
            createdAt: u.createdAt,
          }));

          return new Response(JSON.stringify({
            updates,
            pagination: {
              page,
              pageSize: limit,
              totalCount,
              totalPages,
            }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get startup updates error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/dashboard/feed (AUTH required)
      if (path === '/api/dashboard/feed' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        let userId: string | null = null;
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (payload && payload.userId) {
          userId = payload.userId;
        } else {
          try {
            const decoded = JSON.parse(atob(token));
            if (decoded.email && env.DB) {
              const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(decoded.email).first() as any;
              if (user) userId = user.id;
            }
          } catch { /* not base64 user data */ }
        }
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          // Parse pagination params
          const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
          const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
          const offset = (page - 1) * limit;

          // Get total count of updates from user's startups
          const countResult = await env.DB.prepare(`
            SELECT COUNT(*) as total
            FROM startupUpdates su
            JOIN startups s ON su.startupId = s.id
            WHERE s.user_id = ?
          `).bind(userId).first() as any;
          const totalCount = countResult?.total || 0;
          const totalPages = Math.ceil(totalCount / limit);

          // Get paginated updates from user's startups with startup name and author name
          const updatesResult = await env.DB.prepare(`
            SELECT su.id, su.startupId, su.authorId, su.content, su.createdAt,
                   s.name as startupName,
                   (u.firstName || ' ' || u.lastName) as authorName
            FROM startupUpdates su
            JOIN startups s ON su.startupId = s.id
            LEFT JOIN users u ON su.authorId = u.id
            WHERE s.user_id = ?
            ORDER BY su.createdAt DESC
            LIMIT ? OFFSET ?
          `).bind(userId, limit, offset).all() as D1Result<{
            id: string;
            startupId: string;
            authorId: string;
            content: string;
            createdAt: string;
            startupName: string;
            authorName: string;
          }>;

          const updates = (updatesResult.results || []).map(u => ({
            id: u.id,
            startupId: u.startupId,
            startupName: u.startupName || '',
            authorId: u.authorId,
            authorName: u.authorName || '',
            content: u.content,
            createdAt: u.createdAt,
          }));

          return new Response(JSON.stringify({
            updates,
            pagination: {
              page,
              pageSize: limit,
              totalCount,
              totalPages,
            }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get dashboard feed error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // ===== END STARTUP UPDATES ENDPOINTS =====

      // Get single startup (public)
      if (path.startsWith('/api/startups/') && request.method === 'GET' && path !== '/api/startups/public') {
        try {
          const startupId = path.split('/api/startups/')[1];
          if (!startupId || !env.DB) {
            return new Response(JSON.stringify({ error: 'Not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          const startup = await env.DB.prepare(
            'SELECT s.*, u.firstName, u.lastName, u.email, u.avatar FROM startups s JOIN users u ON s.user_id = u.id WHERE s.id = ?'
          ).bind(startupId).first() as any;
          
          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          
          return new Response(JSON.stringify({
            startup: {
              id: startup.id,
              userId: startup.user_id,
              name: startup.name,
              stage: startup.stage,
              fundingAmount: startup.funding_amount,
              status: startup.status,
              description: startup.description || '',
              industry: startup.industry || '',
              location: startup.location || '',
              website: startup.website || '',
              tags: JSON.parse(startup.tags || '[]'),
              lookingFor: JSON.parse(startup.looking_for || '[]'),
              teamSize: startup.team_size || 1,
              socialImpact: startup.social_impact || '',
              founderLinkedin: startup.founder_linkedin || '',
              pitch: startup.pitch || '',
              compensationType: startup.compensation_type || 'equity',
              createdAt: startup.created_at,
              founder: {
                firstName: startup.firstName,
                lastName: startup.lastName,
                email: startup.email,
                avatar: startup.avatar,
              }
            }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Delete startup endpoint (admin only)
      if (path.startsWith('/api/startups/') && request.method === 'DELETE') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const startupId = path.split('/api/startups/')[1];
          
          // Verify the startup exists
          const startup = await env.DB.prepare(
            'SELECT id, name FROM startups WHERE id = ?'
          ).bind(startupId).first() as any;
          
          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          
          // Delete associated investors first
          await env.DB.prepare('DELETE FROM investors WHERE startup_id = ?').bind(startupId).run();
          
          // Delete the startup
          await env.DB.prepare('DELETE FROM startups WHERE id = ?').bind(startupId).run();
          
          // Log activity
          await env.DB.prepare(`
            INSERT INTO activities (id, user_id, type, message, created_at)
            VALUES (?, ?, 'startup', ?, datetime('now'))
          `).bind(crypto.randomUUID(), adminAuth.userId, `Deleted startup "${startup.name}"`).run();
          
          return new Response(JSON.stringify({ message: 'Startup deleted successfully' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Delete startup error:', error);
          return new Response(JSON.stringify({ error: 'Failed to delete startup' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Public search endpoint (no auth required)
      if (path === '/api/search' && request.method === 'GET') {
        try {
          if (!env.DB) {
            return new Response(JSON.stringify({ results: [] }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          const query = url.searchParams.get('q') || '';
          const type = url.searchParams.get('type') || 'all';
          
          let results: any[] = [];
          
          // Search startups
          if (type === 'all' || type === 'startups') {
            const startupsQuery = query
              ? await env.DB.prepare("SELECT id, name, stage, description, industry, location FROM startups WHERE (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)) AND status = 'active' LIMIT 20").bind(`%${query}%`, `%${query}%`).all()
              : await env.DB.prepare("SELECT id, name, stage, description, industry, location FROM startups WHERE status = 'active' LIMIT 20").all();
            results = results.concat((startupsQuery.results ?? []).map((row: any) => ({
              id: row.id, type: 'startup', title: row.name, subtitle: row.stage || 'Startup', description: row.description || '', location: row.location || '', image: '', tags: [],
              metadata: { industry: row.industry }
            })));
          }
          
          // Search people
          if (type === 'all' || type === 'people') {
            const peopleQuery = query
              ? await env.DB.prepare("SELECT id, firstName, lastName, bio, skills, roles FROM users WHERE (LOWER(firstName) LIKE LOWER(?) OR LOWER(lastName) LIKE LOWER(?) OR LOWER(bio) LIKE LOWER(?) OR LOWER(skills) LIKE LOWER(?)) AND email != 'admin@kolabolab.com' LIMIT 20").bind(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`).all()
              : await env.DB.prepare("SELECT id, firstName, lastName, bio, skills, roles FROM users WHERE email != 'admin@kolabolab.com' LIMIT 20").all();
            results = results.concat((peopleQuery.results ?? []).map((row: any) => {
              const skills = (() => { try { return JSON.parse(row.skills || '[]'); } catch { return []; } })();
              const roles = (() => { try { return JSON.parse(row.roles || '[]'); } catch { return []; } })();
              return {
                id: row.id, type: 'person', title: `${row.firstName} ${row.lastName}`, subtitle: roles.join(', ') || 'Member', description: row.bio || '', location: '', image: '', tags: skills,
                metadata: { skills, role: roles[0] || '' }
              };
            }));
          }
          
          // Search opportunities (roles from active startups)
          if (type === 'all' || type === 'opportunities') {
            const oppsQuery = query
              ? await env.DB.prepare("SELECT id, name, looking_for, compensation_type FROM startups WHERE LOWER(looking_for) LIKE LOWER(?) AND status = 'active' LIMIT 20").bind(`%${query}%`).all()
              : await env.DB.prepare("SELECT id, name, looking_for, compensation_type FROM startups WHERE looking_for IS NOT NULL AND looking_for != '[]' AND status = 'active' LIMIT 20").all();
            for (const row of (oppsQuery.results ?? []) as any[]) {
              try {
                const roles = JSON.parse(row.looking_for || '[]');
                for (const role of roles) {
                  const title = typeof role === 'string' ? role : (role.title || '');
                  const skills = typeof role === 'object' ? (role.skills || []) : [];
                  if (title && (!query || title.toLowerCase().includes(query.toLowerCase()))) {
                    results.push({
                      id: row.id, type: 'opportunity', title, subtitle: `at ${row.name}`, description: typeof role === 'object' ? (role.description || '') : '', location: '', image: '', tags: Array.isArray(skills) ? skills : [],
                      metadata: { skills: Array.isArray(skills) ? skills : [], commitment: typeof role === 'object' ? role.commitment : row.compensation_type }
                    });
                  }
                }
              } catch { /* skip malformed JSON */ }
            }
          }
          
          return new Response(JSON.stringify({ results }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ results: [] }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Dashboard Stats endpoint (JWT protected)
      if (path === '/api/dashboard/stats' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        try {
          const userId = payload.userId;
          const startupsResult = await env.DB.prepare('SELECT COUNT(*) as count FROM startups WHERE user_id = ?').bind(userId).first();
          const investorsResult = await env.DB.prepare('SELECT COUNT(DISTINCT i.id) as count FROM investors i JOIN startups s ON i.startup_id = s.id WHERE s.user_id = ?').bind(userId).first();
          const fundingResult = await env.DB.prepare('SELECT COALESCE(SUM(funding_amount), 0) as total FROM startups WHERE user_id = ?').bind(userId).first();
          const successRateResult = await env.DB.prepare(`SELECT COALESCE(ROUND(100.0 * COUNT(CASE WHEN status = 'successful' THEN 1 END) / NULLIF(COUNT(*), 0)), 0) as rate FROM startups WHERE user_id = ?`).bind(userId).first();
          return new Response(JSON.stringify({
            totalStartups: Number(startupsResult?.count ?? 0),
            totalInvestors: Number(investorsResult?.count ?? 0),
            totalFunding: Number(fundingResult?.total ?? 0),
            successRate: Number(successRateResult?.rate ?? 0),
          }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } catch (error) {
          console.error('Dashboard stats error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Dashboard Activities endpoint (JWT protected)
      if (path === '/api/dashboard/activities' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        try {
          const userId = payload.userId;
          const result = await env.DB.prepare('SELECT id, type, message, created_at as timestamp FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').bind(userId).all();
          return new Response(JSON.stringify({ activities: result.results || [] }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Dashboard activities error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // User Startups endpoint (JWT protected)
      if (path === '/api/user/startups' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        try {
          const userId = payload.userId;
          const result = await env.DB.prepare('SELECT id, name, stage, funding_amount, status FROM startups WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all();
          const startups = (result.results ?? []).map((row: any) => ({
            id: row.id, name: row.name, stage: row.stage, fundingAmount: row.funding_amount, status: row.status,
          }));
          return new Response(JSON.stringify({ startups }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('User startups error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Onboarding complete endpoint (JWT protected)
      if (path === '/api/onboarding/complete' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;
        try {
          const body = await request.json() as { roles?: unknown };

          // Validate roles field exists and is an array
          if (!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) {
            return new Response(JSON.stringify({ error: 'At least one role is required' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const validRoles = ['entrepreneur', 'collaborator', 'investor'];

          // Validate each role value
          for (const role of body.roles) {
            if (typeof role !== 'string' || !validRoles.includes(role)) {
              return new Response(JSON.stringify({ error: `Invalid role: ${role}` }), {
                status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
          }

          // Deduplicate roles silently
          const uniqueRoles = [...new Set(body.roles as string[])];
          const rolesJson = JSON.stringify(uniqueRoles);

          // Update user record
          await env.DB.prepare(
            'UPDATE users SET roles = ?, onboarding_completed = 1, updatedAt = datetime(\'now\') WHERE id = ?'
          ).bind(rolesJson, userId).run();

          // Fetch updated user
          const updatedUser = await env.DB.prepare(
            'SELECT id, email, firstName, lastName, avatar, roles, onboarding_completed, isVerified FROM users WHERE id = ?'
          ).bind(userId).first() as any;

          if (!updatedUser) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          return new Response(JSON.stringify({
            message: 'Onboarding completed successfully',
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              avatar: updatedUser.avatar || '',
              roles: JSON.parse(updatedUser.roles || '[]'),
              onboardingCompleted: updatedUser.onboarding_completed === 1,
              isEmailVerified: updatedUser.isVerified === 1,
            }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Onboarding complete error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Onboarding status endpoint (JWT protected)
      if (path === '/api/user/onboarding-status' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        try {
          const userId = payload.userId;
          const user = await env.DB.prepare(
            'SELECT roles, onboarding_completed FROM users WHERE id = ?'
          ).bind(userId).first() as { roles: string | null; onboarding_completed: number | null } | null;

          if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          let roles: string[] = [];
          try {
            roles = user.roles ? JSON.parse(user.roles) : [];
          } catch {
            roles = [];
          }

          return new Response(JSON.stringify({
            onboardingCompleted: user.onboarding_completed === 1,
            roles,
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Onboarding status error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // PUT /api/user/roles - Update user roles (JWT protected)
      if (path === '/api/user/roles' && request.method === 'PUT') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          const body = await request.json() as { roles?: unknown };

          // Validate roles field exists and is an array
          if (!body.roles || !Array.isArray(body.roles)) {
            return new Response(JSON.stringify({ error: 'At least one role is required' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const validRoles = ['entrepreneur', 'collaborator', 'investor'];
          const roles: string[] = body.roles;

          // Validate non-empty
          if (roles.length === 0) {
            return new Response(JSON.stringify({ error: 'At least one role is required' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Validate each role value
          for (const role of roles) {
            if (typeof role !== 'string' || !validRoles.includes(role)) {
              return new Response(JSON.stringify({ error: `Invalid role: ${role}` }), {
                status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
          }

          // Deduplicate roles
          const uniqueRoles = [...new Set(roles)];

          // Update user record in D1
          await env.DB.prepare(
            'UPDATE users SET roles = ?, updatedAt = datetime(\'now\') WHERE id = ?'
          ).bind(JSON.stringify(uniqueRoles), userId).run();

          return new Response(JSON.stringify({
            message: 'Roles updated successfully',
            roles: uniqueRoles
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Update roles error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Admin: Get all startups
      if (path === '/api/admin/all-startups' && request.method === 'GET') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const result = await env.DB.prepare(
            'SELECT s.id, s.name, s.stage, s.status, s.created_at, u.firstName, u.lastName, u.email FROM startups s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC'
          ).all();

          const startups = (result.results ?? []).map((row: any) => ({
            id: row.id,
            name: row.name,
            stage: row.stage,
            status: row.status,
            createdAt: row.created_at,
            creator: {
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
            },
          }));

          return new Response(JSON.stringify(startups), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get all startups error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Admin: Get all users
      if (path === '/api/admin/users' && request.method === 'GET') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const result = await env.DB.prepare(
            'SELECT id, email, firstName, lastName, roles, onboarding_completed, createdAt FROM users ORDER BY createdAt DESC'
          ).all();

          const users = (result.results ?? []).map((row: any) => ({
            id: row.id,
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            roles: row.roles ? JSON.parse(row.roles) : [],
            onboardingCompleted: row.onboarding_completed === 1,
            createdAt: row.createdAt,
          }));

          return new Response(JSON.stringify(users), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get all users error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Admin: Get pending startups
      if (path === '/api/admin/pending-startups' && request.method === 'GET') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const result = await env.DB.prepare(
            'SELECT s.id, s.name, s.stage, s.created_at, u.firstName, u.lastName, u.email FROM startups s JOIN users u ON s.user_id = u.id WHERE s.status = ? ORDER BY s.created_at ASC'
          ).bind('pending_approval').all();

          const pendingStartups = (result.results ?? []).map((row: any) => ({
            id: row.id,
            name: row.name,
            stage: row.stage,
            createdAt: row.created_at,
            creator: {
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
            },
          }));

          return new Response(JSON.stringify(pendingStartups), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get pending startups error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Admin: Approve startup
      if (path.startsWith('/api/admin/approve/') && request.method === 'POST') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const startupId = path.split('/api/admin/approve/')[1];

          const startup = await env.DB.prepare(
            'SELECT id, user_id, name, status FROM startups WHERE id = ?'
          ).bind(startupId).first() as any;

          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (startup.status !== 'pending_approval') {
            return new Response(JSON.stringify({ error: 'Startup is not pending approval' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          await env.DB.prepare(
            "UPDATE startups SET status = 'active', updated_at = datetime('now') WHERE id = ?"
          ).bind(startupId).run();

          // Create notification for startup owner
          await createNotification(env.DB, {
            recipientId: startup.user_id,
            type: 'startup_approved',
            referenceId: startupId,
            title: 'Startup Approved',
            message: `Your startup ${startup.name} has been approved and is now visible`
          });

          return new Response(JSON.stringify({ message: 'Startup approved successfully' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Approve startup error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Admin: Get platform stats
      if (path === '/api/admin/stats' && request.method === 'GET') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const usersResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM users'
          ).first() as { count: number };

          const startupsResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM startups'
          ).first() as { count: number };

          const pendingResult = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM startups WHERE status = 'pending_approval'"
          ).first() as { count: number };

          return new Response(JSON.stringify({
            totalUsers: usersResult.count,
            totalStartups: startupsResult.count,
            pendingStartups: pendingResult.count,
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get admin stats error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Admin: Analytics endpoint
      if (path === '/api/admin/analytics' && request.method === 'GET') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const period = url.searchParams.get('period') || 'weekly';
          const validPeriods = ['daily', 'weekly', 'monthly'];
          if (!validPeriods.includes(period)) {
            return new Response(JSON.stringify({ error: 'Invalid period parameter. Must be one of: daily, weekly, monthly' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Determine strftime format based on period
          let format: string;
          if (period === 'daily') {
            format = '%Y-%m-%d';
          } else if (period === 'weekly') {
            format = '%Y-W%W';
          } else {
            format = '%Y-%m';
          }

          // Time-series queries
          const signupsResult = await env.DB.prepare(
            `SELECT strftime('${format}', createdAt) as period, COUNT(*) as count FROM users GROUP BY period ORDER BY period ASC`
          ).all() as D1Result<{ period: string; count: number }>;

          const startupsResult = await env.DB.prepare(
            `SELECT strftime('${format}', created_at) as period, COUNT(*) as count FROM startups GROUP BY period ORDER BY period ASC`
          ).all() as D1Result<{ period: string; count: number }>;

          const applicationsResult = await env.DB.prepare(
            `SELECT strftime('${format}', createdAt) as period, COUNT(*) as count FROM applications GROUP BY period ORDER BY period ASC`
          ).all() as D1Result<{ period: string; count: number }>;

          // Platform metrics
          const totalUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first() as { count: number };
          const totalStartups = await env.DB.prepare('SELECT COUNT(*) as count FROM startups').first() as { count: number };
          const totalApplications = await env.DB.prepare('SELECT COUNT(*) as count FROM applications').first() as { count: number };
          const totalMessages = await env.DB.prepare('SELECT COUNT(*) as count FROM messages').first() as { count: number };

          // Popular roles - fetch looking_for from startups and aggregate in application code
          const lookingForResult = await env.DB.prepare(
            "SELECT looking_for FROM startups WHERE looking_for IS NOT NULL AND looking_for != '[]'"
          ).all() as D1Result<{ looking_for: string }>;

          const roleCounts: Record<string, number> = {};
          for (const row of lookingForResult.results) {
            try {
              const roles = JSON.parse(row.looking_for);
              if (Array.isArray(roles)) {
                for (const role of roles) {
                  const title = typeof role === 'string' ? role : (role?.title || role?.role);
                  if (title && typeof title === 'string') {
                    roleCounts[title] = (roleCounts[title] || 0) + 1;
                  }
                }
              }
            } catch {
              // Skip malformed JSON entries
              continue;
            }
          }

          const popularRoles = Object.entries(roleCounts)
            .map(([role, count]) => ({ role, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          // Recent activity feed - UNION ALL from users, startups, applications
          const activityResult = await env.DB.prepare(`
            SELECT 'signup' as type, firstName || ' ' || lastName as description, createdAt as timestamp
            FROM users
            UNION ALL
            SELECT 'startup_created' as type, name as description, created_at as timestamp
            FROM startups
            UNION ALL
            SELECT 'application_submitted' as type, roleTitle as description, createdAt as timestamp
            FROM applications
            ORDER BY timestamp DESC
            LIMIT 20
          `).all() as D1Result<{ type: string; description: string; timestamp: string }>;

          return new Response(JSON.stringify({
            timeSeries: {
              signups: signupsResult.results || [],
              startups: startupsResult.results || [],
              applications: applicationsResult.results || [],
            },
            platformMetrics: {
              totalUsers: totalUsers?.count || 0,
              totalStartups: totalStartups?.count || 0,
              totalApplications: totalApplications?.count || 0,
              totalMessages: totalMessages?.count || 0,
            },
            popularRoles,
            recentActivity: activityResult.results || [],
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get admin analytics error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Admin: Delete startup
      if (path.startsWith('/api/admin/startups/') && request.method === 'DELETE') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const startupId = path.split('/api/admin/startups/')[1];

          // Verify the startup exists
          const startup = await env.DB.prepare(
            'SELECT id FROM startups WHERE id = ?'
          ).bind(startupId).first() as any;

          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Delete associated investors first
          await env.DB.prepare('DELETE FROM investors WHERE startup_id = ?').bind(startupId).run();

          // Delete the startup
          await env.DB.prepare('DELETE FROM startups WHERE id = ?').bind(startupId).run();

          return new Response(JSON.stringify({ message: 'Startup deleted successfully' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Admin delete startup error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Admin: Reject startup
      if (path.startsWith('/api/admin/reject/') && request.method === 'POST') {
        const adminAuth = await requireAdmin(request, env, corsHeaders);
        if (!adminAuth.authorized) {
          return adminAuth.response!;
        }

        try {
          const startupId = path.split('/api/admin/reject/')[1];

          const startup = await env.DB.prepare(
            'SELECT id, user_id, name, status FROM startups WHERE id = ?'
          ).bind(startupId).first() as { id: string; user_id: string; name: string; status: string } | null;

          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (startup.status !== 'pending_approval') {
            return new Response(JSON.stringify({ error: 'Startup is not pending approval' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          await env.DB.prepare(
            "UPDATE startups SET status = 'failed', updated_at = datetime('now') WHERE id = ?"
          ).bind(startupId).run();

          // Create notification for startup owner
          await createNotification(env.DB, {
            recipientId: startup.user_id,
            type: 'startup_rejected',
            referenceId: startupId,
            title: 'Startup Rejected',
            message: `Your startup ${startup.name} has been rejected`
          });

          return new Response(JSON.stringify({ message: 'Startup rejected successfully' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Reject startup error:', error);
          return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // POST /api/applications - Submit a role application (JWT protected)
      if (path === '/api/applications' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const applicantId = payload.userId;

        // Email verification guard
        const emailCheck = await requireEmailVerified(applicantId, env, corsHeaders);
        if (!emailCheck.verified) return emailCheck.response!;

        try {
          const body = await request.json() as {
            startupId?: string;
            roleTitle?: string;
            message?: string;
            highlightedSkills?: string[];
          };

          const { startupId, roleTitle, message, highlightedSkills } = body;

          // Validate required fields
          if (!startupId || !roleTitle || !message) {
            return new Response(JSON.stringify({ error: 'startupId, roleTitle, and message are required' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Validate message length (10-1000 chars after trimming)
          const trimmedMessage = message.trim();
          if (trimmedMessage.length < 10 || trimmedMessage.length > 1000) {
            return new Response(JSON.stringify({ error: 'Application message must be between 10 and 1000 characters' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Validate highlighted skills count (max 10)
          const skills = highlightedSkills || [];
          if (!Array.isArray(skills)) {
            return new Response(JSON.stringify({ error: 'highlightedSkills must be an array' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          if (skills.length > 10) {
            return new Response(JSON.stringify({ error: 'You can highlight a maximum of 10 skills' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Look up the startup from DB
          const startup = await env.DB.prepare(
            'SELECT id, user_id, status, looking_for FROM startups WHERE id = ?'
          ).bind(startupId).first() as { id: string; user_id: string; status: string; looking_for: string | null } | null;

          if (!startup) {
            return new Response(JSON.stringify({ error: 'Startup not found' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Check startup has status 'active' (approved startups have status 'active')
          if (startup.status !== 'active') {
            return new Response(JSON.stringify({ error: 'This startup is not currently accepting applications' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Prevent self-application
          if (applicantId === startup.user_id) {
            return new Response(JSON.stringify({ error: 'You cannot apply to your own startup\'s roles' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Parse the startup's looking_for JSON to find the role by title
          let lookingFor: any[] = [];
          try {
            lookingFor = JSON.parse(startup.looking_for || '[]');
          } catch {
            lookingFor = [];
          }

          // Roles can be plain strings OR rich objects with { title, description, skills, commitment }
          const role = lookingFor.find((r: any) => {
            if (typeof r === 'string') return r === roleTitle;
            return r.title === roleTitle;
          });

          if (!role) {
            return new Response(JSON.stringify({ error: 'The specified role does not exist on this startup' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Validate highlighted skills against the role's skill list (if role has skills defined)
          if (skills.length > 0) {
            const roleSkills: string[] = (typeof role === 'object' && Array.isArray(role.skills)) ? role.skills : [];
            if (roleSkills.length > 0) {
              const invalidSkills = skills.filter((s: string) => !roleSkills.includes(s));
              if (invalidSkills.length > 0) {
                return new Response(JSON.stringify({ error: 'Selected skills must be from the role\'s skill list' }), {
                  status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
              }
            }
          }

          // Prevent duplicate applications
          const existingApplication = await env.DB.prepare(
            'SELECT id FROM applications WHERE applicantId = ? AND startupId = ? AND roleTitle = ?'
          ).bind(applicantId, startupId, roleTitle).first();

          if (existingApplication) {
            return new Response(JSON.stringify({ error: 'You have already applied to this role' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Generate UUID and insert application record
          const applicationId = crypto.randomUUID();
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

          await env.DB.prepare(`
            INSERT INTO applications (id, applicantId, startupId, roleTitle, message, highlightedSkills, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
          `).bind(
            applicationId,
            applicantId,
            startupId,
            roleTitle,
            trimmedMessage,
            JSON.stringify(skills),
            now,
            now
          ).run();

          // Create notification for startup owner
          await createNotification(env.DB, {
            recipientId: startup.user_id,
            type: 'application_received',
            referenceId: applicationId,
            title: 'New Application Received',
            message: `Someone applied to ${roleTitle} on your startup`
          });

          return new Response(JSON.stringify({
            message: 'Application submitted successfully',
            application: {
              id: applicationId,
              startupId,
              roleTitle,
              status: 'pending',
              createdAt: now,
            }
          }), {
            status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Submit application error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/applications/received - List applications for creator's startups (JWT protected)
      if (path === '/api/applications/received' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          // Check if user owns any startups
          const ownedStartups = await env.DB.prepare(
            'SELECT id FROM startups WHERE user_id = ?'
          ).bind(userId).all() as D1Result<{ id: string }>;

          if (!ownedStartups.results || ownedStartups.results.length === 0) {
            return new Response(JSON.stringify({
              applications: [],
              pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
            }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Parse query parameters
          const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
          const roleTitle = url.searchParams.get('roleTitle') || null;
          const status = url.searchParams.get('status') || null;
          const pageSize = 20;
          const offset = (page - 1) * pageSize;

          // Build startup IDs list for the IN clause
          const startupIds = ownedStartups.results.map(s => s.id);
          const placeholders = startupIds.map(() => '?').join(', ');

          // Build WHERE conditions
          let whereConditions = `a.startupId IN (${placeholders})`;
          const bindParams: any[] = [...startupIds];

          if (roleTitle) {
            whereConditions += ' AND a.roleTitle = ?';
            bindParams.push(roleTitle);
          }

          if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
            whereConditions += ' AND a.status = ?';
            bindParams.push(status);
          }

          // Get total count
          const countQuery = `SELECT COUNT(*) as total FROM applications a WHERE ${whereConditions}`;
          const countResult = await env.DB.prepare(countQuery).bind(...bindParams).first() as { total: number } | null;
          const totalCount = countResult?.total || 0;
          const totalPages = Math.ceil(totalCount / pageSize);

          // Get paginated results with JOINs
          const dataQuery = `
            SELECT a.id, a.applicantId, a.startupId, a.roleTitle, a.message, a.highlightedSkills, a.status, a.createdAt, a.updatedAt,
                   u.firstName, u.lastName,
                   s.name as startupName
            FROM applications a
            JOIN users u ON a.applicantId = u.id
            JOIN startups s ON a.startupId = s.id
            WHERE ${whereConditions}
            ORDER BY a.createdAt DESC
            LIMIT ? OFFSET ?
          `;
          const dataParams = [...bindParams, pageSize, offset];
          const dataResult = await env.DB.prepare(dataQuery).bind(...dataParams).all() as D1Result<{
            id: string;
            applicantId: string;
            startupId: string;
            roleTitle: string;
            message: string;
            highlightedSkills: string;
            status: string;
            createdAt: string;
            updatedAt: string;
            firstName: string;
            lastName: string;
            startupName: string;
          }>;

          const applications = (dataResult.results || []).map(row => ({
            id: row.id,
            applicantId: row.applicantId,
            applicantName: `${row.firstName} ${row.lastName}`,
            startupId: row.startupId,
            startupName: row.startupName,
            roleTitle: row.roleTitle,
            message: row.message,
            highlightedSkills: (() => {
              try { return JSON.parse(row.highlightedSkills); } catch { return []; }
            })(),
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          }));

          return new Response(JSON.stringify({
            applications,
            pagination: {
              page,
              pageSize,
              totalCount,
              totalPages,
            }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get received applications error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/applications/mine - List applicant's own applications (JWT protected)
      if (path === '/api/applications/mine' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          const result = await env.DB.prepare(`
            SELECT a.id, a.applicantId, a.startupId, a.roleTitle, a.message, a.highlightedSkills, a.status, a.createdAt, a.updatedAt,
                   s.name AS startupName,
                   u.firstName || ' ' || u.lastName AS applicantName
            FROM applications a
            JOIN startups s ON a.startupId = s.id
            JOIN users u ON a.applicantId = u.id
            WHERE a.applicantId = ?
            ORDER BY a.createdAt DESC
            LIMIT 100
          `).bind(userId).all();

          const applications = (result.results || []).map((row: any) => ({
            id: row.id,
            applicantId: row.applicantId,
            applicantName: row.applicantName || '',
            startupId: row.startupId,
            startupName: row.startupName || '',
            roleTitle: row.roleTitle,
            message: row.message,
            highlightedSkills: (() => {
              try {
                return JSON.parse(row.highlightedSkills || '[]');
              } catch {
                return [];
              }
            })(),
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          }));

          return new Response(JSON.stringify({ applications }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get my applications error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // PATCH /api/applications/:id/status - Accept or reject an application (JWT protected, creator only)
      if (path.startsWith('/api/applications/') && path.endsWith('/status') && request.method === 'PATCH') {
        const applicationId = path.replace('/api/applications/', '').replace('/status', '');

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          const body = await request.json() as { status?: string };
          const { status } = body;

          // Validate status value
          if (!status || (status !== 'accepted' && status !== 'rejected')) {
            return new Response(JSON.stringify({ error: 'Status must be "accepted" or "rejected"' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Look up the application
          const application = await env.DB.prepare(
            'SELECT id, applicantId, startupId, roleTitle, status, createdAt, updatedAt FROM applications WHERE id = ?'
          ).bind(applicationId).first() as { id: string; applicantId: string; startupId: string; roleTitle: string; status: string; createdAt: string; updatedAt: string } | null;

          if (!application) {
            return new Response(JSON.stringify({ error: 'Application not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Verify the authenticated user owns the startup associated with the application
          const startup = await env.DB.prepare(
            'SELECT id, user_id FROM startups WHERE id = ?'
          ).bind(application.startupId).first() as { id: string; user_id: string } | null;

          if (!startup || startup.user_id !== userId) {
            return new Response(JSON.stringify({ error: 'You do not have permission to manage these applications' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Check if application status is already decided
          if (application.status === 'accepted' || application.status === 'rejected') {
            return new Response(JSON.stringify({ error: 'This application has already been decided' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Update the application status and updatedAt timestamp
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

          await env.DB.prepare(
            'UPDATE applications SET status = ?, updatedAt = ? WHERE id = ?'
          ).bind(status, now, applicationId).run();

          // Create notification for the applicant
          if (status === 'accepted') {
            await createNotification(env.DB, {
              recipientId: application.applicantId,
              type: 'application_accepted',
              referenceId: applicationId,
              title: 'Application Accepted',
              message: `Your application to ${application.roleTitle} has been accepted`
            });
          } else if (status === 'rejected') {
            await createNotification(env.DB, {
              recipientId: application.applicantId,
              type: 'application_rejected',
              referenceId: applicationId,
              title: 'Application Rejected',
              message: `Your application to ${application.roleTitle} has been rejected`
            });
          }

          return new Response(JSON.stringify({
            message: 'Application status updated',
            application: {
              id: applicationId,
              status,
              updatedAt: now,
            }
          }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Update application status error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/notifications/unread-count - Get unread notification count (JWT protected)
      if (path === '/api/notifications/unread-count' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          const userId = payload.userId;
          const result = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM notifications WHERE recipientId = ? AND isRead = 0'
          ).bind(userId).first() as { count: number } | null;

          return new Response(JSON.stringify({ unreadCount: Number(result?.count ?? 0) }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get unread count error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // POST /api/notifications/mark-all-read - Mark all notifications as read (JWT protected)
      if (path === '/api/notifications/mark-all-read' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          const userId = payload.userId;
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
          const result = await env.DB.prepare(
            'UPDATE notifications SET isRead = 1, updatedAt = ? WHERE recipientId = ? AND isRead = 0'
          ).bind(now, userId).run();

          return new Response(JSON.stringify({
            message: 'All notifications marked as read',
            updatedCount: result.meta?.changes ?? 0
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Mark all read error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/notifications - List notifications for authenticated user (JWT protected)
      if (path === '/api/notifications' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          const userId = payload.userId;
          let page = parseInt(url.searchParams.get('page') || '1', 10);
          let pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

          // Validate and clamp parameters
          if (isNaN(page) || page < 1) page = 1;
          if (isNaN(pageSize) || pageSize < 1) pageSize = 20;
          if (pageSize > 20) pageSize = 20;

          const offset = (page - 1) * pageSize;

          // Get total count
          const countResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM notifications WHERE recipientId = ?'
          ).bind(userId).first() as { count: number } | null;
          const totalCount = Number(countResult?.count ?? 0);
          const totalPages = Math.ceil(totalCount / pageSize);

          // Get paginated notifications
          const notificationsResult = await env.DB.prepare(
            'SELECT id, recipientId, type, referenceId, title, message, isRead, createdAt, updatedAt FROM notifications WHERE recipientId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?'
          ).bind(userId, pageSize, offset).all() as D1Result<{ id: string; recipientId: string; type: string; referenceId: string; title: string; message: string; isRead: number; createdAt: string; updatedAt: string }>;

          const notifications = (notificationsResult.results || []).map((n) => ({
            id: n.id,
            recipientId: n.recipientId,
            type: n.type,
            referenceId: n.referenceId,
            title: n.title,
            message: n.message,
            isRead: n.isRead === 1,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
          }));

          return new Response(JSON.stringify({
            notifications,
            pagination: { page, pageSize, totalCount, totalPages }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get notifications error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // PATCH /api/notifications/:id/read - Mark a single notification as read (JWT protected)
      if (path.startsWith('/api/notifications/') && path.endsWith('/read') && request.method === 'PATCH') {
        const notificationId = path.replace('/api/notifications/', '').replace('/read', '');

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          const userId = payload.userId;

          // Look up the notification
          const notification = await env.DB.prepare(
            'SELECT id, recipientId, isRead FROM notifications WHERE id = ?'
          ).bind(notificationId).first() as { id: string; recipientId: string; isRead: number } | null;

          if (!notification) {
            return new Response(JSON.stringify({ error: 'Notification not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Verify ownership
          if (notification.recipientId !== userId) {
            return new Response(JSON.stringify({ error: 'You do not have permission to access this notification' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Update isRead and updatedAt
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
          await env.DB.prepare(
            'UPDATE notifications SET isRead = 1, updatedAt = ? WHERE id = ?'
          ).bind(now, notificationId).run();

          return new Response(JSON.stringify({
            message: 'Notification marked as read',
            notification: { id: notificationId, isRead: true, updatedAt: now }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Mark notification read error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/messages/unread-count - Get total unread message count (JWT protected)
      if (path === '/api/messages/unread-count' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          const result = await env.DB.prepare(`
            SELECT COUNT(*) as unreadCount
            FROM messages m
            JOIN conversations c ON m.conversationId = c.id
            WHERE (c.participant1Id = ? OR c.participant2Id = ?)
              AND m.senderId != ?
              AND m.isRead = 0
          `).bind(userId, userId, userId).first() as { unreadCount: number } | null;

          return new Response(JSON.stringify({
            unreadCount: result?.unreadCount ?? 0
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Unread count error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/messages/conversations - List user's conversations (JWT protected)
      if (path === '/api/messages/conversations' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          // Query all conversations where user is a participant
          const conversationsResult = await env.DB.prepare(`
            SELECT c.id, c.participant1Id, c.participant2Id, c.lastMessage, c.lastActivityAt
            FROM conversations c
            WHERE c.participant1Id = ? OR c.participant2Id = ?
            ORDER BY c.lastActivityAt DESC
          `).bind(userId, userId).all() as D1Result<{
            id: string; participant1Id: string; participant2Id: string; lastMessage: string; lastActivityAt: string;
          }>;

          const conversations = [];

          for (const conv of conversationsResult.results || []) {
            // Determine the other participant
            const otherParticipantId = conv.participant1Id === userId
              ? conv.participant2Id
              : conv.participant1Id;

            // Get other participant's info
            const otherUser = await env.DB.prepare(
              'SELECT id, firstName, lastName, avatar FROM users WHERE id = ?'
            ).bind(otherParticipantId).first() as { id: string; firstName: string; lastName: string; avatar: string | null } | null;

            // Calculate unread count for this conversation
            const unreadResult = await env.DB.prepare(
              'SELECT COUNT(*) as unreadCount FROM messages WHERE conversationId = ? AND senderId != ? AND isRead = 0'
            ).bind(conv.id, userId).first() as { unreadCount: number } | null;

            conversations.push({
              id: conv.id,
              participantId: otherParticipantId,
              participantName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}`.trim() : 'Unknown User',
              participantAvatar: otherUser?.avatar || '',
              lastMessage: conv.lastMessage || '',
              lastActivityAt: conv.lastActivityAt,
              unreadCount: unreadResult?.unreadCount ?? 0,
            });
          }

          return new Response(JSON.stringify({ conversations }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get conversations error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // PATCH /api/messages/conversations/:id/read - Mark conversation messages as read (JWT protected)
      if (path.startsWith('/api/messages/conversations/') && path.endsWith('/read') && request.method === 'PATCH') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          // Extract conversationId from path: /api/messages/conversations/:id/read
          const pathParts = path.split('/');
          const conversationId = pathParts[pathParts.length - 2]; // second to last segment

          // Verify conversation exists and user is a participant
          const conversation = await env.DB.prepare(
            'SELECT id, participant1Id, participant2Id FROM conversations WHERE id = ?'
          ).bind(conversationId).first() as { id: string; participant1Id: string; participant2Id: string } | null;

          if (!conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            return new Response(JSON.stringify({ error: 'You are not a participant in this conversation' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Mark all messages from the other participant as read
          const result = await env.DB.prepare(
            'UPDATE messages SET isRead = 1 WHERE conversationId = ? AND senderId != ? AND isRead = 0'
          ).bind(conversationId, userId).run();

          const updatedCount = result.meta?.changes ?? 0;

          return new Response(JSON.stringify({
            message: 'Messages marked as read',
            updatedCount
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Mark as read error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/messages/conversations/:id - Get messages in a conversation (JWT protected)
      if (path.startsWith('/api/messages/conversations/') && !path.endsWith('/read') && !path.includes('unread-count') && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          // Extract conversationId from path: /api/messages/conversations/:id
          const conversationId = path.split('/').pop()!;

          // Verify conversation exists and user is a participant
          const conversation = await env.DB.prepare(
            'SELECT id, participant1Id, participant2Id FROM conversations WHERE id = ?'
          ).bind(conversationId).first() as { id: string; participant1Id: string; participant2Id: string } | null;

          if (!conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            return new Response(JSON.stringify({ error: 'You are not a participant in this conversation' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Determine the other participant
          const otherParticipantId = conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

          // Get other participant's info
          const otherUser = await env.DB.prepare(
            'SELECT id, firstName, lastName, avatar FROM users WHERE id = ?'
          ).bind(otherParticipantId).first() as { id: string; firstName: string; lastName: string; avatar: string | null } | null;

          // Get all messages in the conversation ordered by createdAt ASC
          const messagesResult = await env.DB.prepare(`
            SELECT m.id, m.senderId, m.content, m.isRead, m.createdAt,
                   u.firstName, u.lastName
            FROM messages m
            JOIN users u ON m.senderId = u.id
            WHERE m.conversationId = ?
            ORDER BY m.createdAt ASC
          `).bind(conversationId).all() as D1Result<{
            id: string; senderId: string; content: string; isRead: number; createdAt: string;
            firstName: string; lastName: string;
          }>;

          const messages = (messagesResult.results || []).map(m => ({
            id: m.id,
            senderId: m.senderId,
            senderName: `${m.firstName} ${m.lastName}`.trim(),
            content: m.content,
            isRead: m.isRead === 1,
            createdAt: m.createdAt,
          }));

          return new Response(JSON.stringify({
            conversation: {
              id: conversation.id,
              participantId: otherParticipantId,
              participantName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}`.trim() : 'Unknown User',
              participantAvatar: otherUser?.avatar || '',
            },
            messages,
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get conversation messages error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // POST /api/messages - Send a direct message (JWT protected)
      if (path === '/api/messages' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const senderId = payload.userId;

        // Email verification guard
        const emailCheck = await requireEmailVerified(senderId, env, corsHeaders);
        if (!emailCheck.verified) return emailCheck.response!;

        try {
          const body = await request.json() as { recipientId?: string; content?: string };
          const { recipientId, content } = body;

          // Validate content
          if (!content || typeof content !== 'string') {
            return new Response(JSON.stringify({ error: 'Message must be between 1 and 2000 characters' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const trimmedContent = content.trim();
          if (trimmedContent.length === 0 || trimmedContent.length > 2000) {
            return new Response(JSON.stringify({ error: 'Message must be between 1 and 2000 characters' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Validate recipientId is provided
          if (!recipientId || typeof recipientId !== 'string') {
            return new Response(JSON.stringify({ error: 'Recipient user not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Prevent self-messaging
          if (senderId === recipientId) {
            return new Response(JSON.stringify({ error: 'You cannot send messages to yourself' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Validate recipient exists
          const recipient = await env.DB.prepare(
            'SELECT id FROM users WHERE id = ?'
          ).bind(recipientId).first() as { id: string } | null;

          if (!recipient) {
            return new Response(JSON.stringify({ error: 'Recipient user not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Check connection between sender and recipient
          const isConnected = await checkConnection(env.DB, senderId, recipientId);
          if (!isConnected) {
            return new Response(JSON.stringify({ error: 'You can only message users you are connected with' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Find or create conversation
          const participant1Id = senderId < recipientId ? senderId : recipientId;
          const participant2Id = senderId < recipientId ? recipientId : senderId;

          let conversationId: string;

          const existingConversation = await env.DB.prepare(
            'SELECT id FROM conversations WHERE participant1Id = ? AND participant2Id = ?'
          ).bind(participant1Id, participant2Id).first() as { id: string } | null;

          if (existingConversation) {
            conversationId = existingConversation.id;
          } else {
            conversationId = crypto.randomUUID();
            const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
            await env.DB.prepare(
              'INSERT INTO conversations (id, participant1Id, participant2Id, lastMessage, lastActivityAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(conversationId, participant1Id, participant2Id, '', now, now).run();
          }

          // Insert message
          const messageId = crypto.randomUUID();
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

          await env.DB.prepare(
            'INSERT INTO messages (id, conversationId, senderId, content, isRead, createdAt) VALUES (?, ?, ?, ?, 0, ?)'
          ).bind(messageId, conversationId, senderId, trimmedContent, now).run();

          // Update conversation with last message and activity
          const lastMessagePreview = trimmedContent.substring(0, 50);
          await env.DB.prepare(
            'UPDATE conversations SET lastMessage = ?, lastActivityAt = ? WHERE id = ?'
          ).bind(lastMessagePreview, now, conversationId).run();

          // Create notification for recipient
          await createNotification(env.DB, {
            recipientId,
            type: 'new_message',
            referenceId: conversationId,
            title: 'New Message',
            message: 'You have a new message'
          });

          return new Response(JSON.stringify({
            message: 'Message sent successfully',
            data: {
              id: messageId,
              conversationId,
              senderId,
              content: trimmedContent,
              isRead: false,
              createdAt: now,
            }
          }), {
            status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Send message error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/messages/unread-count - Get total unread message count (JWT protected)
      if (path === '/api/messages/unread-count' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          const result = await env.DB.prepare(`
            SELECT COUNT(*) as unreadCount
            FROM messages m
            JOIN conversations c ON m.conversationId = c.id
            WHERE (c.participant1Id = ? OR c.participant2Id = ?)
              AND m.senderId != ?
              AND m.isRead = 0
          `).bind(userId, userId, userId).first() as { unreadCount: number } | null;

          return new Response(JSON.stringify({ unreadCount: result?.unreadCount ?? 0 }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Unread count error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/messages/conversations - List user's conversations (JWT protected)
      if (path === '/api/messages/conversations' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          const result = await env.DB.prepare(`
            SELECT
              c.id,
              c.participant1Id,
              c.participant2Id,
              c.lastMessage,
              c.lastActivityAt,
              CASE WHEN c.participant1Id = ? THEN c.participant2Id ELSE c.participant1Id END as participantId,
              CASE WHEN c.participant1Id = ? THEN (u2.firstName || ' ' || u2.lastName) ELSE (u1.firstName || ' ' || u1.lastName) END as participantName,
              CASE WHEN c.participant1Id = ? THEN u2.avatar ELSE u1.avatar END as participantAvatar,
              (SELECT COUNT(*) FROM messages m WHERE m.conversationId = c.id AND m.senderId != ? AND m.isRead = 0) as unreadCount
            FROM conversations c
            LEFT JOIN users u1 ON c.participant1Id = u1.id
            LEFT JOIN users u2 ON c.participant2Id = u2.id
            WHERE c.participant1Id = ? OR c.participant2Id = ?
            ORDER BY c.lastActivityAt DESC
          `).bind(userId, userId, userId, userId, userId, userId).all() as D1Result<{
            id: string;
            participant1Id: string;
            participant2Id: string;
            lastMessage: string;
            lastActivityAt: string;
            participantId: string;
            participantName: string;
            participantAvatar: string | null;
            unreadCount: number;
          }>;

          const conversations = (result.results || []).map(row => ({
            id: row.id,
            participantId: row.participantId,
            participantName: row.participantName || '',
            participantAvatar: row.participantAvatar || '',
            lastMessage: row.lastMessage || '',
            lastActivityAt: row.lastActivityAt,
            unreadCount: row.unreadCount || 0,
          }));

          return new Response(JSON.stringify({ conversations }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get conversations error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // PATCH /api/messages/conversations/:id/read - Mark conversation messages as read (JWT protected)
      if (path.startsWith('/api/messages/conversations/') && path.endsWith('/read') && request.method === 'PATCH') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;
        // Extract conversation ID from path: /api/messages/conversations/:id/read
        const pathParts = path.split('/');
        const conversationId = pathParts[pathParts.length - 2]; // second to last segment

        try {
          // Look up conversation
          const conversation = await env.DB.prepare(
            'SELECT id, participant1Id, participant2Id FROM conversations WHERE id = ?'
          ).bind(conversationId).first() as { id: string; participant1Id: string; participant2Id: string } | null;

          if (!conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Verify user is a participant
          if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            return new Response(JSON.stringify({ error: 'You are not a participant in this conversation' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Mark messages as read (only messages from the other participant)
          const result = await env.DB.prepare(
            'UPDATE messages SET isRead = 1 WHERE conversationId = ? AND senderId != ? AND isRead = 0'
          ).bind(conversationId, userId).run();

          const updatedCount = result.meta?.changes ?? 0;

          return new Response(JSON.stringify({ message: 'Messages marked as read', updatedCount }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Mark as read error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/messages/conversations/:id - Get messages in a conversation (JWT protected)
      if (path.startsWith('/api/messages/conversations/') && !path.endsWith('/read') && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;
        // Extract conversation ID from path: /api/messages/conversations/:id
        const conversationId = path.split('/').pop()!;

        try {
          // Look up conversation
          const conversation = await env.DB.prepare(
            'SELECT id, participant1Id, participant2Id FROM conversations WHERE id = ?'
          ).bind(conversationId).first() as { id: string; participant1Id: string; participant2Id: string } | null;

          if (!conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Verify user is a participant
          if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            return new Response(JSON.stringify({ error: 'You are not a participant in this conversation' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Get the other participant's info
          const otherParticipantId = conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

          const otherUser = await env.DB.prepare(
            'SELECT id, firstName, lastName, avatar FROM users WHERE id = ?'
          ).bind(otherParticipantId).first() as { id: string; firstName: string; lastName: string; avatar: string | null } | null;

          // Query all messages in the conversation ordered by createdAt ASC
          const messagesResult = await env.DB.prepare(`
            SELECT m.id, m.senderId, m.content, m.isRead, m.createdAt,
                   (u.firstName || ' ' || u.lastName) as senderName
            FROM messages m
            LEFT JOIN users u ON m.senderId = u.id
            WHERE m.conversationId = ?
            ORDER BY m.createdAt ASC
          `).bind(conversationId).all() as D1Result<{
            id: string;
            senderId: string;
            content: string;
            isRead: number;
            createdAt: string;
            senderName: string;
          }>;

          const messages = (messagesResult.results || []).map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.senderName || '',
            content: msg.content,
            isRead: msg.isRead === 1,
            createdAt: msg.createdAt,
          }));

          return new Response(JSON.stringify({
            conversation: {
              id: conversation.id,
              participantId: otherParticipantId,
              participantName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : '',
              participantAvatar: otherUser?.avatar || '',
            },
            messages,
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get conversation messages error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // PUT /api/users/me/profile - Update authenticated user's profile
      if (path === '/api/users/me/profile' && request.method === 'PUT') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const token = authHeader.slice(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const userId = payload.userId;

        try {
          const body = await request.json() as {
            bio?: string;
            skills?: string[];
            experience?: string;
            avatarUrl?: string;
            linkedinUrl?: string;
          };

          // Validation
          if (body.bio !== undefined && body.bio.length > 2000) {
            return new Response(JSON.stringify({ error: 'Bio must be 2000 characters or fewer' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (body.experience !== undefined && body.experience.length > 5000) {
            return new Response(JSON.stringify({ error: 'Experience must be 5000 characters or fewer' }), {
              status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (body.avatarUrl !== undefined && body.avatarUrl !== '' && body.avatarUrl !== null) {
            if (!body.avatarUrl.startsWith('http://') && !body.avatarUrl.startsWith('https://')) {
              return new Response(JSON.stringify({ error: 'Avatar URL must be a valid URL' }), {
                status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
          }

          if (body.linkedinUrl !== undefined && body.linkedinUrl !== '' && body.linkedinUrl !== null) {
            if (!body.linkedinUrl.startsWith('https://linkedin.com/') && !body.linkedinUrl.startsWith('https://www.linkedin.com/')) {
              return new Response(JSON.stringify({ error: 'LinkedIn URL must start with https://linkedin.com/ or https://www.linkedin.com/' }), {
                status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
          }

          if (body.skills !== undefined) {
            if (!Array.isArray(body.skills)) {
              return new Response(JSON.stringify({ error: 'Skills must be an array of strings' }), {
                status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
            if (body.skills.length > 30) {
              return new Response(JSON.stringify({ error: 'Skills must have at most 30 items' }), {
                status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
            for (const skill of body.skills) {
              if (typeof skill !== 'string' || skill.length > 50) {
                return new Response(JSON.stringify({ error: 'Each skill must be a string of at most 50 characters' }), {
                  status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
              }
            }
          }

          // Build dynamic UPDATE query for only provided fields
          const setClauses: string[] = [];
          const bindValues: any[] = [];

          if (body.bio !== undefined) {
            setClauses.push('bio = ?');
            bindValues.push(body.bio);
          }
          if (body.skills !== undefined) {
            setClauses.push('skills = ?');
            bindValues.push(JSON.stringify(body.skills));
          }
          if (body.experience !== undefined) {
            setClauses.push('experience = ?');
            bindValues.push(body.experience);
          }
          if (body.avatarUrl !== undefined) {
            setClauses.push('avatarUrl = ?');
            bindValues.push(body.avatarUrl);
          }
          if (body.linkedinUrl !== undefined) {
            setClauses.push('linkedinUrl = ?');
            bindValues.push(body.linkedinUrl);
          }

          if (setClauses.length > 0) {
            setClauses.push("updatedAt = datetime('now')");
            const updateQuery = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
            bindValues.push(userId);
            await env.DB.prepare(updateQuery).bind(...bindValues).run();
          }

          // Fetch updated user profile
          const updatedUser = await env.DB.prepare(
            'SELECT id, firstName, lastName, bio, skills, experience, avatarUrl, linkedinUrl, roles FROM users WHERE id = ?'
          ).bind(userId).first() as any;

          let skills: string[] = [];
          try { skills = updatedUser.skills ? JSON.parse(updatedUser.skills) : []; } catch { skills = []; }
          let roles: string[] = [];
          try { roles = updatedUser.roles ? JSON.parse(updatedUser.roles) : []; } catch { roles = []; }

          return new Response(JSON.stringify({
            message: 'Profile updated successfully',
            user: {
              id: updatedUser.id,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              bio: updatedUser.bio || null,
              skills,
              experience: updatedUser.experience || null,
              avatarUrl: updatedUser.avatarUrl || null,
              linkedinUrl: updatedUser.linkedinUrl || null,
              roles,
            }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Update profile error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // GET /api/users/:id/profile - Public user profile (no auth required)
      if (path.startsWith('/api/users/') && path.endsWith('/profile') && request.method === 'GET') {
        const userId = path.replace('/api/users/', '').replace('/profile', '');

        if (!userId || !env.DB) {
          return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        try {
          // Fetch user profile data
          const user = await env.DB.prepare(
            'SELECT id, firstName, lastName, bio, skills, experience, avatarUrl, linkedinUrl, roles, createdAt FROM users WHERE id = ?'
          ).bind(userId).first() as any;

          if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
              status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Parse JSON fields
          let skills: string[] = [];
          try { skills = user.skills ? JSON.parse(user.skills) : []; } catch { skills = []; }
          let roles: string[] = [];
          try { roles = user.roles ? JSON.parse(user.roles) : []; } catch { roles = []; }

          // Fetch startups created by this user
          const createdStartupsResult = await env.DB.prepare(
            'SELECT id, name, stage, status FROM startups WHERE user_id = ?'
          ).bind(userId).all() as D1Result<{ id: string; name: string; stage: string; status: string }>;

          // Fetch startups where user is an accepted team member
          const memberOfResult = await env.DB.prepare(
            'SELECT s.id, s.name, a.roleTitle FROM applications a JOIN startups s ON a.startupId = s.id WHERE a.applicantId = ? AND a.status = \'accepted\''
          ).bind(userId).all() as D1Result<{ id: string; name: string; roleTitle: string }>;

          return new Response(JSON.stringify({
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              bio: user.bio || null,
              skills,
              experience: user.experience || null,
              avatarUrl: user.avatarUrl || null,
              linkedinUrl: user.linkedinUrl || null,
              roles,
              createdAt: user.createdAt,
            },
            startups: {
              created: createdStartupsResult.results || [],
              memberOf: (memberOfResult.results || []).map(m => ({
                id: m.id,
                name: m.name,
                roleTitle: m.roleTitle,
              })),
            }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (error) {
          console.error('Get user profile error:', error);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};