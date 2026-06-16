import { supabase } from '@/lib/supabase'

export interface Product {
  id: string
  company_id: string
  name: string
  description: string | null
  sku: string | null
  price: number
  cost: number
  stock_quantity: number
  category: string | null
  image_url: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export class ProductsService {
  static async list(companyId: string, category?: string) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .eq('active', true)

    if (category) query = query.eq('category', category)

    const { data, error } = await query.order('name')
    if (error) throw error
    return data as Product[]
  }

  static async get(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) throw error
    return data as Product
  }

  static async create(companyId: string, product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, company_id: companyId }])
      .select()
      .single()

    if (error) throw error
    return data as Product
  }

  static async update(productId: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error
    return data as Product
  }

  static async delete(productId: string) {
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', productId)

    if (error) throw error
  }

  static async getByCategory(companyId: string, category: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .eq('category', category)
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data as Product[]
  }

  static async getLowStock(companyId: string, threshold: number = 10) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .lt('stock_quantity', threshold)
      .order('stock_quantity')

    if (error) throw error
    return data as Product[]
  }

  static async updateStock(productId: string, quantity: number) {
    const { data: product } = await this.get(productId)
    const newQuantity = (product?.stock_quantity || 0) + quantity

    return this.update(productId, { stock_quantity: Math.max(0, newQuantity) })
  }
}
