#!/bin/bash
# Simple VPS Deployment - Run this on your VPS

set -e

echo "🚀 Deploying 87 Command Center..."

# Go to project
cd ~/openclaw-mission-control || git clone https://github.com/EightSeven-maker/openclaw-mission-control.git ~/openclaw-mission-control

# Pull
cd ~/openclaw-mission-control
git pull origin main 2>/dev/null || git pull

# Install & Build
npm install --silent 2>/dev/null
npm run build 2>/dev/null

# Start with PM2
pm2 delete openclaw-dashboard 2>/dev/null || true
pm2 start npm --name "openclaw-dashboard" -- run start -- -p 3336 -H 0.0.0.0

# Save
pm2 save

echo "✅ DONE! Dashboard at http://$(hostname -I | awk '{print $1}'):3336"
pm2 status