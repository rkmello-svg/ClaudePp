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
      case 'claude': {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { ClaudeProvider } = require('./providers/claude-provider')
        return new ClaudeProvider(config)
      }
      case 'openai': {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { OpenAIProvider } = require('./providers/openai-provider')
        return new OpenAIProvider(config)
      }
      case 'gemini': {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { GeminiProvider } = require('./providers/gemini-provider')
        return new GeminiProvider(config)
      }
      default: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { ClaudeProvider } = require('./providers/claude-provider')
        return new ClaudeProvider(config)
      }
    }
  }

  static getDefaultProvider(): string {
    return (typeof process !== 'undefined' && process.env?.VITE_LLM_PROVIDER) || 'claude'
  }
}
