import { supabase } from '@/lib/supabase'
import { BaseAgent, AgentTool } from './base-agent'

export class InventoryAgent extends BaseAgent {
  constructor(company_id: string) {
    super(company_id, 'inventory-agent')
  }

  getSystemPrompt(): string {
    return `Você é um agente especializado em gestão de estoque. Suas responsabilidades:
1. Analisar níveis de estoque e detectar problemas
2. Fazer recomendações de compra otimizadas
3. Identificar produtos parados ou obsoletos
4. Calcular quantidades ideais de reposição
5. Alertar sobre riscos de ruptura

Use fórmulas como: EOQ, Ponto de Reposição, Estoque de Segurança.`
  }

  getTools(): AgentTool[] {
    return [
      {
        name: 'get_inventory_health',
        description: 'Avalia saúde do estoque',
        parameters: {},
      },
      {
        name: 'calculate_purchase_quantities',
        description: 'Calcula quantidades ideais de compra',
        parameters: { product_id: 'string' },
      },
      {
        name: 'identify_slow_moving',
        description: 'Identifica produtos de lenta rotação',
        parameters: { days: 'number' },
      },
    ]
  }

  async execute(input: Record<string, any>) {
    const startTime = Date.now()

    try {
      const { action, ...params } = input

      let result

      switch (action) {
        case 'get_health':
          result = await this.getInventoryHealth(params)
          break
        case 'calculate_reorder':
          result = await this.calculateReorderQuantities(params)
          break
        case 'identify_issues':
          result = await this.identifyInventoryIssues(params)
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

  private async getInventoryHealth(_params: Record<string, any>) {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', this.company_id)
      .eq('active', true)

    if (!products || products.length === 0) {
      return {
        total_items: 0,
        total_value: 0,
        health_score: 0,
        status: 'no_inventory',
      }
    }

    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0)
    const lowStock = products.filter(p => p.stock_quantity < 10).length
    const zeroStock = products.filter(p => p.stock_quantity === 0).length

    // Health score: 100 - (low stock % * 20 + zero stock % * 50)
    const lowStockPct = (lowStock / products.length) * 100
    const zeroStockPct = (zeroStock / products.length) * 100
    const healthScore = Math.max(0, 100 - (lowStockPct * 0.2 + zeroStockPct * 0.5))

    return {
      total_items: products.length,
      total_value: parseFloat(totalValue.toFixed(2)),
      low_stock_items: lowStock,
      zero_stock_items: zeroStock,
      health_score: parseFloat(healthScore.toFixed(1)),
      status: healthScore > 80 ? 'healthy' : healthScore > 50 ? 'warning' : 'critical',
    }
  }

  private async calculateReorderQuantities(_params: Record<string, any>) {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', this.company_id)
      .eq('active', true)

    if (!products) return { ai_recommendations: 'Nenhum produto encontrado' }

    const recommendations = []

    for (const product of products) {
      if (product.stock_quantity < 10) {
        const monthlyDemand = await this.estimateMonthlyDemand(product.id)
        const annualDemand = monthlyDemand * 12

        const orderingCost = 50
        const holdingCost = (product.cost || product.price * 0.4) * 0.25

        const eoq = Math.sqrt((2 * annualDemand * orderingCost) / (holdingCost || 1))
        const safetyStock = Math.ceil(monthlyDemand * 1.5)
        const reorderPoint = safetyStock + monthlyDemand

        recommendations.push({
          product_id: product.id,
          product_name: product.name,
          current_stock: product.stock_quantity,
          reorder_point: Math.ceil(reorderPoint),
          eoq: Math.ceil(eoq),
          safety_stock: safetyStock,
          estimated_monthly_demand: monthlyDemand,
          urgency: product.stock_quantity === 0 ? 'critical' : 'high',
        })
      }
    }

    const dataContext = `
Análise de Reposição de Estoque:
- Total de Produtos com Estoque Baixo: ${recommendations.length}
- Total de Produtos Ativos: ${products.length}

Produtos com Recomendação de Compra:
${recommendations.slice(0, 10).map(r => `- ${r.product_name}: Estoque Atual ${r.current_stock}, EOQ recomendado: ${r.eoq} unidades, Demanda: ${r.estimated_monthly_demand}/mês`).join('\n')}

Investimento Estimado Total: R$ ${recommendations.reduce((sum, r) => sum + r.eoq * 50, 0).toFixed(2)}

Forneça uma estratégia otimizada de compra considerando cash flow e prioridades.`

    const messages = [
      {
        role: 'user' as const,
        content: dataContext,
      },
    ]

    const llmRecommendations = await this.callLLM(messages, this.getTools())

    return {
      total_recommendations: recommendations.length,
      quantitative_data: recommendations,
      ai_recommendations: llmRecommendations,
    }
  }

  private async identifyInventoryIssues(_params: Record<string, any>) {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', this.company_id)

    if (!products) return { issues: [] }

    const issues = []

    // Identify zero stock
    const zeroStock = products.filter(p => p.stock_quantity === 0 && p.active)
    if (zeroStock.length > 0) {
      issues.push({
        type: 'zero_stock',
        severity: 'critical',
        count: zeroStock.length,
        products: zeroStock.slice(0, 5).map(p => p.name),
        action: 'Comprar imediatamente',
      })
    }

    // Identify slow movers
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    const slowMovers = []

    for (const product of products) {
      const { count } = await supabase
        .from('invoice_items')
        .select('*', { count: 'exact' })
        .eq('product_id', product.id)
        .gte('created_at', sixMonthsAgo.toISOString())

      if ((count || 0) === 0 && product.stock_quantity > 0) {
        slowMovers.push(product)
      }
    }

    if (slowMovers.length > 0) {
      issues.push({
        type: 'slow_moving',
        severity: 'medium',
        count: slowMovers.length,
        products: slowMovers.slice(0, 5).map(p => p.name),
        action: 'Considerar liquidação ou descontinuação',
      })
    }

    return {
      total_issues: issues.length,
      issues,
    }
  }

  private async estimateMonthlyDemand(productId: string): Promise<number> {
    const { data } = await supabase
      .from('invoice_items')
      .select('quantity')
      .eq('product_id', productId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (!data || data.length === 0) return 10 // Default estimate

    return Math.ceil(data.reduce((sum, item) => sum + item.quantity, 0) / 1)
  }

}
