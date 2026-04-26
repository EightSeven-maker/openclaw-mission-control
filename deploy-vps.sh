#!/bin/bash

# 87 Command Center - Deployment Script
# Run this on VPS to deploy/update the dashboard

set -e

echo "🚀 Starting deployment..."

# Navigate to project directory
cd ~/openclaw-mission-control || exit 1

# Configure git (if not already set)
git config --global pull.rebase false

# Pull latest changes from GitHub
echo "📥 Pulling latest from GitHub..."
git pull origin main

# Install dependencies if needed
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Restart the dashboard with pm2
echo "🔄 Restarting services..."

# Stop existing dashboard if running
pm2 delete openclaw-dashboard 2>/dev/null || true

# Start the dashboard on port 3336
pm2 start npm --name "openclaw-dashboard" -- run start -- -p 3336 -H 0.0.0.0

# Save pm2 config for auto-restart on reboot
pm2 save

echo "✅ Deployment complete!"
echo "🌐 Dashboard running at http://$(hostname -I | awk '{print $1}'):3336"