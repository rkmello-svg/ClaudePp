import { LLMProvider, LLMMessage, LLMResponse, LLMProviderConfig, LLMTool } from '../llm-provider'

export class ClaudeProvider extends LLMProvider {
  private client: any

  constructor(config: LLMProviderConfig = {}) {
    super(config)

    this.apiKey = config.apiKey || process.env.VITE_ANTHROPIC_API_KEY || ''
    this.model = config.model || process.env.VITE_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'

    if (!this.apiKey) {
      console.warn('Claude API key not configured. AI agents will not work.')
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk').default
      this.client = new Anthropic({ apiKey: this.apiKey })
    } catch (err) {
      console.warn('Anthropic SDK not installed. Install via: npm install @anthropic-ai/sdk')
    }
  }

  async chat(
    messages: LLMMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      tools?: LLMTool[]
      systemPrompt?: string
    },
  ): Promise<LLMResponse> {
    if (!this.client) {
      return {
        content: 'Claude provider not initialized. Check VITE_ANTHROPIC_API_KEY.',
        stop_reason: 'error',
      }
    }

    try {
      const tools = options?.tools?.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema,
      }))

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        system: options?.systemPrompt || '',
        tools: tools && tools.length > 0 ? tools : undefined,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      })

      let content = ''
      const toolCalls: Array<{
        id: string
        name: string
        input: Record<string, any>
      }> = []

      for (const block of response.content) {
        if (block.type === 'text') {
          content = block.text
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            name: block.name,
            input: block.input,
          })
        }
      }

      return {
        content,
        stop_reason: response.stop_reason as any,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      }
    } catch (err: any) {
      console.error('Claude API error:', err.message)
      return {
        content: `Error: ${err.message}`,
        stop_reason: 'error',
      }
    }
  }

  getProviderName(): string {
    return 'Claude'
  }
}
