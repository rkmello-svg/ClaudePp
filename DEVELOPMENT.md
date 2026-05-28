# ClaudePP Development Guide

## Project Structure

```
packages/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── products/          # Products management
│   │   ├── sales/             # Sales transactions
│   │   ├── firebase/          # Firebase integration
│   │   ├── common/            # Shared utilities
│   │   └── main.ts
│   ├── jest.config.js
│   └── package.json
├── web/
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   ├── stores/            # Zustand stores
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── screens/           # Expo screens
│   │   ├── components/        # Mobile components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Services
│   │   └── App.tsx
│   ├── app.json
│   └── package.json
└── shared/
    ├── src/
    │   ├── types/             # TypeScript types
    │   ├── schemas/           # Zod schemas
    │   ├── constants/         # Constants
    │   ├── utils/             # Utility functions
    │   └── index.ts
    └── package.json
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Tests
- `chore/` - Build, deps, config

### 2. Make Changes

Always start with shared types/schemas if adding new domain:

```bash
# 1. Add types in packages/shared/src/types/
# 2. Add schemas in packages/shared/src/schemas/
# 3. Implement backend in packages/backend/
# 4. Implement web in packages/web/
# 5. Implement mobile in packages/mobile/
```

### 3. Run Tests

```bash
# All tests
yarn test

# Specific package
yarn workspace @claudepp/backend test

# Watch mode
yarn workspace @claudepp/backend test:watch

# Coverage
yarn workspace @claudepp/backend test:cov
```

### 4. Lint and Format

```bash
# Lint
yarn lint

# Format
yarn format

# Type check
yarn type-check
```

## Code Standards

### TypeScript

- Always use explicit types, avoid `any`
- Use interfaces for objects
- Use enums for constants
- Export types from shared/

```typescript
// Good
export interface User {
  id: string;
  name: string;
  email: string;
}

// Bad
export interface User {
  id: any;
  name: any;
  email: any;
}
```

### Naming Conventions

- **Files**: kebab-case (auth-service.ts)
- **Classes**: PascalCase (AuthService)
- **Functions**: camelCase (getUser)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Types/Interfaces**: PascalCase (User, UserResponse)

### Comments

```typescript
/**
 * Authenticates user with email and password
 * @param email - User email
 * @param password - User password
 * @returns Promise<LoginResponse>
 */
async login(email: string, password: string): Promise<LoginResponse> {
  // Implementation
}
```

### Error Handling

```typescript
// Backend - use NestJS exceptions
if (!user) {
  throw new NotFoundException('User not found');
}

// Web/Mobile - use try-catch
try {
  const user = await api.getUser(id);
} catch (error) {
  if (error.status === 404) {
    console.error('User not found');
  }
}
```

## Testing

### Unit Tests

```typescript
describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductsService, { provide: FirebaseService, useValue: mock }],
    }).compile();
    service = module.get(ProductsService);
  });

  it('should create product', async () => {
    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
  });
});
```

### Integration Tests

```typescript
// Test auth → sale flow
describe('Auth to Sales Flow', () => {
  it('should login and create sale', async () => {
    const user = await auth.login(credentials);
    const sale = await sales.createSale(user.storeId, saleData);
    expect(sale.cashierId).toBe(user.id);
  });
});
```

## Backend (NestJS)

### Adding a New Module

1. Create module directory: `src/feature/`
2. Create service: `feature.service.ts`
3. Create controller: `feature.controller.ts`
4. Create module: `feature.module.ts`
5. Create DTOs: `dto/*.ts`
6. Add tests: `*.spec.ts`

```bash
nest g module feature
nest g service feature
nest g controller feature
```

### Database Schema (Firestore)

Firestore structure:
```
stores/
  {storeId}/
    products/
      {productId}
    sales/
      {saleId}
    users/
      {userId}
```

## Web (React + Vite)

### Adding a New Page

```typescript
// src/pages/NewPage.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const NewPage: React.FC = () => {
  const { user } = useAuth();

  return <div>New Page</div>;
};
```

Update routing in `src/App.tsx`.

### Adding a New Hook

```typescript
// src/hooks/useNewFeature.ts
import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useNewFeature = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get('/endpoint');
      setData(result.data);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetch };
};
```

## Mobile (React Native + Expo)

### Adding a New Screen

```typescript
// src/screens/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export const NewScreen: React.FC = () => {
  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
};
```

## Git Workflow

### Commit Messages

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Build, deps

Examples:
```
feat(auth): add password reset

fix(products): handle barcode validation errors

docs(api): update endpoint documentation
```

### Creating a Pull Request

1. Push branch to GitHub
2. Create PR with description
3. Link related issues
4. Request review
5. Address feedback
6. Merge when approved

### Before Merging

```bash
git pull origin main
git merge main
yarn type-check
yarn test
yarn build
```

## Debugging

### Backend

```bash
# Debug mode
node --inspect-brk dist/main.js

# Chrome DevTools: chrome://inspect
```

### Web

```bash
# React DevTools extension
# In browser DevTools:
# - React tab
# - Profiler tab
```

### Mobile

```bash
# Expo dev tools
# Press 'j' to open debugger
# Chrome DevTools available
```

## Performance Optimization

### Backend
- Cache Firestore queries
- Paginate results
- Use indexes for complex queries
- Compress responses

### Web
- Code splitting with React.lazy
- Image optimization
- Debounce search inputs
- Cache API responses with React Query

### Mobile
- Lazy load screens
- Optimize images
- Use React.memo for components
- Implement SQLite for local cache

## Security Checklist

- [ ] Never commit `.env.local` or secret keys
- [ ] Validate all user inputs
- [ ] Use HTTPS in production
- [ ] Enable Firebase security rules
- [ ] Hash sensitive data
- [ ] Implement rate limiting
- [ ] Log security events
- [ ] Use JWT with expiration
- [ ] Implement CORS properly
- [ ] Sanitize user-generated content

## Resources

- NestJS: https://docs.nestjs.com
- React: https://react.dev
- React Native: https://reactnative.dev
- Firebase: https://firebase.google.com/docs
- Vite: https://vitejs.dev
- Zod: https://zod.dev
- Zustand: https://github.com/pmndrs/zustand
