# Arquitetura - ClaudePP PDV

Documentação detalhada da arquitetura do sistema ClaudePP.

## 🏗️ Visão Geral

ClaudePP é um sistema PDV moderno construído com arquitetura de **monorepo** utilizando **Yarn Workspaces**, permitindo compartilhamento de código entre múltiplas plataformas.

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Camada de Apresentação                    │
│  ┌──────────────────┐              ┌──────────────────────┐ │
│  │   Web PDV        │              │  Mobile PDV          │ │
│  │  (React + Vite)  │              │ (React Native+Expo)  │ │
│  └────────┬─────────┘              └──────────┬───────────┘ │
│           │                                   │              │
└───────────┼───────────────────────────────────┼──────────────┘
            │                                   │
            └───────────────────┬───────────────┘
                                │
┌───────────────────────────────┴───────────────────────────────┐
│                    Camada de API (REST)                       │
│                  Backend (NestJS + Express)                   │
│  ┌───────────────────────────────────────────────────────┐   │
│  │            API v1 (Port 3000)                          │   │
│  │  ├─ /auth         (Autenticação)                       │   │
│  │  ├─ /sales        (Vendas)                             │   │
│  │  ├─ /products     (Produtos)                           │   │
│  │  ├─ /payments     (Pagamentos/TEF)                     │   │
│  │  ├─ /stores       (Lojas)                              │   │
│  │  ├─ /reports      (Relatórios)                         │   │
│  │  └─ /health       (Status)                             │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────────┬──────────────────┬─────────────┬──────────────┘
                │                  │             │
                │                  │             │
    ┌───────────┴──────┐  ┌────────┴─────┐  ┌───┴──────────┐
    │   Firestore DB   │  │ BullMQ Queue │  │  Máquinas    │
    │  (Firebase)      │  │   (Redis)    │  │  Periféricas │
    │ ├─ Vendas        │  │ ├─ Impressão │  │ ├─ TEF       │
    │ ├─ Produtos      │  │ ├─ Sync      │  │ ├─ Impressora│
    │ ├─ Usuários      │  │ └─ Reports   │  │ └─ Leitor    │
    │ └─ Lojas         │  └──────────────┘  └──────────────┘
    └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Shared Code (@claudepp/shared)                   │
│  ├─ Types (TypeScript)                                      │
│  ├─ Schemas (Zod validation)                                │
│  ├─ Utils (Helpers)                                         │
│  └─ Constants                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Componentes Principais

### 1. Backend (packages/backend)

**Framework**: NestJS (TypeScript)  
**Porta**: 3000

#### Módulos Principais

```
src/
├── auth/              # Autenticação JWT + Firebase Auth
├── sales/             # Lógica de vendas
│   ├── sales.controller.ts
│   ├── sales.service.ts
│   ├── sale.schema.ts
│   └── dto/
├── products/          # Catálogo de produtos
├── payments/          # Processamento de pagamentos
│   └── tef/          # Integração de máquinas
├── integrations/      # Conexões externas
│   ├── tef/
│   │   ├── abstract-provider.ts
│   │   ├── stone/
│   │   ├── elo/
│   │   └── ingenico/
│   ├── printer/
│   └── barcode/
├── stores/           # Multi-loja
├── users/            # Gestão de usuários
├── reports/          # Relatórios e analytics
└── common/           # Guards, Pipes, Interceptors
```

#### Padrão de Serviço

```typescript
// sales.service.ts
@Injectable()
export class SalesService {
  constructor(private firestore: FirestoreService) {}

  async createSale(createSaleDto: CreateSaleDto) {
    const sale = new Sale(createSaleDto);
    return this.firestore.collection('sales').add(sale);
  }
}

// sales.controller.ts
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }
}
```

### 2. Web App (packages/web)

**Framework**: React 18 + Vite  
**Porta**: 5173

#### Estrutura de Componentes

```
src/
├── components/
│   ├── PDVScreen/
│   │   ├── ProductList.tsx
│   │   ├── Cart.tsx
│   │   ├── PaymentForm.tsx
│   │   └── Receipt.tsx
│   ├── Dashboard/
│   │   ├── SalesChart.tsx
│   │   ├── ReportTable.tsx
│   │   └── KPIs.tsx
│   └── Common/
│       ├── Header.tsx
│       └── Sidebar.tsx
├── pages/
│   ├── PDVPage.tsx
│   ├── DashboardPage.tsx
│   └── LoginPage.tsx
├── hooks/
│   ├── useSales.ts
│   ├── useProducts.ts
│   └── useAuth.ts
├── stores/
│   ├── saleStore.ts
│   ├── authStore.ts
│   └── uiStore.ts
├── services/
│   └── api.ts
└── types/
    └── index.ts
```

#### State Management (Zustand)

```typescript
// stores/saleStore.ts
interface SaleStore {
  items: SaleItem[];
  addItem: (item: SaleItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
}

export const useSaleStore = create<SaleStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
  get total() { /* ... */ }
}));
```

### 3. Mobile App (packages/mobile)

**Framework**: React Native + Expo  
**Build**: Expo CLI

#### Estrutura

```
src/
├── screens/
│   ├── PDVScreen.tsx
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── ProductCard.tsx
│   ├── CartItem.tsx
│   └── PaymentModal.tsx
├── hooks/
│   ├── useBluetooth.ts
│   ├── useSyncManager.ts
│   └── useOfflineQueue.ts
├── services/
│   ├── api.ts
│   ├── storage.ts
│   └── sqlite.ts
└── navigation/
    └── RootNavigator.tsx
```

#### Offline-First com SQLite + AsyncStorage

```typescript
// services/sqlite.ts
import SQLite from 'react-native-sqlite-storage';

export class StorageService {
  async saveSaleOffline(sale: Sale) {
    const db = await SQLite.openDatabase({
      name: 'claudepp.db',
      location: 'default',
    });

    return db.executeSql(
      'INSERT INTO sales (id, data, synced) VALUES (?, ?, ?)',
      [sale.id, JSON.stringify(sale), 0]
    );
  }
}
```

### 4. Shared Code (packages/shared)

Código compartilhado entre backend, web e mobile.

```
src/
├── types/
│   ├── sale.ts
│   ├── product.ts
│   ├── payment.ts
│   ├── user.ts
│   └── store.ts
├── schemas/
│   ├── sale.schema.ts
│   ├── product.schema.ts
│   └── payment.schema.ts
├── utils/
│   ├── currency.ts
│   ├── date.ts
│   └── validation.ts
└── constants/
    ├── payment-methods.ts
    ├── roles.ts
    └── status.ts
```

## 🔄 Fluxos de Dados

### Fluxo de Venda (Happy Path)

```
1. PDV Screen
   └─> Adiciona produtos ao carrinho (Zustand store)
   └─> Seleciona forma de pagamento
   └─> Envia para Backend (/api/v1/sales POST)

2. Backend (Sales Controller)
   └─> Valida dados com Zod schema
   └─> Chama SalesService.createSale()
   └─> Salva em Firestore

3. Sync Manager
   └─> Ouve mudanças no Firestore (Real-time)
   └─> Atualiza estado na Web/Mobile

4. Máquinas (se pagamento em cartão)
   └─> TEF Service processa pagamento
   └─> Impressora imprime recibo
   └─> Leitor registra venda
```

### Fluxo de Sincronização Offline

```
1. Venda criada OFFLINE
   └─> SQLite (Mobile) / IndexedDB (Web)
   └─> BullMQ Queue salva (Backend)

2. Aplicativo reconecta à internet
   └─> SyncManager inicia replicação
   └─> Envia dados para backend
   └─> Backend confirma em Firestore

3. Sincronização completa
   └─> Remove de fila local
   └─> UI confirma ao usuário
```

## 🔐 Segurança

### Autenticação

```
JWT Token Flow:
1. Usuário faz login → Email/Senha
2. Firebase Auth valida
3. Backend gera JWT token
4. Frontend armazena (localStorage/AsyncStorage)
5. API valida token em cada request via Guard
```

### Criptografia

```
- Dados sensíveis (cartão, CPF) → AES-256
- Comunicação → HTTPS/TLS
- JWT → HS256/RS256
```

### Autorização (RBAC)

```typescript
// roles.guard.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Post()
create(@Body() dto: CreateDto) {
  // Apenas admin e manager podem criar
}
```

## 🗄️ Banco de Dados

### Firestore Collections

```
claudepp-project/
├── stores/{storeId}/
│   ├── sales/{saleId}
│   │   ├── items: SaleItem[]
│   │   ├── payment: PaymentInfo
│   │   └── status: string
│   ├── products/{productId}
│   │   ├── name: string
│   │   ├── price: number
│   │   └── stock: number
│   └── users/{userId}
│       ├── email: string
│       ├── role: string
│       └── active: boolean
```

## 📊 Fila de Processamento (BullMQ)

```
Queues:
├── sales-print      # Impressão de recibos
├── tef-processing   # Processamento TEF
├── sync-replication # Sincronização offline
└── reports          # Geração de relatórios
```

## 🔗 Integração de Máquinas

### TEF (Máquina de Cartão)

```typescript
// integrations/tef/payment.service.ts
class PaymentService {
  async processPayment(amount: number) {
    const provider = this.providerFactory.create('stone');
    const result = await provider.processPayment(amount, {
      cardPresent: true,
      installments: 3,
    });
    
    if (result.status === 'approved') {
      await this.printerService.print(result.receipt);
    }
  }
}
```

### Impressora Térmica

```typescript
// integrations/printer/printer.service.ts
class PrinterService {
  async print(receipt: Receipt) {
    const escpos = this.formatESCPOS(receipt);
    await this.bluetoothService.send(escpos);
  }
}
```

## 📈 Monitoramento e Logging

```typescript
// common/logger.ts
@Injectable()
export class LoggerService {
  log(context: string, message: string, data?: any) {
    console.log(`[${context}] ${message}`, data);
    // Enviar para Sentry/DataDog em produção
  }
}
```

## 🚀 Deployment

### Arquitetura de Produção

```
┌─────────────────────────────────────────┐
│         Cloudflare / CDN                │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌────▼────┐ ┌───▼────┐
   │ Web App │  │ Backend │ │ Mobile │
   │(Vercel) │  │(Cloud   │ │(App    │
   │         │  │ Run)    │ │ Store) │
   └────┬────┘  └────┬────┘ └───┬────┘
        │            │           │
        └────────────┼───────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
    ┌────▼──────┐         ┌──────▼────┐
    │ Firestore │         │   Cloud   │
    │ (Google)  │         │   Storage │
    └───────────┘         └───────────┘
```

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
on: [push]

jobs:
  build:
    - Test (Jest)
    - Lint (ESLint)
    - Type Check (TSC)
    - Build (Vite, NestJS)

  deploy:
    - Deploy Backend (Cloud Run)
    - Deploy Web (Vercel)
    - Deploy Mobile (App Store / Play Store)
```

---

**Status**: Em desenvolvimento 🚀  
**Versão**: 0.1.0
