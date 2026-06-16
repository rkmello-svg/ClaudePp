import { LLMProvider, LLMMessage, LLMResponse, LLMProviderConfig, LLMTool } from '../llm-provider'

export class GeminiProvider extends LLMProvider {
  private client: any

  constructor(config: LLMProviderConfig = {}) {
    super(config)

    this.apiKey = config.apiKey || process.env.VITE_GEMINI_API_KEY || ''
    this.model = config.model || process.env.VITE_GEMINI_MODEL || 'gemini-1.5-pro'

    if (!this.apiKey) {
      console.warn('Gemini API key not configured.')
    }

    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai')
      this.client = new GoogleGenerativeAI(this.apiKey)
    } catch (err) {
      console.warn('Google Generative AI SDK not installed. Install via: npm install @google/generative-ai')
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
        content: 'Gemini provider not initialized. Check VITE_GEMINI_API_KEY.',
        stop_reason: 'error',
      }
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: options?.systemPrompt || undefined,
        tools: options?.tools
          ? [
              {
                functionDeclarations: options.tools.map((tool) => ({
                  name: tool.name,
                  description: tool.description,
                  parameters: tool.input_schema,
                })),
              },
            ]
          : undefined,
      })

      const chatHistory = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))

      const chat = model.startChat({ history: chatHistory })
      const result = await chat.sendMessage(messages[messages.length - 1].content)

      let content = ''
      const toolCalls: Array<{
        id: string
        name: string
        input: Record<string, any>
      }> = []

      const response = result.response
      content = response.text()

      if (response.functionCalls) {
        for (const call of response.functionCalls()) {
          toolCalls.push({
            id: Math.random().toString(36).substring(7),
            name: call.name,
            input: call.args as Record<string, any>,
          })
        }
      }

      return {
        content,
        stop_reason: response.functionCalls ? 'tool_use' : 'end_turn',
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      }
    } catch (err: any) {
      console.error('Gemini API error:', err.message)
      return {
        content: `Error: ${err.message}`,
        stop_reason: 'error',
      }
    }
  }

  getProviderName(): string {
    return 'Gemini'
  }
}
