# Multi-stage production Dockerfile for DermaAI Frontend
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy sources and build production assets
COPY . .
RUN npm run build

# Nginx web server for production SPA serving
FROM nginx:alpine

# Copy nginx custom SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
