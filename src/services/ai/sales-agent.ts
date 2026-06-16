import { supabase } from '@/lib/supabase'
import { BaseAgent, AgentTool } from './base-agent'

export class SalesAgent extends BaseAgent {
  constructor(company_id: string) {
    super(company_id, 'sales-agent')
  }

  getSystemPrompt(): string {
    return `Você é um agente de IA especializado em vendas. Suas responsabilidades:
1. Analisar dados de vendas e identificar padrões
2. Identificar clientes em risco de churn
3. Recomendar estratégias de retenção
4. Sugerir oportunidades de cross-sell e upsell
5. Alertar sobre tendências negativas nas vendas

Sempre cite dados e números específicos. Forneça recomendações acionáveis.`
  }

  getTools(): AgentTool[] {
    return [
      {
        name: 'analyze_sales_trends',
        description: 'Analisa tendências de vendas',
        parameters: { period: 'number', limit: 'number' },
      },
      {
        name: 'identify_at_risk_customers',
        description: 'Identifica clientes em risco',
        parameters: { days_without_purchase: 'number' },
      },
      {
        name: 'get_top_products',
        description: 'Retorna produtos mais vendidos',
        parameters: { limit: 'number' },
      },
    ]
  }

  async execute(input: Record<string, any>) {
    const startTime = Date.now()

    try {
      const { action, ...params } = input

      let result

      switch (action) {
        case 'analyze_trends':
          result = await this.analyzeTrends(params)
          break
        case 'identify_at_risk':
          result = await this.identifyAtRiskCustomers(params)
          break
        case 'get_recommendations':
          result = await this.getRecommendations(params)
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

  private async analyzeTrends(params: Record<string, any>) {
    const period = params.period || 30
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000)

    const { data: sales } = await supabase
      .from('invoices')
      .select('issue_date, total_amount, status')
      .eq('company_id', this.company_id)
      .gte('issue_date', startDate.toISOString().split('T')[0])

    if (!sales || sales.length === 0) {
      return {
        period,
        total_sales: 0,
        average_sale: 0,
        trend: 'insufficient_data',
        insights: 'Dados insuficientes para análise',
      }
    }

    const paidSales = sales.filter(s => s.status === 'paid')
    const totalRevenue = paidSales.reduce((sum, s) => sum + s.total_amount, 0)
    const avgSale = totalRevenue / paidSales.length

    // Simple trend: if more than 50% of sales in last week, it's trending up
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentSales = paidSales.filter(s => new Date(s.issue_date) >= oneWeekAgo)
    const trendIndicator = recentSales.length / paidSales.length

    return {
      period,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      average_sale: parseFloat(avgSale.toFixed(2)),
      total_transactions: paidSales.length,
      trend: trendIndicator > 0.3 ? 'upward' : trendIndicator < 0.1 ? 'downward' : 'stable',
      trend_indicator: parseFloat((trendIndicator * 100).toFixed(1)),
      insights: this.generateSalesTrendInsights(trendIndicator, totalRevenue, paidSales.length),
    }
  }

  private async identifyAtRiskCustomers(params: Record<string, any>) {
    const daysThreshold = params.days || 30
    const thresholdDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000)

    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('company_id', this.company_id)

    if (!customers) return { at_risk_customers: [] }

    const atRiskCustomers = []

    for (const customer of customers) {
      const { data: lastSale } = await supabase
        .from('invoices')
        .select('issue_date')
        .eq('customer_id', customer.id)
        .order('issue_date', { ascending: false })
        .limit(1)
        .single()

      if (!lastSale || new Date(lastSale.issue_date) < thresholdDate) {
        const { count } = await supabase
          .from('invoices')
          .select('*', { count: 'exact' })
          .eq('customer_id', customer.id)

        atRiskCustomers.push({
          customer_id: customer.id,
          name: customer.name,
          email: customer.email,
          days_inactive: Math.floor(
            (Date.now() - new Date(lastSale?.issue_date || 0).getTime()) / (24 * 60 * 60 * 1000),
          ),
          total_purchases: count || 0,
          recommendation: 'Enviar oferta exclusiva ou fazer contato direto',
        })
      }
    }

    return {
      at_risk_count: atRiskCustomers.length,
      at_risk_customers: atRiskCustomers,
    }
  }

  private async getRecommendations(params: Record<string, any>) {
    const trends = await this.analyzeTrends({ period: 90 })
    const atRisk = await this.identifyAtRiskCustomers({ days: 30 })

    const recommendations = []

    // Sales trend recommendations
    if (trends.trend === 'downward') {
      recommendations.push({
        priority: 'high',
        category: 'Sales',
        action: 'Aumentar atividades de marketing e vendas',
        reason: `Vendas em queda. Tendência: ${trends.trend_indicator}% de atividade recente`,
      })
    }

    // At-risk customer recommendations
    if (atRisk.at_risk_count > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Retention',
        action: `Acompanhar ${atRisk.at_risk_count} clientes inativos`,
        reason: `${atRisk.at_risk_count} clientes sem compras há mais de 30 dias`,
      })
    }

    // Revenue optimization
    recommendations.push({
      priority: 'medium',
      category: 'Growth',
      action: 'Implementar programa de fidelização',
      reason: `Ticket médio: R$ ${trends.average_sale}. Potencial de aumento: +15-20%`,
    })

    return {
      recommendations,
      total_recommendations: recommendations.length,
      next_review: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  }

  private generateSalesTrendInsights(
    trendIndicator: number,
    totalRevenue: number,
    transactionCount: number,
  ): string {
    let insight = ''

    if (trendIndicator > 0.3) {
      insight = '📈 Vendas em tendência de alta. Mantenha o momentum!'
    } else if (trendIndicator < 0.1) {
      insight = '📉 Vendas em queda. Recomenda-se ações imediatas.'
    } else {
      insight = '➡️ Vendas estáveis. Continue monitorando.'
    }

    insight += ` Total: R$ ${totalRevenue.toFixed(2)} em ${transactionCount} transações.`

    return insight
  }
}
