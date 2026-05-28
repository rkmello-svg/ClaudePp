# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/web/package.json packages/web/
COPY packages/shared/package.json packages/shared/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/web packages/web/
COPY packages/shared packages/shared/

# Build web app
RUN cd packages/web && yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install http-server to serve static files
RUN npm install -g http-server

# Copy built app from builder
COPY --from=builder /app/packages/web/dist dist/

# Expose port
EXPOSE 80

# Serve the app
CMD ["http-server", "dist", "-p", "80", "--gzip", "--cache", "-1"]
