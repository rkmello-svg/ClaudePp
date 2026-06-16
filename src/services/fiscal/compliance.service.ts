import { supabase } from '@/lib/supabase'

export interface FiscalObligation {
  id: string
  company_id: string
  obligation_type: string
  description: string
  due_date: string
  status: 'pending' | 'completed' | 'overdue'
  responsible_department: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TaxPlanning {
  id: string
  company_id: string
  scenario: string
  tax_regime: string
  estimated_tax: number
  estimated_contribution: number
  recommendation: string
  created_at: string
}

export class ComplianceService {
  static async generateMonthlyObligations(companyId: string) {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) throw new Error('Company not found')

    const obligations: Omit<FiscalObligation, 'id' | 'created_at' | 'updated_at'>[] = []
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1

    // Common monthly obligations
    const obligationTypes = {
      mei: [
        { type: 'DAS', description: 'Simples Nacional - DAS', daysAfter: 20 },
      ],
      simples_nacional: [
        { type: 'DAS', description: 'Simples Nacional - DAS', daysAfter: 20 },
        { type: 'ECF', description: 'Escrituração Contábil Fiscal', daysAfter: 25 },
      ],
      lucro_presumido: [
        { type: 'DARF', description: 'Imposto de Renda - DARF', daysAfter: 20 },
        { type: 'DARF-PIS-COFINS', description: 'PIS/PASEP e COFINS', daysAfter: 25 },
        { type: 'ECF', description: 'Escrituração Contábil Fiscal', daysAfter: 25 },
        { type: 'SPED', description: 'SPED Fiscal', daysAfter: 30 },
      ],
      lucro_real: [
        { type: 'DARF', description: 'Imposto de Renda - DARF', daysAfter: 20 },
        { type: 'DARF-PIS-COFINS', description: 'PIS/PASEP e COFINS', daysAfter: 25 },
        { type: 'ECF', description: 'Escrituração Contábil Fiscal', daysAfter: 25 },
        { type: 'ECD', description: 'Escrituração Contábil Digital', daysAfter: 30 },
        { type: 'SPED', description: 'SPED Fiscal', daysAfter: 30 },
        { type: 'REINF', description: 'REINF - Informações Financeiras', daysAfter: 30 },
      ],
    }

    const regime = company.tax_regime || 'mei'
    const regimeObligations = obligationTypes[regime as keyof typeof obligationTypes] || obligationTypes.mei

    regimeObligations.forEach(obl => {
      const dueDate = new Date(year, month - 1 + 1, obl.daysAfter)

      obligations.push({
        company_id: companyId,
        obligation_type: obl.type,
        description: obl.description,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
        responsible_department: 'fiscal',
        notes: null,
      })
    })

    // eSocial obligations (monthly)
    obligations.push({
      company_id: companyId,
      obligation_type: 'ESOCIAL',
      description: 'eSocial - Informações Trabalhistas',
      due_date: new Date(year, month, 7).toISOString().split('T')[0],
      status: 'pending',
      responsible_department: 'hr',
      notes: null,
    })

    // Insert obligations
    const { error } = await supabase
      .from('fiscal_obligations')
      .insert(obligations)

    if (error) throw error

    return obligations
  }

  static async generateTaxPlanning(companyId: string) {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) throw new Error('Company not found')

    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('company_id', companyId)
      .eq('status', 'paid')

    const totalRevenue = invoices?.reduce((sum, i) => sum + i.total_amount, 0) || 0
    const monthlyRevenue = totalRevenue / 12

    const scenarios: Omit<TaxPlanning, 'id' | 'created_at'>[] = []

    // MEI scenario
    scenarios.push({
      company_id: companyId,
      scenario: 'MEI',
      tax_regime: 'mei',
      estimated_tax: 65, // Fixed monthly fee
      estimated_contribution: monthlyRevenue * 0.05,
      recommendation: monthlyRevenue < 6500 ? 'Recomendado' : 'Limite de faturamento excedido',
    })

    // Simples Nacional scenario
    const simplesRate = this.calculateSimplesRate(monthlyRevenue)
    scenarios.push({
      company_id: companyId,
      scenario: 'Simples Nacional',
      tax_regime: 'simples_nacional',
      estimated_tax: monthlyRevenue * simplesRate,
      estimated_contribution: 0, // Included in DAS
      recommendation: monthlyRevenue < 360000 / 12 ? 'Potencialmente melhor' : 'Verifique limites',
    })

    // Lucro Presumido scenario
    const presumedProfit = monthlyRevenue * 0.32 // 32% for commerce
    const irpf = presumedProfit * 0.15
    const pis = monthlyRevenue * 0.0765
    const cofins = monthlyRevenue * 0.076

    scenarios.push({
      company_id: companyId,
      scenario: 'Lucro Presumido',
      tax_regime: 'lucro_presumido',
      estimated_tax: irpf,
      estimated_contribution: pis + cofins,
      recommendation: monthlyRevenue > 360000 / 12 ? 'Avaliar viabilidade' : 'Possível alternativa',
    })

    // Lucro Real scenario
    const realProfit = monthlyRevenue * 0.25 // Assumed 25% margin
    const irReal = realProfit * 0.15
    const pisReal = monthlyRevenue * 0.0765
    const cofinsReal = monthlyRevenue * 0.076

    scenarios.push({
      company_id: companyId,
      scenario: 'Lucro Real',
      tax_regime: 'lucro_real',
      estimated_tax: irReal,
      estimated_contribution: pisReal + cofinsReal,
      recommendation: 'Para empresas com lucro variável ou margens altas',
    })

    const { error } = await supabase
      .from('tax_planning')
      .insert(scenarios)

    if (error) throw error

    return scenarios
  }

  private static calculateSimplesRate(monthlyRevenue: number): number {
    // Simplified calculation for commerce/services
    if (monthlyRevenue <= 15000) return 0.06
    if (monthlyRevenue <= 30000) return 0.07
    if (monthlyRevenue <= 60000) return 0.08
    if (monthlyRevenue <= 90000) return 0.09
    if (monthlyRevenue <= 120000) return 0.10
    if (monthlyRevenue <= 150000) return 0.105
    if (monthlyRevenue <= 180000) return 0.11
    if (monthlyRevenue <= 210000) return 0.115
    if (monthlyRevenue <= 240000) return 0.12
    if (monthlyRevenue <= 270000) return 0.125
    if (monthlyRevenue <= 300000) return 0.13
    return 0.135
  }

  static async getComplianceStatus(companyId: string) {
    const { data: obligations } = await supabase
      .from('fiscal_obligations')
      .select('*')
      .eq('company_id', companyId)
      .order('due_date')

    const today = new Date().toISOString().split('T')[0]

    const status = {
      pending: obligations?.filter(o => o.status === 'pending').length || 0,
      completed: obligations?.filter(o => o.status === 'completed').length || 0,
      overdue: obligations?.filter(o => o.status === 'overdue' && o.due_date < today).length || 0,
      upcomingDue: obligations?.filter(
        o => o.status === 'pending' && o.due_date < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ).length || 0,
    }

    return {
      status,
      obligations: obligations || [],
      healthScore: this.calculateHealthScore(status),
    }
  }

  private static calculateHealthScore(status: any): number {
    // Score from 0-100
    const overduePenalty = status.overdue * 10
    const upcomingScore = Math.min(status.upcomingDue * 5, 20)
    const completionScore = status.completed > 0 ? 10 : 0

    return Math.max(0, 100 - overduePenalty - upcomingScore + completionScore)
  }
}
