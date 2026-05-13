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
        
        // Mock authentication
        if (body.email === 'test@example.com' && body.password === 'Test123!@') {
          return new Response(JSON.stringify({
            message: 'Login successful',
            user: {
              id: 'test-user-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User'
            },
            tokens: {
              accessToken: 'test-access-token',
              refreshToken: 'test-refresh-token'
            }
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } else if (body.email === 'admin@kolabolab.com' && body.password === 'KolaboLabAdmin2024!') {
          return new Response(JSON.stringify({
            message: 'Login successful',
            user: {
              id: 'admin-user-1',
              email: 'admin@kolabolab.com',
              firstName: 'Admin',
              lastName: 'User'
            },
            tokens: {
              accessToken: 'admin-access-token',
              refreshToken: 'admin-refresh-token'
            }
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } else {
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
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
        
        return new Response(JSON.stringify({
          message: 'User registered successfully',
          user: {
            id: 'new-user-' + Date.now(),
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
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
          const result = await env.DB.prepare(`
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
          
          return new Response(JSON.stringify({
            message: 'Database initialized successfully',
            result: result.success
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
          let user;
          if (env.DB) {
            try {
              // Check if user exists
              const existingUser = await env.DB.prepare(
                'SELECT * FROM users WHERE email = ?'
              ).bind(googleUser.email).first();
              
              if (existingUser) {
                // Update existing user
                user = existingUser;
                console.log('Found existing user:', user.email);
              } else {
                // Create new user
                const userId = crypto.randomUUID();
                console.log('Creating new user:', googleUser.email);
                await env.DB.prepare(`
                  INSERT INTO users (id, email, firstName, lastName, avatar, isVerified, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
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
                  isVerified: 1
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
                isVerified: 1
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
              isVerified: 1
            };
            console.log('Using fallback user (no DB):', user.email);
          }
          
          // Create JWT tokens
          console.log('Creating JWT tokens for user:', user.email);
          const accessToken = await createJWT({
            userId: user.id,
            email: user.email,
            type: 'access'
          }, env.JWT_SECRET || 'fallback-secret', '1h');
          
          const refreshToken = await createJWT({
            userId: user.id,
            email: user.email,
            type: 'refresh'
          }, env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', '7d');
          
          // Encode user data for frontend
          const userData = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            roles: ['entrepreneur'],
            isEmailVerified: true
          }));
          
          console.log('Redirecting to frontend with tokens');
          // Redirect to frontend with tokens
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(
            `${frontendUrl}/auth/callback?token=${userData}&refresh=${refreshToken}`,
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
              ).bind(linkedinUser.email).first();
              
              if (existingUser) {
                user = existingUser;
              } else {
                const userId = crypto.randomUUID();
                await env.DB.prepare(`
                  INSERT INTO users (id, email, firstName, lastName, avatar, isVerified, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
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
              };
            }
          } else {
            user = {
              id: `linkedin_${linkedinUser.sub}`,
              email: linkedinUser.email,
              firstName: linkedinUser.given_name || linkedinUser.name?.split(' ')[0] || 'User',
              lastName: linkedinUser.family_name || linkedinUser.name?.split(' ').slice(1).join(' ') || '',
              avatar: linkedinUser.picture || '',
            };
          }
          
          // Create JWT tokens
          const accessToken = await createJWT({
            userId: user.id, email: user.email, type: 'access'
          }, env.JWT_SECRET || 'fallback-secret', '1h');
          
          const refreshToken = await createJWT({
            userId: user.id, email: user.email, type: 'refresh'
          }, env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', '7d');
          
          const userData = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            roles: ['entrepreneur'],
            isEmailVerified: true
          }));
          
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(
            `${frontendUrl}/auth/callback?token=${userData}&refresh=${refreshToken}`,
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
              ).bind(email).first();
              
              if (existingUser) {
                user = existingUser;
              } else {
                const userId = crypto.randomUUID();
                await env.DB.prepare(`
                  INSERT INTO users (id, email, firstName, lastName, avatar, isVerified, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
                `).bind(userId, email, firstName, lastName, githubUser.avatar_url || '').run();
                
                user = { id: userId, email, firstName, lastName, avatar: githubUser.avatar_url || '' };
              }
            } catch (dbError) {
              console.error('GitHub DB error:', dbError);
              user = { id: `github_${githubUser.id}`, email, firstName, lastName, avatar: githubUser.avatar_url || '' };
            }
          } else {
            user = { id: `github_${githubUser.id}`, email, firstName, lastName, avatar: githubUser.avatar_url || '' };
          }
          
          // Create JWT tokens
          const accessToken = await createJWT({
            userId: user.id, email: user.email, type: 'access'
          }, env.JWT_SECRET || 'fallback-secret', '1h');
          
          const refreshToken = await createJWT({
            userId: user.id, email: user.email, type: 'refresh'
          }, env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', '7d');
          
          const userData = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            roles: ['entrepreneur'],
            isEmailVerified: true
          }));
          
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(
            `${frontendUrl}/auth/callback?token=${userData}&refresh=${refreshToken}`,
            302
          );
          
        } catch (error) {
          console.error('GitHub OAuth callback error:', error);
          const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
          return Response.redirect(`${frontendUrl}/auth/callback?error=oauth_failed`, 302);
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