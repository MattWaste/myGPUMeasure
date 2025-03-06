#!/bin/bash
set -e  # Exit if any command fails

echo "========== Starting deployment: $(date) =========="

# echo "Pulling latest code..."
# git pull origin main  # Updated to 'main' instead of 'master' (adjust if different)

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build:all  # Updated to build:all to match your package.json

echo "Ensuring logs directory exists..."
mkdir -p logs

echo "Rebuilding Docker image..."
docker build -t mypostgres .

echo "Stopping existing container (if any)..."
docker rm -f gpu-database || true

echo "Starting Docker container..."
docker run -d --restart unless-stopped --name gpu-database -p 5432:5432 mypostgres

echo "Waiting for database to initialize..."
sleep 5  # Give PostgreSQL a moment to start

echo "Starting/restarting application with PM2..."
# Check if app is already running in PM2
if pm2 list | grep -q "mygpupower"; then
  echo "Restarting existing PM2 process..."
  pm2 restart mygpupower
else
  echo "Starting new PM2 process..."
  pm2 start ecosystem.config.js
fi

echo "Saving PM2 process list..."
pm2 save

echo "Checking if PM2 startup is configured..."
# Only run pm2 startup if it hasn't been configured
if ! systemctl list-unit-files | grep -q "pm2-ubuntu"; then
  echo "Setting up PM2 to start on system boot..."
  pm2 startup
  # Note: You'll need to run the command PM2 outputs manually once
fi

echo "Testing API endpoint..."
curl -s http://localhost:3000/api/gpus > /dev/null && echo "API is responding correctly" || echo "API endpoint test failed"

echo "========== Deployment completed: $(date) =========="