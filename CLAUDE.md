# ERP Enterprise OS

## 🎯 Visão

Business Operating System (BOS) integrado para PMEs brasileiras. Funciona como ERP + CRM + Fiscal + RH + BI + IA.

## 🏗️ Arquitetura

**Frontend**: React + TypeScript + Tailwind (via Lovable)  
**Backend**: Supabase (PostgreSQL + Auth + Realtime)  
**Storage**: Supabase Storage  
**Auth**: Supabase Auth + MFA  

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes React reutilizáveis
├── pages/            # Páginas (auth, onboarding, dashboard)
├── layouts/          # Layouts principais
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
├── services/         # Serviços de API/BD
├── types/            # TypeScript types
├── utils/            # Funções utilitárias
├── constants/        # Constantes
├── contexts/         # React contexts
├── assets/           # Imagens, ícones
└── lib/              # Bibliotecas configuradas

supabase/
└── migrations/       # Migrações SQL
```

## 🔐 Segurança

- **RLS**: Todas as tabelas protegidas com Row Level Security
- **RBAC**: Sistema de papéis (Owner, Admin, Manager, Operator, Viewer)
- **MFA**: Autenticação multi-fator via Supabase
- **LGPD**: Compliance com Lei Geral de Proteção de Dados
- **Auditoria**: Todos os acessos registrados em audit_logs

## 🔄 Fluxo de Dados

1. **Autenticação**: Supabase Auth → Profile atualizado
2. **Company Context**: User carrega company_id na sessão
3. **RLS**: Todas queries filtradas por company_id
4. **Real-time**: Supabase Realtime para atualizações
5. **Auditoria**: Toda ação registrada em audit_logs

## 📊 Tabelas Principais

- `users` - Usuários (Supabase Auth)
- `profiles` - Perfil do usuário
- `companies` - Empresas (multi-tenant)
- `branches` - Filiais da empresa
- `permissions` - Permissões por usuário
- `customers` - Clientes
- `products` - Produtos/Serviços
- `invoices` - Notas fiscais
- `audit_logs` - Logs de auditoria

## 🚀 Desenvolvimento

### Setup Local

```bash
npm install
npm run dev
```

### Variáveis de Ambiente

Crie `.env.local`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Migrações de Banco

```bash
npx supabase migration list
npx supabase db push
npx supabase db reset
```

## 📋 Padrões de Código

### Tipos
- Sempre use tipos TypeScript
- Exportar types de `src/types/index.ts`

### Componentes
- Functional components com hooks
- Props tipadas
- Evitar lógica complexa (extrair para hooks)

### Estado
- Zustand para estado global
- useState para estado local
- useAuth hook para sessão

### Serviços
- Abstrair lógica de API em `services/`
- Sempre usar supabase.from().select()

### Segurança
- NUNCA expor chaves privadas em cliente
- RLS em todas as queries
- Validar entrada em forms

## 🎨 Design DNA

- **Cores**: Azul (#0ea5e9) como primária
- **Animations**: Fade in, slide in
- **Mobile First**: Responsivo desde mobile
- **Glass**: Efeito glassmorphism leve

## 📈 Roadmap

**Fase 1**: Fundação (Auth, Company, Permissions)  
**Fase 2**: Core Business (CRM básico, Financeiro)  
**Fase 3**: Fiscal (NF-e, eSocial)  
**Fase 4**: IA (Agents, Automation)  
**Fase 5**: Marketplace (Modules, Verticals)  

## 🤝 Git Workflow

- Branch: `claude/erp-enterprise-os-build-lmycvh`
- Commits: Descritivos e semânticos
- Push: `git push -u origin [branch]`

## 📞 Contato

Desenvolvedor: rkmello@gmail.com
