#!/bin/bash

# NextStep AI - Docker Setup Script
# This script automates the Docker setup for the full stack application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  NextStep AI - Docker Setup Script${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Get directory where script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo -e "\n${YELLOW}Step 1: Building Docker images...${NC}"
docker-compose build

echo -e "\n${YELLOW}Step 2: Starting services...${NC}"
docker-compose up -d

echo -e "\n${YELLOW}Step 3: Waiting for services to be healthy...${NC}"
sleep 10

echo -e "\n${YELLOW}Step 4: Running database migrations...${NC}"
docker-compose exec -T backend php artisan migrate --force

echo -e "\n${YELLOW}Step 5: Generating Laravel APP_KEY...${NC}"
docker-compose exec -T backend php artisan key:generate --force

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Access your application:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:8000${NC}"
echo -e "  API:       ${GREEN}http://localhost:8000/api${NC}"

echo -e "\n${YELLOW}Useful commands:${NC}"
echo -e "  View logs:        ${GREEN}docker-compose logs -f${NC}"
echo -e "  Stop services:    ${GREEN}docker-compose stop${NC}"
echo -e "  Start services:   ${GREEN}docker-compose up -d${NC}"
echo -e "  Restart services: ${GREEN}docker-compose restart${NC}"

echo -e "\n${YELLOW}To stop the services later, run:${NC}"
echo -e "  ${GREEN}docker-compose down${NC}"
