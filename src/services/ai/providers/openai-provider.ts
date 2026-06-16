import { LLMProvider, LLMMessage, LLMResponse, LLMProviderConfig, LLMTool } from '../llm-provider'

export class OpenAIProvider extends LLMProvider {
  private client: any

  constructor(config: LLMProviderConfig = {}) {
    super(config)

    this.apiKey = config.apiKey || process.env.VITE_OPENAI_API_KEY || ''
    this.model = config.model || process.env.VITE_OPENAI_MODEL || 'gpt-4-turbo'

    if (!this.apiKey) {
      console.warn('OpenAI API key not configured.')
    }

    try {
      const OpenAI = require('openai').default
      this.client = new OpenAI({ apiKey: this.apiKey })
    } catch (err) {
      console.warn('OpenAI SDK not installed. Install via: npm install openai')
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
        content: 'OpenAI provider not initialized. Check VITE_OPENAI_API_KEY.',
        stop_reason: 'error',
      }
    }

    try {
      const tools = options?.tools?.map((tool) => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema,
        },
      }))

      const systemMessage = options?.systemPrompt
        ? [{ role: 'system' as const, content: options.systemPrompt }]
        : []

      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        tools: tools && tools.length > 0 ? tools : undefined,
        messages: [
          ...systemMessage,
          ...messages.map((msg) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          })),
        ],
      })

      let content = ''
      const toolCalls: Array<{
        id: string
        name: string
        input: Record<string, any>
      }> = []

      const firstChoice = response.choices[0]
      if (firstChoice.message.content) {
        content = firstChoice.message.content
      }

      if (firstChoice.message.tool_calls) {
        for (const toolCall of firstChoice.message.tool_calls) {
          if (toolCall.type === 'function') {
            toolCalls.push({
              id: toolCall.id,
              name: toolCall.function.name,
              input: JSON.parse(toolCall.function.arguments),
            })
          }
        }
      }

      return {
        content,
        stop_reason: (firstChoice.finish_reason === 'tool_calls' ? 'tool_use' : 'end_turn') as any,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      }
    } catch (err: any) {
      console.error('OpenAI API error:', err.message)
      return {
        content: `Error: ${err.message}`,
        stop_reason: 'error',
      }
    }
  }

  getProviderName(): string {
    return 'OpenAI'
  }
}
