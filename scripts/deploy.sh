#!/bin/bash

# Script de déploiement pour Dokploy

set -e

echo "🚀 Deploying portfolio to production..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOKPLOY_HOST=${DOKPLOY_HOST:-"your-dokploy-server.com"}
PROJECT_NAME=${PROJECT_NAME:-"portfolio-minimal"}
DOMAIN=${DOMAIN:-"yourdomain.com"}

echo -e "${BLUE}Configuration:${NC}"
echo "  - Dokploy Host: $DOKPLOY_HOST"
echo "  - Project: $PROJECT_NAME"
echo "  - Domain: $DOMAIN"

# Vérification de la configuration
if [ "$DOKPLOY_HOST" = "your-dokploy-server.com" ]; then
    echo -e "${YELLOW}⚠️  Warning: Using default Dokploy host. Set DOKPLOY_HOST environment variable.${NC}"
fi

# Build local pour vérifier
echo -e "\n${YELLOW}Running local build test...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local build successful${NC}"
else
    echo -e "${RED}❌ Local build failed${NC}"
    exit 1
fi

# Test Docker build
echo -e "\n${YELLOW}Testing Docker build...${NC}"
docker build -t $PROJECT_NAME:test .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker build successful${NC}"
    docker rmi $PROJECT_NAME:test
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Création du fichier de configuration Dokploy
echo -e "\n${YELLOW}Creating Dokploy configuration...${NC}"

cat > dokploy.yml << EOF
version: '1.0'
project:
  name: $PROJECT_NAME
  type: docker-compose

services:
  - name: portfolio
    image: build-from-source
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    
domains:
  - domain: $DOMAIN
    service: portfolio
    port: 80
    ssl: true

build:
  dockerfile: Dockerfile
  context: .
  
monitoring:
  enabled: true
  healthcheck: "/health"

backup:
  enabled: false # Pas nécessaire pour un site statique

scaling:
  replicas: 1
  
resources:
  limits:
    memory: 128Mi
    cpu: 100m
  requests:
    memory: 64Mi
    cpu: 50m
EOF

echo -e "${GREEN}✅ Dokploy configuration created${NC}"

# Affichage des informations de déploiement
echo -e "\n${BLUE}Deployment Information:${NC}"
echo "1. Push your code to Git repository"
echo "2. In Dokploy dashboard:"
echo "   - Create new project: $PROJECT_NAME"
echo "   - Set domain: $DOMAIN"
echo "   - Use docker-compose.yml configuration"
echo "   - Set environment variables if needed"
echo "3. Deploy will be automatic on Git push"

echo -e "\n${YELLOW}Manual deployment commands for reference:${NC}"
echo "docker-compose up -d --build"
echo "docker-compose logs -f"

# Nettoyage
rm -f dokploy.yml

echo -e "\n${GREEN}🎉 Deployment preparation completed!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Commit and push to your Git repository"
echo "2. Configure Dokploy with the provided settings"
echo "3. Monitor deployment in Dokploy dashboard"