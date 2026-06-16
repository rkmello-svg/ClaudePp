import { supabase } from '@/lib/supabase'
import { Invoice, InvoiceStatus } from '@/types'

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  discount: number
  tax: number
  total: number
  created_at: string
}

export interface InvoiceDetail extends Invoice {
  items?: InvoiceItem[]
  customer?: any
}

export class InvoicesService {
  static async list(companyId: string, status?: InvoiceStatus) {
    let query = supabase
      .from('invoices')
      .select('*, customer:customers(name, email)')
      .eq('company_id', companyId)

    if (status) query = query.eq('status', status)

    const { data, error } = await query.order('issue_date', { ascending: false })
    if (error) throw error
    return data as InvoiceDetail[]
  }

  static async get(invoiceId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(*)
      `)
      .eq('id', invoiceId)
      .single()

    if (error) throw error
    return data as InvoiceDetail
  }

  static async create(companyId: string, invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoice, company_id: companyId }])
      .select()
      .single()

    if (error) throw error
    return data as Invoice
  }

  static async addItem(invoiceId: string, item: Omit<InvoiceItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('invoice_items')
      .insert([{ ...item, invoice_id: invoiceId }])
      .select()
      .single()

    if (error) throw error
    return data as InvoiceItem
  }

  static async removeItem(itemId: string) {
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  }

  static async updateStatus(invoiceId: string, status: InvoiceStatus) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error
    return data as Invoice
  }

  static async updateTotal(invoiceId: string) {
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)

    if (itemsError) throw itemsError

    const total = items?.reduce((sum, item) => sum + item.total, 0) || 0
    const tax = items?.reduce((sum, item) => sum + item.tax, 0) || 0
    const subtotal = total - tax

    return this.update(invoiceId, {
      subtotal,
      tax,
      total_amount: total,
    })
  }

  static async update(invoiceId: string, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error
    return data as Invoice
  }

  static async delete(invoiceId: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)

    if (error) throw error
  }

  static async getByStatus(companyId: string, status: InvoiceStatus) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', status)
      .order('due_date')

    if (error) throw error
    return data as Invoice[]
  }

  static async getOverdue(companyId: string) {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'issued')
      .lt('due_date', today)
      .order('due_date')

    if (error) throw error
    return data as Invoice[]
  }
}
