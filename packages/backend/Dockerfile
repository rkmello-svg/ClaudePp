# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/
COPY packages/shared/package.json packages/shared/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/backend packages/backend/
COPY packages/shared packages/shared/

# Build backend
RUN cd packages/backend && yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /app/packages/backend/dist dist/
COPY --from=builder /app/packages/backend/package.json .
COPY --from=builder /app/yarn.lock .

# Install production dependencies only
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]
