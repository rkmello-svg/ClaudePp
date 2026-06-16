export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMTool {
  name: string
  description: string
  input_schema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

export interface LLMResponse {
  content: string
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'error'
  tool_calls?: Array<{
    id: string
    name: string
    input: Record<string, any>
  }>
}

export interface LLMProviderConfig {
  apiKey?: string
  baseUrl?: string
  model?: string
}

export abstract class LLMProvider {
  protected apiKey: string
  protected baseUrl: string
  protected model: string

  constructor(config: LLMProviderConfig = {}) {
    this.apiKey = config.apiKey || ''
    this.baseUrl = config.baseUrl || ''
    this.model = config.model || ''
  }

  abstract chat(
    messages: LLMMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      tools?: LLMTool[]
      systemPrompt?: string
    },
  ): Promise<LLMResponse>

  abstract getProviderName(): string
}

export class LLMProviderFactory {
  static create(providerName: string, config?: LLMProviderConfig): LLMProvider {
    const normalizedName = (providerName || 'claude').toLowerCase()

    switch (normalizedName) {
      case 'claude':
        return this.createClaudeProvider(config)
      case 'openai':
        return this.createOpenAIProvider(config)
      case 'gemini':
        return this.createGeminiProvider(config)
      default:
        return this.createClaudeProvider(config)
    }
  }

  private static createClaudeProvider(config?: LLMProviderConfig): LLMProvider {
    const { ClaudeProvider } = require('./providers/claude-provider')
    return new ClaudeProvider(config)
  }

  private static createOpenAIProvider(config?: LLMProviderConfig): LLMProvider {
    const { OpenAIProvider } = require('./providers/openai-provider')
    return new OpenAIProvider(config)
  }

  private static createGeminiProvider(config?: LLMProviderConfig): LLMProvider {
    const { GeminiProvider } = require('./providers/gemini-provider')
    return new GeminiProvider(config)
  }

  static getDefaultProvider(): string {
    return process.env.VITE_LLM_PROVIDER || 'claude'
  }
}
