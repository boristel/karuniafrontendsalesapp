# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (cache optimized)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
# Ensure environment variables are available during build (Vite needs them at build time)
# Note: In Coolify, you pass these as build args or env vars.
# If using runtime replacement, that requires a specific startup script.
# For now, we assume standard build-time baking.
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
