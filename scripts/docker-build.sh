#!/bin/bash

# Script de build Docker optimisé pour production

set -e

echo "🚀 Building portfolio for production..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="portfolio-minimal"
VERSION=${1:-latest}
PLATFORM=${2:-linux/amd64,linux/arm64}

echo -e "${BLUE}Configuration:${NC}"
echo "  - Image: $IMAGE_NAME:$VERSION"
echo "  - Platform: $PLATFORM"

# Vérification des prérequis
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# Nettoyage des builds précédents
echo -e "\n${YELLOW}Cleaning previous builds...${NC}"
rm -rf dist/
docker system prune -f

# Build de l'image multi-plateforme
echo -e "\n${YELLOW}Building multi-platform Docker image...${NC}"
docker buildx build \
    --platform $PLATFORM \
    --tag $IMAGE_NAME:$VERSION \
    --tag $IMAGE_NAME:latest \
    --load \
    .

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Build completed successfully!${NC}"
else
    echo -e "\n${RED}❌ Build failed!${NC}"
    exit 1
fi

# Affichage des informations sur l'image
echo -e "\n${BLUE}Image information:${NC}"
docker images | grep $IMAGE_NAME | head -5

# Test rapide du container
echo -e "\n${YELLOW}Testing container...${NC}"
CONTAINER_ID=$(docker run -d -p 8080:80 $IMAGE_NAME:$VERSION)

# Attendre que le container démarre
sleep 5

# Test de santé
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Container is healthy and responding${NC}"
else
    echo -e "${RED}❌ Container health check failed${NC}"
    docker logs $CONTAINER_ID
fi

# Nettoyage du container de test
docker stop $CONTAINER_ID > /dev/null 2>&1
docker rm $CONTAINER_ID > /dev/null 2>&1

echo -e "\n${GREEN}🎉 Docker build process completed!${NC}"
echo -e "Run with: ${BLUE}docker-compose up -d${NC}"
echo -e "Or: ${BLUE}docker run -d -p 80:80 $IMAGE_NAME:$VERSION${NC}"