import { supabase } from '@/lib/supabase'

export interface DashboardMetrics {
  totalRevenue: number
  totalCustomers: number
  totalInvoices: number
  overdueInvoices: number
  lowStockProducts: number
  activeProducts: number
  monthlyRevenue: Array<{ month: string; amount: number }>
  topProducts: Array<{ name: string; sold: number; revenue: number }>
  recentInvoices: Array<{ id: string; number: string; total: number; status: string }>
}

export class DashboardService {
  static async getMetrics(companyId: string): Promise<DashboardMetrics> {
    const today = new Date()
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Total revenue (all time)
    const { data: allInvoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('company_id', companyId)
      .eq('status', 'paid')

    const totalRevenue = allInvoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0

    // Total customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)

    // Total invoices
    const { count: totalInvoices } = await supabase
      .from('invoices')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)

    // Overdue invoices
    const { count: overdueInvoices } = await supabase
      .from('invoices')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('status', 'issued')
      .lt('due_date', today.toISOString().split('T')[0])

    // Low stock products
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .lt('stock_quantity', 10)
      .eq('active', true)

    // Active products
    const { count: activeProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('active', true)

    // Monthly revenue
    const { data: monthlyInvoices } = await supabase
      .from('invoices')
      .select('issue_date, total_amount')
      .eq('company_id', companyId)
      .eq('status', 'paid')
      .gte('issue_date', ninetyDaysAgo.toISOString())

    const monthlyRevenue = this.aggregateMonthlyRevenue(monthlyInvoices || [])

    // Top products
    const topProducts = await this.getTopProducts(companyId)

    // Recent invoices
    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select('id, number, total_amount, status')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      totalRevenue,
      totalCustomers: totalCustomers || 0,
      totalInvoices: totalInvoices || 0,
      overdueInvoices: overdueInvoices || 0,
      lowStockProducts: lowStockProducts || 0,
      activeProducts: activeProducts || 0,
      monthlyRevenue,
      topProducts,
      recentInvoices: (recentInvoices || []).map(inv => ({
        id: inv.id,
        number: inv.number,
        total: inv.total_amount,
        status: inv.status,
      })),
    }
  }

  private static aggregateMonthlyRevenue(invoices: any[]) {
    const monthlyMap = new Map<string, number>()

    invoices.forEach(inv => {
      const date = new Date(inv.issue_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + inv.total_amount)
    })

    return Array.from(monthlyMap, ([month, amount]) => ({
      month,
      amount: parseFloat(amount.toFixed(2)),
    })).sort((a, b) => a.month.localeCompare(b.month))
  }

  private static async getTopProducts(companyId: string) {
    const { data: items } = await supabase
      .from('invoice_items')
      .select('product_id, quantity, total, invoices!inner(company_id)')
      .eq('invoices.company_id', companyId)
      .order('total', { ascending: false })
      .limit(5)

    if (!items) return []

    const topProducts = []
    for (const item of items) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('name')
          .eq('id', item.product_id)
          .single()

        if (product) {
          topProducts.push({
            name: product.name,
            sold: item.quantity,
            revenue: item.total,
          })
        }
      }
    }

    return topProducts
  }

  static async getFinancialSummary(companyId: string) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('status, total_amount')
      .eq('company_id', companyId)

    const summary = {
      issued: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    }

    invoices?.forEach(inv => {
      if (inv.status === 'paid') summary.paid += inv.total_amount
      else if (inv.status === 'issued') summary.issued += inv.total_amount
      else if (inv.status === 'overdue') summary.overdue += inv.total_amount
      else if (inv.status === 'cancelled') summary.cancelled += inv.total_amount
    })

    return summary
  }
}
