#!/bin/bash
set -e  # Exit if any command fails

echo "Pulling latest code..."
git pull origin master

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Rebuilding Docker image..."
docker build -t mypostgres .

echo "Stopping existing container (if any)..."
docker rm -f gpu-database || true

echo "Starting Docker container..."
docker run -d --restart unless-stopped --name gpu-database -p 5432:5432 mypostgres

echo "Restarting Node server (if using PM2/systemd etc.)"
# For example, with PM2:
# pm2 restart mygpumeasure || pm2 start dist/index.js --name mygpumeasure

echo "Deployment complete."
