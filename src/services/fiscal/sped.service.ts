import { supabase } from '@/lib/supabase'

export interface SPEDFile {
  id: string
  company_id: string
  period: string // YYYYMM
  file_type: 'fiscal' | 'contributions'
  content: string
  status: 'draft' | 'generated' | 'transmitted'
  transmitted_date: string | null
  receipt_number: string | null
  created_at: string
  updated_at: string
}

export class SPEDService {
  static async generateECF(companyId: string, period: string) {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .gte('issue_date', `${period.substring(0, 4)}-${period.substring(4, 6)}-01`)
      .lte('issue_date', `${period.substring(0, 4)}-${period.substring(4, 6)}-31`)

    const content = this.generateECFContent(company, invoices || [], period)

    const { data, error } = await supabase
      .from('sped_files')
      .insert([{
        company_id: companyId,
        period,
        file_type: 'fiscal',
        content,
        status: 'generated',
      }])
      .select()
      .single()

    if (error) throw error
    return data as SPEDFile
  }

  static async generateECD(companyId: string, period: string) {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .gte('issue_date', `${period.substring(0, 4)}-${period.substring(4, 6)}-01`)
      .lte('issue_date', `${period.substring(0, 4)}-${period.substring(4, 6)}-31`)

    const content = this.generateECDContent(company, invoices || [], period)

    const { data, error } = await supabase
      .from('sped_files')
      .insert([{
        company_id: companyId,
        period,
        file_type: 'fiscal',
        content,
        status: 'generated',
      }])
      .select()
      .single()

    if (error) throw error
    return data as SPEDFile
  }

  static async generateREINF(companyId: string, period: string) {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    const content = this.generateREINFContent(company, period)

    const { data, error } = await supabase
      .from('sped_files')
      .insert([{
        company_id: companyId,
        period,
        file_type: 'contributions',
        content,
        status: 'generated',
      }])
      .select()
      .single()

    if (error) throw error
    return data as SPEDFile
  }

  private static generateECFContent(company: any, invoices: any[], period: string): string {
    const lines: string[] = []

    // Header
    lines.push('|0000|ABERTURA|1|9999|2.5|ECF|')
    lines.push(`|0010|EMPRESA|${company.cnpj}|${period}|1|1|`)

    // Invoice details
    let sequence = 1
    invoices.forEach(invoice => {
      lines.push(
        `|0200|OPERACAO FISCAL|${invoice.id}|${invoice.issue_date}|${invoice.number}|${invoice.total_amount}|0|${invoice.status}|${sequence}|`,
      )
      sequence++
    })

    // Trailer
    lines.push(`|9001|TOTAL DE OPERACOES|${invoices.length}|`)
    lines.push('|9999|FIM|')

    return lines.join('\n')
  }

  private static generateECDContent(company: any, invoices: any[], period: string): string {
    const lines: string[] = []

    // Header
    lines.push('|0000|ABERTURA|2|9999|2.5|ECD|')
    lines.push(`|0010|EMPRESA|${company.cnpj}|${period}|1|1|1|`)

    // Chart of accounts (simplified)
    lines.push('|0100|PLANO DE CONTAS|')
    lines.push('|0110|ATIVO|1|')
    lines.push('|0120|CIRCULANTE|1|01|')
    lines.push('|0130|CAIXA E EQUIVALENTES|1|01|01|')
    lines.push('|0140|PASSIVO|2|')
    lines.push('|0150|PATRIMONIO LIQUIDO|3|')

    // Financial data
    const totalAssets = invoices.reduce((sum, i) => sum + i.total_amount, 0)

    lines.push(`|0200|SALDOS|1|CAIXA|${totalAssets}|${period}|`)
    lines.push(`|0200|SALDOS|2|PASSIVOS|0|${period}|`)
    lines.push(`|0200|SALDOS|3|PATRIMONIO|${totalAssets}|${period}|`)

    // Trailer
    lines.push('|9001|TOTAL DE REGISTROS|')
    lines.push('|9999|FIM|')

    return lines.join('\n')
  }

  private static generateREINFContent(company: any, period: string): string {
    const lines: string[] = []

    // Header
    lines.push('|0000|ABERTURA|4|9999|2.5|REINF|')
    lines.push(`|0010|EMPRESA|${company.cnpj}|${period}|1|`)

    // Income from services
    lines.push(`|0200|SERVICOS PRESTADOS|${period}|0|`)

    // Withholdings
    lines.push(`|0300|RETENCOES|${period}|0|`)

    // Collaborators
    lines.push(`|0400|COLABORADORES|${period}|0|`)

    // Trailer
    lines.push('|9999|FIM|')

    return lines.join('\n')
  }
}
