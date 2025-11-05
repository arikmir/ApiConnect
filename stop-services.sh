#!/bin/bash

# API Marketplace - Stop All Services
# This script stops all running microservices and the Angular frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  API Marketplace - Stop Services          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to stop processes on a port
stop_port() {
    local port=$1
    local name=$2

    echo -e "${BLUE}Stopping $name on port $port...${NC}"

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        local pids=$(lsof -ti:$port)
        for pid in $pids; do
            kill -9 $pid 2>/dev/null && echo -e "${GREEN}✓ Stopped process $pid${NC}" || echo -e "${YELLOW}⚠️  Process $pid already stopped${NC}"
        done
    else
        echo -e "${YELLOW}⚠️  No process found on port $port${NC}"
    fi
}

# Stop all services
echo -e "${BLUE}Stopping all services...${NC}"
echo ""

stop_port 4200 "Angular Frontend"
stop_port 5000 "API Gateway"
stop_port 5001 "Identity Service"
stop_port 5002 "Connector Service"
stop_port 5003 "Integration Service"
stop_port 5004 "Monitoring Service"

echo ""

# Stop Docker infrastructure
echo -e "${BLUE}Stopping Docker infrastructure...${NC}"

if docker ps &> /dev/null; then
    docker-compose down
    echo -e "${GREEN}✓ Docker infrastructure stopped${NC}"
else
    echo -e "${YELLOW}⚠️  Docker is not running${NC}"
fi

echo ""

# Clean up log files
echo -e "${BLUE}Cleaning up log files...${NC}"
rm -f /tmp/apimarketplace-*.log
echo -e "${GREEN}✓ Log files cleaned${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  All services stopped successfully! ✓      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
