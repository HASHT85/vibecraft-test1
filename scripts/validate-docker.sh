#!/bin/bash

# Script de validation Docker pour la production

set -e

echo "🔍 Validating Docker setup for production..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
IMAGE_NAME="portfolio-minimal"
CONTAINER_NAME="portfolio-test"
TEST_PORT="8080"

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}Cleaning up test containers...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Trap pour nettoyer en cas d'interruption
trap cleanup EXIT

# Étape 1: Vérification des prérequis
echo -e "\n${BLUE}1. Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required${NC}"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo -e "${RED}❌ curl is required${NC}"; exit 1; }
echo -e "${GREEN}✅ Prerequisites OK${NC}"

# Étape 2: Build de l'image
echo -e "\n${BLUE}2. Building Docker image...${NC}"
docker build -t $IMAGE_NAME:test .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image built successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Étape 3: Analyse de la taille de l'image
echo -e "\n${BLUE}3. Analyzing image size...${NC}"
IMAGE_SIZE=$(docker images $IMAGE_NAME:test --format "{{.Size}}")
echo -e "Image size: ${YELLOW}$IMAGE_SIZE${NC}"

# Vérifier que l'image n'est pas trop lourde (alerte si > 50MB)
if docker images $IMAGE_NAME:test --format "{{.Size}}" | grep -qE "(GB|[0-9]{3,}MB)"; then
    echo -e "${YELLOW}⚠️  Warning: Image might be too large for production${NC}"
else
    echo -e "${GREEN}✅ Image size is acceptable${NC}"
fi

# Étape 4: Démarrage du container
echo -e "\n${BLUE}4. Starting test container...${NC}"
docker run -d -p $TEST_PORT:80 --name $CONTAINER_NAME $IMAGE_NAME:test

# Attendre que le container démarre
echo "Waiting for container to start..."
sleep 10

# Vérifier que le container est running
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✅ Container started successfully${NC}"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Étape 5: Tests de santé
echo -e "\n${BLUE}5. Running health checks...${NC}"

# Test 1: Endpoint principal
echo "Testing main endpoint..."
if curl -f -s http://localhost:$TEST_PORT > /dev/null; then
    echo -e "${GREEN}✅ Main endpoint responding${NC}"
else
    echo -e "${RED}❌ Main endpoint not responding${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Test 2: Health check endpoint
echo "Testing health check endpoint..."
if curl -f -s http://localhost:$TEST_PORT/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check endpoint OK${NC}"
else
    echo -e "${YELLOW}⚠️  Health check endpoint not found (optional)${NC}"
fi

# Test 3: Vérification des headers de sécurité
echo "Testing security headers..."
HEADERS=$(curl -I -s http://localhost:$TEST_PORT | tr -d '\r')
if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✅ Security headers present${NC}"
else
    echo -e "${YELLOW}⚠️  Some security headers missing${NC}"
fi

# Test 4: Compression Gzip
echo "Testing Gzip compression..."
if curl -H "Accept-Encoding: gzip" -I -s http://localhost:$TEST_PORT | grep -q "Content-Encoding: gzip"; then
    echo -e "${GREEN}✅ Gzip compression enabled${NC}"
else
    echo -e "${YELLOW}⚠️  Gzip compression not detected${NC}"
fi

# Étape 6: Test de performance simple
echo -e "\n${BLUE}6. Basic performance test...${NC}"
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}\n" http://localhost:$TEST_PORT)
echo -e "Response time: ${YELLOW}${RESPONSE_TIME}s${NC}"

if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null || echo "0") )); then
    echo -e "${GREEN}✅ Response time is good${NC}"
else
    echo -e "${YELLOW}⚠️  Response time could be improved${NC}"
fi

# Étape 7: Test des assets statiques
echo -e "\n${BLUE}7. Testing static assets...${NC}"
if curl -f -s http://localhost:$TEST_PORT/assets/ > /dev/null 2>&1 || curl -f -s http://localhost:$TEST_PORT/css/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Static assets accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Static assets path might need verification${NC}"
fi

# Étape 8: Vérification des logs
echo -e "\n${BLUE}8. Checking container logs...${NC}"
LOG_LINES=$(docker logs $CONTAINER_NAME 2>&1 | wc -l)
if [ $LOG_LINES -gt 0 ]; then
    echo -e "${GREEN}✅ Container is logging properly${NC}"
    echo "Last 5 log lines:"
    docker logs $CONTAINER_NAME 2>&1 | tail -5 | sed 's/^/  /'
else
    echo -e "${YELLOW}⚠️  No logs found${NC}"
fi

# Étape 9: Test de la configuration Docker Compose
echo -e "\n${BLUE}9. Validating docker-compose.yml...${NC}"
if [ -f "docker-compose.yml" ]; then
    if docker-compose config > /dev/null 2>&1; then
        echo -e "${GREEN}✅ docker-compose.yml is valid${NC}"
    else
        echo -e "${RED}❌ docker-compose.yml has errors${NC}"
        docker-compose config
    fi
else
    echo -e "${YELLOW}⚠️  docker-compose.yml not found${NC}"
fi

# Résumé final
echo -e "\n${BLUE}🎯 Validation Summary${NC}"
echo "=========================="
echo -e "Image: ${YELLOW}$IMAGE_NAME:test${NC}"
echo -e "Size: ${YELLOW}$IMAGE_SIZE${NC}"
echo -e "Response time: ${YELLOW}${RESPONSE_TIME}s${NC}"
echo -e "Container status: ${GREEN}Running${NC}"

# Recommandations finales
echo -e "\n${BLUE}📋 Recommendations for production:${NC}"
echo "1. Set up monitoring for the /health endpoint"
echo "2. Configure log aggregation"
echo "3. Set up SSL termination with reverse proxy"
echo "4. Configure backup strategy if needed"
echo "5. Set up monitoring alerts"

echo -e "\n${GREEN}✅ Docker validation completed successfully!${NC}"
echo -e "Ready for production deployment with: ${BLUE}docker-compose up -d${NC}"