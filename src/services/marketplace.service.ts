import { supabase } from '@/lib/supabase'

export interface MarketplaceModule {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  version: string
  author: string | null
  icon: string | null
  features: string[]
  pricing_type: 'free' | 'freemium' | 'paid'
  pricing_brl: number
  rating: number
  install_count: number
  is_official: boolean
  is_verified: boolean
  status: string
}

export interface ModuleInstallation {
  id: string
  company_id: string
  module_id: string
  module_version: string | null
  enabled: boolean
  config: Record<string, unknown>
  installed_at: string
}

export class MarketplaceService {
  static async listModules(category?: string) {
    let query = supabase
      .from('marketplace_modules')
      .select('*')
      .eq('status', 'active')

    if (category) query = query.eq('category', category)

    const { data, error } = await query.order('install_count', { ascending: false })
    if (error) throw error
    return data as MarketplaceModule[]
  }

  static async getInstalledModules(companyId: string) {
    const { data, error } = await supabase
      .from('module_installations')
      .select('*, module:marketplace_modules(*)')
      .eq('company_id', companyId)

    if (error) throw error
    return data
  }

  static async isInstalled(companyId: string, moduleId: string) {
    const { data } = await supabase
      .from('module_installations')
      .select('id')
      .eq('company_id', companyId)
      .eq('module_id', moduleId)
      .maybeSingle()

    return !!data
  }

  static async install(companyId: string, moduleId: string, userId: string) {
    const { data: module, error: moduleError } = await supabase
      .from('marketplace_modules')
      .select('version, is_verified')
      .eq('id', moduleId)
      .single()

    if (moduleError) throw moduleError
    if (!module.is_verified) {
      throw new Error('Apenas módulos verificados podem ser instalados')
    }

    const { data, error } = await supabase
      .from('module_installations')
      .insert([{
        company_id: companyId,
        module_id: moduleId,
        module_version: module.version,
        enabled: true,
        installed_by: userId,
      }])
      .select()
      .single()

    if (error) throw error
    return data as ModuleInstallation
  }

  static async uninstall(companyId: string, moduleId: string) {
    const { error } = await supabase
      .from('module_installations')
      .delete()
      .eq('company_id', companyId)
      .eq('module_id', moduleId)

    if (error) throw error
  }

  static async setEnabled(installationId: string, enabled: boolean) {
    const { data, error } = await supabase
      .from('module_installations')
      .update({ enabled })
      .eq('id', installationId)
      .select()
      .single()

    if (error) throw error
    return data as ModuleInstallation
  }
}
