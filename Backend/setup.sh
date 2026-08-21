#!/bin/bash
# Complete Setup Script for Marketku API Migration
# Run this script to install dependencies and start your backend

echo "🚀 Marketku API Setup Script"
echo "================================"
echo ""

# Navigate to Backend directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

echo ""

# Step 2: Activate virtual environment and install dependencies
echo "📥 Installing dependencies..."
.venv/bin/pip install --upgrade pip --quiet
.venv/bin/pip install -r requirements.txt

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Step 3: Check if API key is configured
if grep -q "your-api-key-here" .env 2>/dev/null; then
    echo "⚠️  WARNING: API key not configured!"
    echo ""
    echo "Please update Backend/.env file with your actual Marketku API key."
    echo "1. Open Roo Code settings (gear icon in chat panel)"
    echo "2. Copy your complete API key"
    echo "3. Edit Backend/.env and replace 'your-api-key-here' with your key"
    echo ""
    read -p "Press Enter after updating your API key..."
fi

# Step 4: Verify API key is set
if [ -f ".env" ]; then
    echo "✅ Environment file found"
    
    # Load the API key (without exposing it)
    source .env 2>/dev/null
    
    if [ -z "$MARKETKU_API_KEY" ] || [ "$MARKETKU_API_KEY" = "your-api-key-here" ]; then
        echo "❌ ERROR: MARKETKU_API_KEY is not properly configured in .env"
        echo ""
        echo "To fix this:"
        echo "1. Open Backend/.env"
        echo "2. Set MARKETKU_API_KEY=your-actual-key-from-roo-code"
        echo "3. Run this script again"
        exit 1
    else
        KEY_LENGTH=${#MARKETKU_API_KEY}
        echo "✅ API key configured (length: $KEY_LENGTH characters)"
        
        if [ $KEY_LENGTH -lt 40 ]; then
            echo "⚠️  WARNING: API key seems too short (should be 50-70+ characters)"
            echo "   Make sure you copied the COMPLETE key from Roo Code settings"
        fi
    fi
else
    echo "❌ ERROR: .env file not found!"
    echo "Please create Backend/.env from Backend/.env.example"
    exit 1
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "To start your backend server:"
echo ""
echo "  cd Backend"
echo "  source .venv/bin/activate"
echo "  uvicorn ai.main:app --reload"
echo ""
echo "Or run: ./Backend/start_server.sh"
echo ""
