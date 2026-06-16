import { supabase } from '@/lib/supabase'
import { BaseAgent, AgentTool } from './base-agent'

export class FinanceAgent extends BaseAgent {
  constructor(company_id: string) {
    super(company_id, 'finance-agent')
  }

  getSystemPrompt(): string {
    return `Você é um agente especializado em análise financeira. Suas responsabilidades:
1. Analisar fluxo de caixa e projeções
2. Identificar gargalos financeiros
3. Recomendar ações para melhorar liquidez
4. Alertar sobre riscos de insolvência
5. Otimizar ciclo financeiro

Forneça análises baseadas em dados. Seja específico com números.`
  }

  getTools(): AgentTool[] {
    return [
      {
        name: 'analyze_cash_flow',
        description: 'Analisa fluxo de caixa',
        parameters: { period: 'number' },
      },
      {
        name: 'assess_financial_health',
        description: 'Avalia saúde financeira',
        parameters: {},
      },
      {
        name: 'identify_overdue_receivables',
        description: 'Identifica contas a receber vencidas',
        parameters: {},
      },
    ]
  }

  async execute(input: Record<string, any>) {
    const startTime = Date.now()

    try {
      const { action, ...params } = input

      let result

      switch (action) {
        case 'analyze_cash_flow':
          result = await this.analyzeCashFlow(params)
          break
        case 'assess_health':
          result = await this.assessFinancialHealth(params)
          break
        case 'get_receivables':
          result = await this.getOverdueReceivables(params)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }

      const executionTime = Date.now() - startTime
      await this.logExecution(input, result, 'completed', undefined, executionTime)

      return result
    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      await this.logExecution(input, null, 'failed', errorMsg, executionTime)
      throw error
    }
  }

  private async analyzeCashFlow(params: Record<string, any>) {
    const period = params.period || 30
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000)

    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, status, issue_date')
      .eq('company_id', this.company_id)
      .gte('issue_date', startDate.toISOString().split('T')[0])

    if (!invoices) {
      return {
        period,
        incoming: 0,
        pending: 0,
        overdue: 0,
        net_cash_flow: 0,
        projection: 'insufficient_data',
      }
    }

    const paid = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total_amount, 0)

    const pending = invoices
      .filter(i => i.status === 'issued')
      .reduce((sum, i) => sum + i.total_amount, 0)

    const overdue = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + i.total_amount, 0)

    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const nextWeekIncoming = invoices
      .filter(i => i.status === 'issued' && i.issue_date <= nextWeek)
      .reduce((sum, i) => sum + i.total_amount, 0)

    return {
      period,
      incoming_received: parseFloat(paid.toFixed(2)),
      pending_invoices: parseFloat(pending.toFixed(2)),
      overdue_invoices: parseFloat(overdue.toFixed(2)),
      net_cash_flow: parseFloat((paid - overdue).toFixed(2)),
      expected_next_7_days: parseFloat(nextWeekIncoming.toFixed(2)),
      cash_position: paid > overdue * 1.5 ? 'healthy' : paid > overdue ? 'stable' : 'strained',
      recommendation: this.generateCashFlowRecommendation(paid, overdue, pending),
    }
  }

  private async assessFinancialHealth(_params: Record<string, any>) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, status')
      .eq('company_id', this.company_id)

    if (!invoices || invoices.length === 0) {
      return {
        financial_health_score: 0,
        status: 'insufficient_data',
      }
    }

    const paid = invoices.filter(i => i.status === 'paid').length
    const total = invoices.length
    const paymentRate = paid / total

    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total_amount, 0)

    const overdue = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + i.total_amount, 0)

    // Health score: 100 * (payment_rate * 0.6 + (1 - overdue/total_revenue) * 0.4)
    const healthScore = Math.max(
      0,
      100 * (paymentRate * 0.6 + Math.max(0, 1 - overdue / (totalRevenue || 1)) * 0.4),
    )

    const metrics = {
      payment_rate: parseFloat((paymentRate * 100).toFixed(1)),
      overdue_percentage: parseFloat(((overdue / totalRevenue) * 100).toFixed(1)),
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      total_overdue: parseFloat(overdue.toFixed(2)),
    }

    return {
      financial_health_score: parseFloat(healthScore.toFixed(1)),
      status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : healthScore > 40 ? 'fair' : 'poor',
      metrics,
      recommendation: this.generateHealthRecommendation(healthScore, metrics),
    }
  }

  private async getOverdueReceivables(_params: Record<string, any>) {
    const today = new Date().toISOString().split('T')[0]

    const { data: overdue } = await supabase
      .from('invoices')
      .select(`
        id,
        number,
        total_amount,
        due_date,
        customer:customers(name, email, phone)
      `)
      .eq('company_id', this.company_id)
      .eq('status', 'overdue')
      .lt('due_date', today)
      .order('due_date')

    if (!overdue || overdue.length === 0) {
      return {
        total_overdue_invoices: 0,
        total_overdue_amount: 0,
        invoices: [],
        collection_recommendation: 'Nenhuma cobrança pendente. Excelente!',
      }
    }

    const totalAmount = overdue.reduce((sum, i) => sum + i.total_amount, 0)
    const avgDaysOverdue = overdue.reduce((sum, i) => {
      const days = Math.floor((Date.now() - new Date(i.due_date).getTime()) / (24 * 60 * 60 * 1000))
      return sum + days
    }, 0) / overdue.length

    const invoiceList = overdue.map(inv => {
      const customer = Array.isArray(inv.customer) ? inv.customer[0] : inv.customer
      return {
        invoice_id: inv.id,
        number: inv.number,
        amount: inv.total_amount,
        days_overdue: Math.floor((Date.now() - new Date(inv.due_date).getTime()) / (24 * 60 * 60 * 1000)),
        customer_name: customer?.name ?? null,
        customer_email: customer?.email ?? null,
        contact_phone: customer?.phone ?? null,
      }
    })

    return {
      total_overdue_invoices: overdue.length,
      total_overdue_amount: parseFloat(totalAmount.toFixed(2)),
      average_days_overdue: parseFloat(avgDaysOverdue.toFixed(1)),
      invoices: invoiceList,
      priority_invoices: invoiceList.filter(i => i.days_overdue > 30),
      collection_recommendation: this.generateCollectionPlan(overdue.length, totalAmount, avgDaysOverdue),
    }
  }

  private generateCashFlowRecommendation(incoming: number, overdue: number, _pending: number): string {
    if (incoming > overdue * 2) {
      return '✅ Fluxo de caixa saudável. Continue neste ritmo.'
    } else if (incoming > overdue) {
      return '⚠️ Fluxo de caixa estável. Monitore cobranças vencidas.'
    } else {
      return `🚨 ALERTA: Insuficiência de caixa! Priorize cobrança de R$ ${overdue.toFixed(2)} em atraso.`
    }
  }

  private generateHealthRecommendation(_score: number, metrics: any): string {
    const recommendations = []

    if (metrics.payment_rate < 0.8) {
      recommendations.push('Melhorar taxa de recebimento')
    }

    if (metrics.overdue_percentage > 10) {
      recommendations.push('Intensificar cobrança de inadimplentes')
    }

    if (recommendations.length === 0) {
      return '✅ Saúde financeira excelente!'
    }

    return recommendations.join('. ') + '.'
  }

  private generateCollectionPlan(count: number, amount: number, avgDays: number): string {
    if (avgDays > 60) {
      return `🚨 CRÍTICO: ${count} faturas vencidas há ${Math.floor(avgDays)} dias. Considere encaminhar para cobrança judicial. Total: R$ ${amount.toFixed(2)}`
    } else if (avgDays > 30) {
      return `⚠️ URGENTE: ${count} faturas vencidas há ${Math.floor(avgDays)} dias. Contate clientes imediatamente. Total: R$ ${amount.toFixed(2)}`
    } else {
      return `Acompanhar ${count} faturas vencidas. Contato de cobrança recomendado.`
    }
  }
}
