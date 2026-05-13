#!/bin/bash
# Cloudflare Workers Setup Script for KolaboLab

echo "🚀 Setting up Cloudflare Workers infrastructure..."

# Create D1 databases
echo "📊 Creating D1 databases..."
wrangler d1 create kolabolab-production
wrangler d1 create kolabolab-staging

# Create KV namespaces
echo "🗄️ Creating KV namespaces..."
wrangler kv:namespace create "CACHE" --preview
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --env staging --preview
wrangler kv:namespace create "CACHE" --env staging

# Create R2 buckets
echo "📦 Creating R2 buckets..."
wrangler r2 bucket create kolabolab-uploads
wrangler r2 bucket create kolabolab-uploads-staging

echo "✅ Cloudflare resources created!"
echo ""
echo "📝 Next steps:"
echo "1. Update wrangler.toml with the generated IDs"
echo "2. Set secrets using: wrangler secret put [SECRET_NAME]"
echo "3. Deploy with: wrangler deploy --env staging"