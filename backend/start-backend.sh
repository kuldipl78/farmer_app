#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Checking for existing backend processes..."

# Check if port 8001 is in use
if lsof -i :8001 > /dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":8001" || ss -tuln 2>/dev/null | grep -q ":8001"; then
    echo -e "${YELLOW}⚠️  Port 8001 is already in use${NC}"
    
    # Find and kill the process
    PID=$(lsof -ti :8001 2>/dev/null || netstat -tuln 2>/dev/null | grep ":8001" | awk '{print $7}' | cut -d'/' -f1 | head -1)
    
    if [ ! -z "$PID" ]; then
        echo "   Found process: $PID"
        echo "   Stopping process..."
        kill -9 $PID 2>/dev/null
        sleep 1
        echo -e "${GREEN}✅ Process stopped${NC}"
    else
        # Try to kill by process name
        pkill -9 -f "simple_server.py"
        sleep 1
        echo -e "${GREEN}✅ Stopped backend processes${NC}"
    fi
fi

# Verify port is free
if lsof -i :8001 > /dev/null 2>&1; then
    echo -e "${RED}❌ Port 8001 is still in use. Please check manually.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Starting backend server...${NC}"
cd "$(dirname "$0")"
python3 simple_server.py
