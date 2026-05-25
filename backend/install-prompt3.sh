#!/bin/bash

echo "🔧 Installing Prompt 3 Dependencies..."
echo ""

# Install sharp for image processing
echo "📦 Installing sharp (image processing)..."
npm install sharp

# Install axios if not already installed
echo "📦 Checking axios..."
npm list axios || npm install axios

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "📋 Configuration reminder:"
echo "- RAG Backend (Python model): http://localhost:8000"
echo "- Express Backend: http://localhost:5001"
echo ""
echo "Next: npm start"
