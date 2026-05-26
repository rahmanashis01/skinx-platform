#!/bin/bash

echo "🛑 Stopping SkinX Backend..."

if lsof -ti:5001 > /dev/null 2>&1; then
  echo "🔍 Found process on port 5001"
  lsof -ti:5001 | xargs kill -9 2>/dev/null
  echo "✅ Backend stopped"
else
  echo "ℹ️  No process running on port 5001"
fi
