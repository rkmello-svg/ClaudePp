# ClaudePP Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Google Cloud Project setup
- Vercel account (for web deployment)
- GitHub account with repository access

## Backend Deployment

### Option 1: Google Cloud Run

#### 1.1 Build Docker Image

```bash
cd packages/backend

# Create Dockerfile
docker build -t gcr.io/[PROJECT_ID]/claudepp-backend:latest .

# Push to Google Container Registry
docker push gcr.io/[PROJECT_ID]/claudepp-backend:latest
```

#### 1.2 Deploy to Cloud Run

```bash
gcloud run deploy claudepp-backend \
  --image gcr.io/[PROJECT_ID]/claudepp-backend:latest \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --timeout 3600 \
  --set-env-vars FIREBASE_PROJECT_ID=[PROJECT_ID],NODE_ENV=production,JWT_SECRET=[SECRET]
```

#### 1.3 Setup Cloud SQL (for future use)

```bash
gcloud sql instances create claudepp-db \
  --database-version POSTGRES_14 \
  --tier db-f1-micro \
  --region us-central1
```

### Option 2: Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 3: Heroku

```bash
# Create app
heroku create claudepp-backend

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=...

# Deploy
git push heroku main
```

## Web Deployment

### Option 1: Vercel

#### 1.1 Via CLI

```bash
npm i -g vercel

cd packages/web

vercel --name claudepp-web
```

#### 1.2 Via GitHub Integration

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import repository
4. Configure:
   - Framework: Vite
   - Root directory: packages/web
   - Environment variables: VITE_API_BASE_URL
5. Deploy

### Option 2: Netlify

```bash
# Install
npm i -g netlify-cli

# Deploy
cd packages/web
netlify deploy --prod --dir dist

# Or setup continuous deployment
netlify init
```

### Option 3: AWS Amplify

```bash
npm i -g @aws-amplify/cli

amplify init
amplify add hosting
amplify publish
```

## Mobile Deployment

### Option 1: Expo Managed

```bash
# Build
eas build --platform ios
eas build --platform android

# Submit to App Store
eas submit --platform ios --latest

# Submit to Google Play
eas submit --platform android --latest
```

### Option 2: EAS Hosted

```bash
# Create account
npx eas-cli auth:login

# Build iOS
eas build --platform ios --auto-submit

# Build Android
eas build --platform android --auto-submit
```

### Option 3: Manual Build (Android)

```bash
# Build APK
eas build --platform android --local

# Or generate EAA via Expo
cd packages/mobile
npx expo prebuild --clean
npx react-native run-android
```

## Docker Compose (Local Multi-Container)

### 1. Create docker-compose.yml

```yaml
version: '3.9'

services:
  backend:
    build:
      context: packages/backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
      FIREBASE_PRIVATE_KEY: ${FIREBASE_PRIVATE_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - redis
    networks:
      - claudepp

  web:
    build:
      context: packages/web
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    environment:
      VITE_API_BASE_URL: http://localhost:3000/api/v1
    depends_on:
      - backend
    networks:
      - claudepp

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - claudepp

  firebase-emulator:
    image: google/cloud-sdk:latest
    ports:
      - "8080:8080"
    environment:
      FIRESTORE_EMULATOR_HOST: localhost:8080
    networks:
      - claudepp

networks:
  claudepp:
    driver: bridge

volumes:
  firebase-data:
```

### 2. Build and Run

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs
docker-compose logs -f backend

# Stop
docker-compose down
```

## CI/CD Pipeline (GitHub Actions)

### 1. Create .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: yarn install
      - run: yarn test
      - run: yarn type-check
      - run: yarn build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - run: |
          docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/claudepp-backend:${{ github.sha }} packages/backend
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/claudepp-backend:${{ github.sha }}
      - run: |
          gcloud run deploy claudepp-backend \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/claudepp-backend:${{ github.sha }} \
            --region us-central1

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: packages/web
```

## Environment Variables

### Production Backend

```env
# Firebase
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=<private-key>
FIREBASE_CLIENT_EMAIL=<email>

# JWT
JWT_SECRET=<min-32-chars>

# App
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Optimization
CACHE_TTL=300
MAX_POOL_SIZE=10
```

### Production Web

```env
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_API_TIMEOUT=10000
```

## Monitoring

### Google Cloud Monitoring

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision"

# View metrics
gcloud monitoring metrics-descriptors list
```

### Sentry (Error Tracking)

```typescript
// backend/main.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## Scaling

### Backend Autoscaling

```bash
gcloud run services update claudepp-backend \
  --min-instances 1 \
  --max-instances 10 \
  --region us-central1
```

### Database Scaling

```bash
# Firestore automatic scaling enabled by default

# For Cloud SQL
gcloud sql instances patch claudepp-db \
  --tier db-n1-standard-2
```

## Rollback

### Cloud Run

```bash
# List revisions
gcloud run revisions list --service claudepp-backend

# Rollback to previous
gcloud run services update-traffic claudepp-backend \
  --to-revisions REVISION_NAME=100
```

### GitHub/Vercel

Revert commit and push:
```bash
git revert <commit-sha>
git push origin main
```

## Backup and Recovery

### Firestore Backups

```bash
# Create scheduled backup
gcloud firestore backups create --database=main

# List backups
gcloud firestore backups list

# Restore from backup
gcloud firestore restore --backup=<backup-id>
```

## Security Checklist

- [ ] Enable Cloud Armor
- [ ] Setup Cloud KMS for secrets
- [ ] Configure VPC
- [ ] Enable audit logging
- [ ] Setup SSL certificates
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup WAF rules
- [ ] Review IAM permissions
- [ ] Enable data encryption

## Cost Optimization

1. **Cloud Run**: Pay only for actual usage
2. **Firestore**: Use on-demand or set auto-scaling
3. **Storage**: Archive old data to Cloud Storage
4. **CDN**: Cache static assets globally
5. **Database**: Use read replicas for scaling

## Support

- GCP Support: https://cloud.google.com/support
- Firebase Help: https://firebase.google.com/support
- GitHub Issues: Report issues in repository
