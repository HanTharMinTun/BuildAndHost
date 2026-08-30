#!/bin/bash
# Restart the websiteBuilder Backend to apply deployment fixes

echo "Stopping existing backend processes..."
pkill -f "uvicorn.*websiteBuilder_Backend" 2>/dev/null || true
sleep 2

echo "Starting websiteBuilder Backend..."
cd /home/ubuntu/BuildAndHost/Backend/websiteBuilder_Backend
nohup /home/ubuntu/BuildAndHost/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8080 > /tmp/websitebuilder_backend.log 2>&1 &

sleep 3

# Check if it's running
if pgrep -f "uvicorn.*websiteBuilder_Backend" > /dev/null; then
    echo "✓ Backend started successfully on port 8080"
    echo "  Log file: /tmp/websitebuilder_backend.log"
    ps aux | grep "uvicorn.*websiteBuilder_Backend" | grep -v grep
else
    echo "✗ Failed to start backend. Check logs:"
    tail -20 /tmp/websitebuilder_backend.log
    exit 1
fi
