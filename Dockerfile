# Multi-stage Dockerfile for production build

# Build stage
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --only=production=false --silent

# Copy source code
COPY . .

# Build the application with optimizations
ENV NODE_ENV=production
RUN npm run build

# Verify build output exists and show structure
RUN echo "Build output:" && \
    ls -la dist/ && \
    echo "Total size:" && \
    du -sh dist/

# Production stage
FROM nginx:alpine AS production

# Install security updates and curl for healthcheck
RUN apk add --no-cache --upgrade \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create nginx directories for logs
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log

# Copy optimized nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf.original 2>/dev/null || true

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy additional static files
COPY --from=builder /app/robots.txt /usr/share/nginx/html/
COPY --from=builder /app/sitemap.xml /usr/share/nginx/html/
COPY --from=builder /app/manifest.json /usr/share/nginx/html/
COPY --from=builder /app/sw.js /usr/share/nginx/html/
COPY --from=builder /app/favicon.svg /usr/share/nginx/html/
COPY --from=builder /app/data /usr/share/nginx/html/data

# Verify files are properly copied
RUN echo "Production files:" && \
    ls -la /usr/share/nginx/html/ && \
    echo "Total production size:" && \
    du -sh /usr/share/nginx/html/

# Set proper permissions for security
RUN chown -R nginx:nginx /usr/share/nginx/html /var/log/nginx && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Create non-root user for better security (nginx user already exists)
USER nginx

# Add comprehensive healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || curl -f http://localhost/ || exit 1

# Expose HTTP port
EXPOSE 80

# Add labels for better container management
LABEL \
    maintainer="Portfolio Developer" \
    version="1.0.0" \
    description="Portfolio Minimal - Production Container" \
    org.opencontainers.image.source="https://github.com/yourusername/portfolio-minimal" \
    org.opencontainers.image.documentation="https://github.com/yourusername/portfolio-minimal/blob/main/DOCKER.md"

# Switch back to root for nginx startup (nginx will drop privileges)
USER root

# Start nginx with daemon off for Docker
CMD ["nginx", "-g", "daemon off;"]