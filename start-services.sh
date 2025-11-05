#!/bin/bash

# API Marketplace - Start All Services
# This script starts all microservices and the Angular frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  API Marketplace - Service Startup        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to start a service
start_service() {
    local name=$1
    local path=$2
    local port=$3

    echo -e "${BLUE}Starting $name on port $port...${NC}"

    if ! check_port $port; then
        echo -e "${RED}✗ Cannot start $name - port $port is already in use${NC}"
        echo -e "${YELLOW}  Run: lsof -i :$port to find the process${NC}"
        return 1
    fi

    cd "$path"
    dotnet run > "/tmp/apimarketplace-$name.log" 2>&1 &
    local pid=$!
    echo -e "${GREEN}✓ $name started (PID: $pid)${NC}"
    cd - > /dev/null
}

# Check prerequisites
echo -e "${BLUE}1. Checking prerequisites...${NC}"

if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}✗ .NET SDK not found. Please install .NET 8 SDK${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .NET SDK found${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

echo ""

# Start Docker infrastructure
echo -e "${BLUE}2. Starting infrastructure (Docker)...${NC}"

if docker ps &> /dev/null; then
    docker-compose up -d
    echo -e "${GREEN}✓ Docker infrastructure started${NC}"
else
    echo -e "${RED}✗ Docker is not running. Please start Docker Desktop${NC}"
    exit 1
fi

echo ""
sleep 3

# Check if database exists and create if needed
echo -e "${BLUE}3. Checking database...${NC}"
docker exec apimarketplace_postgres_1 psql -U apimarketplace -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw apimarketplace
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Creating database...${NC}"
    docker exec apimarketplace_postgres_1 psql -U apimarketplace -c "CREATE DATABASE apimarketplace;" 2>/dev/null
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi

echo ""

# Start microservices
echo -e "${BLUE}4. Starting microservices...${NC}"

PROJECT_ROOT="$(pwd)"

start_service "ApiGateway" "$PROJECT_ROOT/src/ApiGateway" 5000
sleep 2

start_service "IdentityService" "$PROJECT_ROOT/src/Services/IdentityService" 5001
sleep 2

start_service "ConnectorService" "$PROJECT_ROOT/src/Services/ConnectorService" 5002
sleep 2

start_service "IntegrationService" "$PROJECT_ROOT/src/Services/IntegrationService" 5003
sleep 2

start_service "MonitoringService" "$PROJECT_ROOT/src/Services/MonitoringService" 5004
sleep 2

echo ""

# Wait for services to be ready
echo -e "${BLUE}5. Waiting for services to be ready...${NC}"
sleep 5

# Health check
echo -e "${BLUE}6. Performing health checks...${NC}"

check_health() {
    local name=$1
    local url=$2

    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name is healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ $name is not responding${NC}"
        echo -e "${YELLOW}  Check logs: tail -f /tmp/apimarketplace-$name.log${NC}"
        return 1
    fi
}

check_health "ApiGateway" "http://localhost:5000/health"
check_health "IdentityService" "http://localhost:5001/health"
check_health "ConnectorService" "http://localhost:5002/health"
check_health "IntegrationService" "http://localhost:5003/health"
check_health "MonitoringService" "http://localhost:5004/health"

echo ""

# Start Angular frontend
echo -e "${BLUE}7. Starting Angular frontend...${NC}"

if ! check_port 4200; then
    echo -e "${RED}✗ Cannot start Angular - port 4200 is already in use${NC}"
    exit 1
fi

cd "$PROJECT_ROOT/src/Frontend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies (first time only)...${NC}"
    npm install
fi

echo -e "${BLUE}Starting Angular development server...${NC}"
ng serve > /tmp/apimarketplace-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Angular frontend started (PID: $FRONTEND_PID)${NC}"

cd "$PROJECT_ROOT"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  All services started successfully! 🚀     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo -e "  Frontend:     ${GREEN}http://localhost:4200${NC}"
echo -e "  API Gateway:  ${GREEN}http://localhost:5000${NC}"
echo -e "  Swagger UI:   ${GREEN}http://localhost:5001/swagger${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  View all logs: ${YELLOW}tail -f /tmp/apimarketplace-*.log${NC}"
echo ""
echo -e "${BLUE}To stop all services:${NC}"
echo -e "  ${YELLOW}./stop-services.sh${NC}"
echo ""
echo -e "${YELLOW}Opening browser in 5 seconds...${NC}"
sleep 5

# Open browser (works on macOS and Linux)
if command -v open &> /dev/null; then
    open http://localhost:4200
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:4200
else
    echo -e "${YELLOW}Please open http://localhost:4200 in your browser${NC}"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
