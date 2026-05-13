#!/bin/bash

# Deploy script for Cloudflare Workers
echo "🚀 Starting Cloudflare Workers deployment..."

# Step 1: Build frontend
echo "📦 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Step 2: Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci
cd ..

# Step 3: Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
npx wrangler deploy --env staging

echo "✅ Deployment complete!"