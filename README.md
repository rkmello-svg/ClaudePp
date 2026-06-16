# ERP Enterprise OS

**Business Operating System para PMEs Brasileiras**

Um sistema integrado de ERP, CRM, Fiscal, RH e BI com IA aplicada para transformar PMEs em empresas orientadas por dados.

## 🚀 Quick Start

### 1. Clonar e Instalar

```bash
git clone https://github.com/rkmello-svg/ClaudePp.git
cd ClaudePp
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Adicione suas credenciais do Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Executar Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação abrirá em `http://localhost:3000`

## 🏗️ Arquitetura

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

## 📦 Estrutura de Projeto

```
├── src/
│   ├── components/      # Componentes React
│   ├── pages/           # Páginas
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   ├── services/        # Serviços
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilidades
│   └── lib/             # Configurações
├── supabase/
│   └── migrations/      # Migrações SQL
└── public/              # Assets estáticos
```

## 🔑 Principais Módulos

### Autenticação
- Login/Signup com email
- MFA (Multi-Factor Authentication)
- Gerenciamento de sessão
- Recuperação de senha

### Multi-Empresa
- Isolamento de dados por company_id
- Row Level Security (RLS)
- Gerenciamento de filiais
- Permissões por papel

### CRM
- Gestão de clientes
- Histórico de interações
- Tagging e segmentação
- Funil de vendas

### Financeiro
- Faturamento
- Gestão de recebíveis
- Fluxo de caixa
- Relatórios financeiros

### Fiscal
- NF-e (em desenvolvimento)
- eSocial (em desenvolvimento)
- SPED (em desenvolvimento)
- Planejamento tributário

### IA
- Agentes inteligentes
- Automação de fluxos
- Análise de dados
- Recomendações

## 🧪 Testes

```bash
npm run test
```

## 📚 Documentação

- [CLAUDE.md](./CLAUDE.md) - Documentação técnica completa
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commits semânticos
3. Abra um pull request

## 📝 Licença

Proprietary - Todos os direitos reservados

## 👤 Autor

Desenvolvido por [rkmello@gmail.com](mailto:rkmello@gmail.com)

---

**Status**: 🚀 Em desenvolvimento ativo