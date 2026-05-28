# Setup e Configuração - ClaudePP PDV

Guia completo de instalação e configuração do sistema ClaudePP.

## 📋 Pré-requisitos

- **Node.js**: v20.0.0 ou superior
  ```bash
  node --version  # v20.0.0+
  ```

- **Yarn**: v4.0.0 ou superior
  ```bash
  yarn --version  # v4.0.0+
  npm install -g yarn
  ```

- **Git**: Configurado com chave SSH/HTTPS

- **Firebase Project**: Criado em [console.firebase.google.com](https://console.firebase.google.com)

- **Docker** (opcional): Para desenvolvimento com SDKs

## 🔧 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/rkmello-svg/claudepp.git
cd ClaudePp

# Ou com SSH
git clone git@github.com:rkmello-svg/claudepp.git
cd ClaudePp
```

### 2. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite com suas variáveis
nano .env.local
```

#### Variáveis Necessárias

```bash
# Backend
NODE_ENV=development
PORT=3000

# Firebase
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=seu_project.firebaseapp.com
FIREBASE_PROJECT_ID=seu_project
FIREBASE_STORAGE_BUCKET=seu_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_id
FIREBASE_APP_ID=seu_id

# JWT
JWT_SECRET=sua_secret_key_segura
JWT_EXPIRATION=7d

# TEF Configuration (opcional para Fase 1)
TEF_PROVIDER=stone
TEF_STONE_APP_ID=seu_app_id
TEF_STONE_MERCHANT_ID=seu_merchant_id
```

### 3. Instale Dependências

```bash
# Instala dependências em todos os workspaces
yarn install

# Ou específico:
yarn workspace @claudepp/backend install
```

### 4. Build do Shared Package

```bash
# Compila os tipos compartilhados
yarn workspace @claudepp/shared build
```

## 🚀 Desenvolvimento

### Iniciar Todos os Serviços

```bash
yarn dev
```

Isso inicia:
- Backend em `http://localhost:3000/api/v1`
- Web em `http://localhost:5173`
- Mobile em Expo (abra no seu terminal)

### Iniciar Individualmente

```bash
# Terminal 1: Backend
yarn backend:dev
# Output: ✅ Backend rodando em http://localhost:3000

# Terminal 2: Web
yarn web:dev
# Output: ✅ Web rodando em http://localhost:5173

# Terminal 3: Mobile
yarn mobile:dev
# Output: Expo started...
```

### Verificar Saúde do Backend

```bash
curl http://localhost:3000/api/v1/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-05-28T10:30:00.000Z",
  "service": "ClaudePP Backend v0.1.0"
}
```

## 🐳 Docker (Opcional)

Para desenvolvimento com SDKs e dependências de sistema:

```bash
# Build da imagem
docker-compose build

# Inicie os serviços
docker-compose up

# Ou em background
docker-compose up -d
```

Ver `docker-compose.yml` para mais detalhes.

## 🔐 Firebase Setup

### 1. Crie um Projeto Firebase

1. Vá para [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Create Project"
3. Preencha o nome e configure

### 2. Ative Firestore Database

1. No console Firebase, vá para "Build" → "Firestore Database"
2. Clique em "Create Database"
3. Inicie em modo de teste (mudar em produção)
4. Escolha localização (ex: `nam5` para Brasil)

### 3. Ative Firebase Auth

1. Vá para "Build" → "Authentication"
2. Clique em "Get Started"
3. Ative "Email/Password"

### 4. Crie Service Account

1. Vá para "Project Settings" → "Service Accounts"
2. Clique em "Generate New Private Key"
3. Salve o arquivo JSON seguramente
4. Use para `firebase-admin` no backend

## 🛠️ SDKs de Licenciadoras (Fase 3)

### Stone

```bash
# 1. Baixe o SDK em https://developer.stone.com.br
# 2. Descompacte em /opt/tef-sdks/stone/

# 3. Configure as variáveis
export TEF_STONE_APP_ID="seu_app_id"
export TEF_STONE_MERCHANT_ID="seu_merchant_id"
```

### Elo

```bash
# 1. Solicite o SDK Elo Innovatech
# 2. Descompacte em /opt/tef-sdks/elo/

# 3. Compile o wrapper Node.js
cd packages/backend/src/integrations/tef/sdk/elo
npm run build:wrapper
```

### Ingenico

Similar ao processo Elo.

## 🧪 Testes

```bash
# Todos os testes
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov

# Teste específico
yarn workspace @claudepp/backend test auth
```

## 📦 Build para Produção

```bash
# Build de todos os workspaces
yarn build

# Outputs:
# - packages/backend/dist/
# - packages/web/dist/
# - packages/mobile/build/
# - packages/shared/dist/
```

## 🚢 Deploy

Ver [docs/DEPLOYMENT.md](./DEPLOYMENT.md) para instruções de deploy em produção.

## 🐛 Troubleshooting

### Erro: "Cannot find module '@claudepp/shared'"

```bash
# Resolva reconstruindo o shared
yarn workspace @claudepp/shared build
yarn install
```

### Porta 3000 já está em uso

```bash
# Use outra porta
PORT=3001 yarn backend:dev

# Ou mate o processo
lsof -i :3000
kill -9 <PID>
```

### Firebase connection refused

```bash
# Verifique as variáveis de ambiente
echo $FIREBASE_PROJECT_ID

# Verifique credenciais no .env.local
```

### Node modules corrompidos

```bash
# Limpe e reinstale
rm -rf node_modules yarn.lock
yarn install
```

## 📚 Próximos Passos

1. ✅ Setup inicial concluído
2. ⬜ Ler [ARCHITECTURE.md](./ARCHITECTURE.md)
3. ⬜ Explorar [API.md](./API.md)
4. ⬜ Implementar Fase 2: MVP Core

## 🆘 Suporte

- 📧 Email: rkmello2030@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/rkmello-svg/claudepp/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/rkmello-svg/claudepp/discussions)

---

**Versão**: 0.1.0  
**Última atualização**: 2025-05-28
