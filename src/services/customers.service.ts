import { supabase } from '@/lib/supabase'
import { Customer } from '@/types'
import { PostgrestError } from '@supabase/supabase-js'

export class CustomersService {
  static async list(companyId: string, branchId?: string) {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)

    if (branchId) query = query.eq('branch_id', branchId)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data as Customer[]
  }

  static async get(customerId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (error) throw error
    return data as Customer
  }

  static async create(companyId: string, customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customer, company_id: companyId }])
      .select()
      .single()

    if (error) throw error
    return data as Customer
  }

  static async update(customerId: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single()

    if (error) throw error
    return data as Customer
  }

  static async delete(customerId: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)

    if (error) throw error
  }

  static async search(companyId: string, query: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,cpf_cnpj.ilike.%${query}%`)
      .order('name')

    if (error) throw error
    return data as Customer[]
  }
}
