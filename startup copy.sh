#!/bin/bash
set -e  # Exit if any command fails

echo "========== Starting deployment: $(date) =========="

# git pull origin master

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build:all  

echo "Ensuring logs directory exists..."
mkdir -p logs

echo "Rebuilding Docker image..."
docker build -t mypostgres .

echo "Stopping existing container (if any)..."
docker rm -f gpu-database || true

# Load environment variables from .env file
echo "Loading environment variables..."
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Warning: .env file not found. Using default values."
  export POSTGRES_USER=postgres
  export POSTGRES_PASSWORD=default_password
  export POSTGRES_DB=postgres
fi

echo "Starting Docker container..."
docker run -d --restart unless-stopped --name gpu-database \
  -p 5432:5432 \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -e POSTGRES_DB="$POSTGRES_DB" \
  mypostgres

echo "Waiting for database to initialize..."
sleep 5  

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

if ! systemctl list-unit-files | grep -q "pm2-ubuntu"; then
  echo "Setting up PM2 to start on system boot..."
  pm2 startup
  #  need to run the command PM2 outputs manually once
fi

echo "Testing API endpoint..."
curl -s http://localhost:3000/api/gpus > /dev/null && echo "API is responding correctly" || echo "API endpoint test failed"

echo "========== Deployment completed: $(date) =========="

