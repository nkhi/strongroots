#!/bin/bash
# =============================================================================
# Start App - Development Startup Script
# =============================================================================
# This script starts all services needed for development:
#   1. PostgreSQL database (Docker)
#   2. Backend API server (Bun + Express on port 3000)
#   3. Frontend dev server (Vite on port 5173)
#
# Prerequisites:
#   - Docker Desktop must be running
#   - Root .env file must exist with POSTGRES_PASSWORD set
#
# Usage:
#   ./go.sh                  # Start app only (Postgres + backend + frontend)
#   ./go.sh --with-headscale # Also start Headscale VPN from ~/Desktop/infra/
#
# To stop:
#   - Ctrl+C stops the servers (Docker containers keep running)
#   - Run `docker compose down` to stop Docker containers
# =============================================================================

# Add Bun to PATH (installed via bun.sh)
export PATH="$HOME/.bun/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
WITH_HEADSCALE=false
if [[ "$1" == "--with-headscale" ]]; then
  WITH_HEADSCALE=true
fi

# Function to cleanup background processes
cleanup() {
  echo -e "\n\n${YELLOW}[SHUTDOWN]${NC} Stopping services..."
  if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
    pkill -P $SERVER_PID 2>/dev/null
  fi
  echo -e "${YELLOW}[SHUTDOWN]${NC} Stopping Docker containers..."
  docker compose down
  echo -e "${GREEN}[SHUTDOWN]${NC} All services stopped."
  exit 0
}

# Set up trap to catch Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# ============================================
# Check Docker is running (auto-start on macOS)
# ============================================
if ! docker info > /dev/null 2>&1; then
  # Try to start Docker Desktop on macOS
  if [[ "$OSTYPE" == "darwin"* ]] && [ -d "/Applications/Docker.app" ]; then
    echo -e "${YELLOW}[DOCKER]${NC} Docker is not running. Starting Docker Desktop..."
    open -a Docker
    
    # Wait for Docker to be ready (up to 60 seconds)
    DOCKER_RETRIES=60
    while ! docker info > /dev/null 2>&1 && [ $DOCKER_RETRIES -gt 0 ]; do
      echo -e "${YELLOW}[DOCKER]${NC} Waiting for Docker to start... ($DOCKER_RETRIES)"
      DOCKER_RETRIES=$((DOCKER_RETRIES-1))
      sleep 1
    done
    
    if ! docker info > /dev/null 2>&1; then
      echo -e "${RED}[DOCKER]${NC} Docker failed to start. Please start Docker Desktop manually."
      exit 1
    fi
    echo -e "${GREEN}[DOCKER]${NC} Docker Desktop is ready!"
  else
    echo -e "${RED}[DOCKER]${NC} Docker is not running! Please start Docker Desktop."
    exit 1
  fi
fi

# ============================================
# Optionally start Headscale
# ============================================
if [ "$WITH_HEADSCALE" = true ]; then
  echo -e "${GREEN}[DOCKER]${NC} Starting Headscale from ~/Desktop/infra/headscale/..."
  (cd ~/Desktop/infra/headscale && docker compose up -d)
  echo -e "${GREEN}[DOCKER]${NC} Headscale running on port 8080"
fi

# ============================================
# Start Postgres
# ============================================
echo -e "${GREEN}[DOCKER]${NC} Starting Postgres..."
docker compose up -d postgres

# Wait for Postgres to be healthy
echo -e "${YELLOW}[DOCKER]${NC} Waiting for Postgres to be ready..."
RETRIES=30
until docker compose exec -T postgres pg_isready -U start > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -e "${YELLOW}[DOCKER]${NC} Waiting for Postgres... ($RETRIES attempts left)"
  RETRIES=$((RETRIES-1))
  sleep 1
done

if [ $RETRIES -eq 0 ]; then
  echo -e "${RED}[DOCKER]${NC} Postgres failed to start!"
  exit 1
fi

echo -e "${GREEN}[DOCKER]${NC} Postgres is ready!"

# ============================================
# Start the Backend Server
# ============================================
echo -e "${GREEN}[SERVER]${NC} Starting backend..."
cd server

# Run in a loop to auto-restart on crash
(
  while true; do
    echo -e "${GREEN}[SERVER]${NC} 🚀 Starting Bun server..."
    bun run index.ts
    echo -e "${YELLOW}[SERVER]${NC} 💥 Server crashed or stopped. Restarting in 1 second..."
    sleep 1
  done
) &
SERVER_PID=$!

# ============================================
# Start the Frontend
# ============================================
cd ..
cd client

# Open browser after a short delay
(sleep 2 && open http://localhost:5173/) &

echo -e "${GREEN}[CLIENT]${NC} Starting Vite dev server..."
bun run dev -- --host 0.0.0.0

# When Vite stops, cleanup
cleanup

