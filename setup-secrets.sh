#!/bin/bash
# Set up Cloudflare Workers secrets

echo "🔐 Setting up Cloudflare Workers secrets..."

# JWT secrets
wrangler secret put JWT_SECRET --env staging
wrangler secret put JWT_REFRESH_SECRET --env staging

# Database password (if using external PostgreSQL)
# wrangler secret put DB_PASSWORD --env staging

# OAuth secrets
wrangler secret put GOOGLE_CLIENT_SECRET --env staging
wrangler secret put LINKEDIN_CLIENT_SECRET --env staging
wrangler secret put GITHUB_CLIENT_SECRET --env staging

# Email service
wrangler secret put RESEND_API_KEY --env staging

# Cloudinary (for file uploads)
wrangler secret put CLOUDINARY_API_SECRET --env staging

echo "✅ Secrets setup complete!"
echo ""
echo "📝 Example values to use:"
echo "JWT_SECRET: $(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET: $(openssl rand -hex 32)"
echo "RESEND_API_KEY: re_42YG11w7_EX9taMbRS5xCcHehmr1HW3ZL"
