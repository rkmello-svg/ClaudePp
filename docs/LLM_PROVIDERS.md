# LLM Providers Configuration

O sistema de IA do Enterprise OS suporta múltiplos provedores de LLM com uma abstração agnóstica.

## Provedores Suportados

### 1. Claude (Anthropic) — Recomendado ✅

**Modelo Padrão**: `claude-3-5-sonnet-20241022`

```bash
npm install @anthropic-ai/sdk
```

**Configuração (.env.local)**:
```
VITE_LLM_PROVIDER=claude
VITE_ANTHROPIC_API_KEY=sk-ant-your-api-key
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

**Recursos**:
- Suporta tool use (function calling)
- Excelente para análise financeira
- Raciocínio estruturado em IA agents
- Melhor custo-benefício para automação empresarial

### 2. OpenAI (GPT-4)

**Modelo Padrão**: `gpt-4-turbo`

```bash
npm install openai
```

**Configuração (.env.local)**:
```
VITE_LLM_PROVIDER=openai
VITE_OPENAI_API_KEY=sk-proj-your-api-key
VITE_OPENAI_MODEL=gpt-4-turbo
```

**Recursos**:
- API madura e confiável
- Suporta function calling
- Latência um pouco maior

### 3. Google Gemini

**Modelo Padrão**: `gemini-1.5-pro`

```bash
npm install @google/generative-ai
```

**Configuração (.env.local)**:
```
VITE_LLM_PROVIDER=gemini
VITE_GEMINI_API_KEY=your-api-key
VITE_GEMINI_MODEL=gemini-1.5-pro
```

**Recursos**:
- Modelo nova geração
- Suporta tool use
- Preços competitivos

---

## Como Usar

### 1. Selecionar o Provider

```env
VITE_LLM_PROVIDER=claude  # ou 'openai' ou 'gemini'
```

O sistema carrega automaticamente o provider correto.

### 2. Agents Usam LLM Automaticamente

Os agents (Sales, Finance, Inventory) já estão wired para usar o LLM:

```typescript
// Sales Agent
const agent = new SalesAgent(company_id)
const analysis = await agent.execute({ action: 'get_recommendations' })
// Retorna análise com insights gerados por LLM
```

### 3. Fallback para Heurístico

Se a chave de API não estiver configurada, os agents:
- ✅ Continuam funcionando com análise heurística (determinística)
- ⚠️ Não geram insights naturais de LLM
- 📊 Retornam dados estruturados (métricas, recomendações básicas)

---

## Arquitetura

```
src/services/ai/
├── llm-provider.ts                    # Interface abstrata + Factory
├── providers/
│   ├── claude-provider.ts             # Implementação Claude
│   ├── openai-provider.ts             # Implementação OpenAI
│   └── gemini-provider.ts             # Implementação Gemini
├── base-agent.ts                      # BaseAgent com callLLM()
├── sales-agent.ts                     # Usa callLLM() para análises
├── finance-agent.ts                   # Usa callLLM() para estratégia
└── inventory-agent.ts                 # Usa callLLM() para recomendações
```

### Fluxo de Inicialização

1. `LLMProviderFactory.getDefaultProvider()` lê `VITE_LLM_PROVIDER`
2. Factory instancia o provider correto
3. BaseAgent injeta o provider
4. Agents chamam `this.callLLM(messages, tools)`
5. Provider executa a chamada de API
6. Resultado retorna para o agent

---

## Custo Estimado (USD/mês)

### Claude (Recomendado)
- Analista de 100 empresas
- 5 agent executions/empresa/dia
- Input: ~500 tokens/exec, Output: ~200 tokens/exec
- **Estimativa**: $150-200/mês

### OpenAI (GPT-4)
- Mesma carga
- **Estimativa**: $300-400/mês

### Gemini
- Mesma carga
- **Estimativa**: $80-120/mês

---

## Exemplo: Adicionar Novo Provider (Azure OpenAI)

1. Criar `src/services/ai/providers/azure-provider.ts`:

```typescript
import { LLMProvider, LLMMessage, LLMResponse, LLMProviderConfig } from '../llm-provider'

export class AzureProvider extends LLMProvider {
  async chat(messages, options) {
    // Implementar chamada Azure
  }
  getProviderName() { return 'Azure' }
}
```

2. Atualizar `llm-provider.ts` Factory:

```typescript
private static createAzureProvider(config?: LLMProviderConfig): LLMProvider {
  const { AzureProvider } = require('./providers/azure-provider')
  return new AzureProvider(config)
}
```

3. Usar:

```env
VITE_LLM_PROVIDER=azure
VITE_AZURE_API_KEY=...
```

---

## Troubleshooting

### "Claude provider not initialized"

- ✓ Verificar `VITE_ANTHROPIC_API_KEY` em `.env.local`
- ✓ Regenerar chave em https://console.anthropic.com
- ✓ Reiniciar dev server: `npm run dev`

### Agent retorna texto vazio

- ✓ Verificar logs: `console.error` em `claude-provider.ts`
- ✓ Validar chave de API (premium organization)
- ✓ Verificar quota de requisições

### Latência alta

- ✓ Considerar modelo mais rápido (claude-3-haiku)
- ✓ Reduzir `maxTokens` em `callLLM()`
- ✓ Implementar caching de resultados

---

## Próximos Passos

- [ ] Implementar caching de respostas LLM
- [ ] Adicionar prompt engineering por vertical
- [ ] Multi-language suporte (responder em língua do usuário)
- [ ] Embeddings para semantic search
- [ ] Fine-tuning com dados históricos
