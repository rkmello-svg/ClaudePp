# ClaudePP Setup Guide

## Prerequisites

- Node.js >= 20.0.0
- Yarn >= 4.0.0
- Git
- Firebase Account with Firestore and Authentication enabled
- Google Cloud Project setup

## Step 1: Clone and Install

```bash
git clone https://github.com/rkmello-svg/claudepp.git
cd ClaudePp
yarn install
```

## Step 2: Firebase Configuration

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication (Email/Password)
5. Download service account key:
   - Go to Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `firebase-key.json`

### 2.2 Configure Backend

Create `.env.local` in `packages/backend/`:

```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-email@appspot.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

# JWT
JWT_SECRET=your-jwt-secret-key-min-32-chars

# App
NODE_ENV=development
PORT=3000
```

### 2.3 Configure Web

Create `.env.local` in `packages/web/`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

### 2.4 Configure Mobile

Create `.env` in `packages/mobile/`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_API_TIMEOUT=10000
```

## Step 3: Initialize Firestore Database

Run seed script to create initial collections and data:

```bash
cd packages/backend
npx ts-node scripts/seed.ts
```

This will create:
- Stores collection with sample data
- Users collection with admin account
- Products collection with sample items
- Categories collection

## Step 4: Start Development Servers

### Option A: All at once

```bash
yarn dev
```

### Option B: Individual servers

Backend:
```bash
yarn backend:dev
```

Web:
```bash
yarn web:dev
```

Mobile:
```bash
yarn mobile:dev
```

## Step 5: Verify Installation

1. Backend: http://localhost:3000/health
2. Web: http://localhost:5173/login
3. Mobile: Expo Go app

### Test Login

Default credentials:
- Email: admin@example.com
- Password: password123

## Troubleshooting

### Firebase Connection Issues

```bash
# Verify credentials
node -e "require('firebase-admin').initializeApp();"
```

### Firestore Emulator (for local testing)

```bash
# Install Firebase emulator
npm install -g firebase-tools

# Start emulator
firebase emulators:start --project=demo

# In .env.local, add:
FIREBASE_EMULATOR_HOST=localhost:8080
```

### Port Already in Use

Change PORT in `.env.local`:
```env
PORT=3001
```

### Type checking fails

```bash
yarn type-check
```

## Next Steps

1. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for contribution guidelines
2. Read [API.md](./API.md) for API documentation
3. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup

## Support

For issues, check:
- GitHub Issues: https://github.com/rkmello-svg/claudepp/issues
- Firebase Documentation: https://firebase.google.com/docs
