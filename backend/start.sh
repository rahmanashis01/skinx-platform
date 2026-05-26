#!/bin/bash

echo "🚀 Starting SkinX Backend..."

# Kill any existing process on port 5001
echo "🔍 Checking for existing process on port 5001..."
if lsof -ti:5001 > /dev/null 2>&1; then
  echo "⚠️  Port 5001 is in use. Killing existing process..."
  lsof -ti:5001 | xargs kill -9 2>/dev/null
  sleep 1
  echo "✅ Process killed"
fi

# Start the backend
echo "▶️  Starting backend server..."
npm start
