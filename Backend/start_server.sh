#!/bin/bash
# Start the FastAPI backend server with Marketku API

cd "$(dirname "$0")"

echo "🚀 Starting AI Website Builder Backend"
echo "======================================"
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found!"
    echo ""
    echo "Please run setup first:"
    echo "  ./Backend/setup.sh"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create .env from .env.example and add your API key"
    exit 1
fi

echo "✅ Virtual environment found"
echo "✅ Environment file found"
echo ""
echo "Starting server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

# Activate venv and start server
source .venv/bin/activate
uvicorn ai.main:app --reload --host 0.0.0.0 --port 8000
