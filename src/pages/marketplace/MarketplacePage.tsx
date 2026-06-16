import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/Card'
import { MarketplaceService, MarketplaceModule } from '@/services/marketplace.service'
import { formatCurrency } from '@/utils/format'
import { Check, Download, Star, ShieldCheck } from 'lucide-react'

const CATEGORIES = [
  { label: 'Todos', value: 'all' },
  { label: 'Vendas', value: 'sales' },
  { label: 'Operações', value: 'operations' },
  { label: 'RH', value: 'hr' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Analytics', value: 'analytics' },
]

export default function MarketplacePage() {
  const { company, user } = useAuthStore()
  const [modules, setModules] = useState<MarketplaceModule[]>([])
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set())
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [company?.id, category])

  const load = async () => {
    if (!company?.id) return
    try {
      setLoading(true)
      const [catalog, installed] = await Promise.all([
        MarketplaceService.listModules(category === 'all' ? undefined : category),
        MarketplaceService.getInstalledModules(company.id),
      ])
      setModules(catalog)
      setInstalledIds(new Set((installed || []).map((i: any) => i.module_id)))
    } catch (error) {
      console.error('Error loading marketplace:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInstall = async (module: MarketplaceModule) => {
    if (!company?.id || !user?.id) return
    try {
      setBusyId(module.id)
      await MarketplaceService.install(company.id, module.id, user.id)
      setInstalledIds(new Set([...installedIds, module.id]))
    } catch (error) {
      console.error('Install error:', error)
      alert(error instanceof Error ? error.message : 'Erro ao instalar módulo')
    } finally {
      setBusyId(null)
    }
  }

  const handleUninstall = async (module: MarketplaceModule) => {
    if (!company?.id) return
    if (!window.confirm(`Desinstalar "${module.name}"?`)) return
    try {
      setBusyId(module.id)
      await MarketplaceService.uninstall(company.id, module.id)
      const next = new Set(installedIds)
      next.delete(module.id)
      setInstalledIds(next)
    } catch (error) {
      console.error('Uninstall error:', error)
    } finally {
      setBusyId(null)
    }
  }

  const pricingLabel = (m: MarketplaceModule) => {
    if (m.pricing_type === 'free') return 'Grátis'
    if (m.pricing_type === 'freemium') return 'Freemium'
    return formatCurrency(m.pricing_brl) + '/mês'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600 mt-1">Instale módulos e expanda seu Business OS em 1 clique</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium transition ${
              category === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando módulos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(module => {
            const installed = installedIds.has(module.id)
            const busy = busyId === module.id

            return (
              <Card key={module.id} className="p-6 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{module.icon}</div>
                  {module.is_verified && (
                    <span title="Verificado" className="text-blue-600">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 text-lg">{module.name}</h3>
                <p className="text-sm text-gray-600 mt-1 flex-1">{module.description}</p>

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {module.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" /> {module.install_count}
                  </span>
                  <span className="font-medium text-gray-700">{pricingLabel(module)}</span>
                </div>

                <div className="mt-4">
                  {installed ? (
                    <button
                      onClick={() => handleUninstall(module)}
                      disabled={busy}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {busy ? 'Processando...' : 'Instalado'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(module)}
                      disabled={busy}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {busy ? 'Instalando...' : 'Instalar'}
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
