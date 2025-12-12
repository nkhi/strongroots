#!/bin/bash

# Function to cleanup background processes
cleanup() {
  echo -e "\n\n[SHUTDOWN] Stopping server..."
  if [ ! -z "$SERVER_PID" ]; then
    # Kill the loop process
    kill $SERVER_PID 2>/dev/null
    # Kill any child processes (the actual node server)
    pkill -P $SERVER_PID 2>/dev/null
  fi
  exit 0
}

# Set up trap to catch Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Start the server in the background with output visible
echo "Starting server..."
cd server
# Run in a loop to auto-restart on crash
(
  while true; do
    echo "[SERVER] 🚀 Starting Node.js server..."
    node index.js
    echo "[SERVER] 💥 Server crashed or stopped. Restarting in 1 second..."
    sleep 1
  done
) &
SERVER_PID=$!

# Go back to root and start the client
cd ..
cd client

# Open browser after a short delay (in background so it doesn't block)
(sleep 2 && open http://localhost:5173/) &

# Start Vite dev server in foreground (this will show all output)
echo "Starting Vite dev server..."
pnpm run dev -- --host 0.0.0.0

# When Vite stops (Ctrl+C), cleanup will kill the server
cleanup
