import { supabase } from '@/lib/supabase'

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, any>
}

export interface AgentExecution {
  id: string
  company_id: string
  agent_id: string
  trigger_type: 'user_request' | 'schedule' | 'event'
  input: Record<string, any>
  output: Record<string, any>
  status: 'pending' | 'executing' | 'completed' | 'failed'
  error_message: string | null
  execution_time_ms: number
  created_at: string
}

export abstract class BaseAgent {
  protected company_id: string
  protected agent_name: string

  constructor(company_id: string, agent_name: string) {
    this.company_id = company_id
    this.agent_name = agent_name
  }

  abstract getTools(): AgentTool[]
  abstract execute(input: Record<string, any>): Promise<any>
  abstract getSystemPrompt(): string

  protected async logExecution(
    input: Record<string, any>,
    output: any,
    status: 'completed' | 'failed' = 'completed',
    error?: string,
    executionTime: number = 0,
  ) {
    try {
      await supabase.from('ai_agent_executions').insert({
        company_id: this.company_id,
        agent_id: this.agent_name,
        trigger_type: 'user_request',
        input,
        output,
        status,
        error_message: error || null,
        execution_time_ms: executionTime,
      })
    } catch (err) {
      console.error('Error logging execution:', err)
    }
  }

  protected async getCompanyData() {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('id', this.company_id)
      .single()

    return data
  }
}
