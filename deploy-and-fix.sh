#!/bin/bash

# 87 Command Center - Diagnostic & Fix Script
# Run this on VPS to diagnose and fix issues

echo "🔍 87 Command Center - Diagnostic Tool"
echo "========================================"
echo ""

# Check if in right directory
echo "📁 Step 1: Checking directory..."
cd ~/openclaw-mission-control 2>/dev/null || {
    echo "❌ Directory not found! Cloning..."
    cd ~
    git clone https://github.com/EightSeven-maker/openclaw-mission-control.git
    cd openclaw-mission-control
    npm install
}
echo "✅ Directory OK: $(pwd)"
echo ""

# Check git status
echo "📥 Step 2: Checking git..."
git remote -v | grep origin
echo ""

# Pull latest
echo "📥 Step 3: Pulling latest..."
git pull origin main 2>&1
echo ""

# Install dependencies
echo "📦 Step 4: Installing dependencies..."
npm install 2>&1
echo ""

# Build
echo "🔨 Step 5: Building..."
npm run build 2>&1
BUILD_RESULT=$?
echo ""

if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ BUILD FAILED! Check errors above."
    exit 1
fi
echo "✅ Build successful!"
echo ""

# Check what's using port 3336
echo "🔍 Step 6: Checking port 3336..."
lsof -i :3336 2>/dev/null || echo "Port 3336 is free"
echo ""

# PM2 Setup
echo "🚀 Step 7: Setting up PM2..."
pm2 delete openclaw-dashboard 2>/dev/null || true
pm2 start npm --name "openclaw-dashboard" -- run start -- -p 3336 -H 0.0.0.0
echo ""

# Wait a few seconds
echo "⏳ Waiting for server to start..."
sleep 5

# Check status
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""

# Test
echo "🧪 Step 8: Testing..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3336 2>/dev/null)
echo "HTTP Response: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "🎉 SUCCESS! 87 Command Center is LIVE!"
    echo "🌐 Access at: http://$(hostname -I | awk '{print $1}'):3336"
    
    # Save for reboot
    pm2 save
    echo "✅ PM2 saved for auto-restart on reboot"
else
    echo ""
    echo "❌ Server not responding. Checking logs..."
    pm2 logs openclaw-dashboard --lines 20 --nostream
fi