// Simple Cloudflare Workers compatible entry point
import { Hono } from 'hono';
import { cors } from 'hono/cors';

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

// Health check endpoints
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: c.env?.NODE_ENV || 'development'
  });
});

app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: c.env?.NODE_ENV || 'development'
  });
});

// Simple auth endpoints for testing
app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Mock authentication for testing
    if (email === 'test@example.com' && password === 'Test123!@') {
      return c.json({
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
      });
    } else if (email === 'admin@kolabolab.com' && password === 'KolaboLabAdmin2024!') {
      return c.json({
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
      });
    } else {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/auth/register', async (c) => {
  try {
    const { email, password, firstName, lastName } = await c.req.json();
    
    if (!email || !password || !firstName || !lastName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Mock registration
    return c.json({
      message: 'User registered successfully',
      user: {
        id: 'new-user-' + Date.now(),
        email,
        firstName,
        lastName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Database initialization
app.get('/api/init-db', async (c) => {
  try {
    if (!c.env?.DB) {
      return c.json({ error: 'Database not available' }, 500);
    }

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

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'KolaboLab API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Export for Cloudflare Workers
export default {
  fetch: app.fetch.bind(app)
};