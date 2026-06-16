import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card, StatCard } from '@/components/Card'
import { DashboardService, DashboardMetrics } from '@/services/dashboard.service'
import { getVertical } from '@/config/verticals'
import { formatCurrency } from '@/utils/format'
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const { company } = useAuthStore()
  const navigate = useNavigate()
  const vertical = getVertical(company?.segment)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (company?.id) {
      DashboardService.getMetrics(company.id)
        .then(setMetrics)
        .catch(err => console.error('Error loading metrics:', err))
        .finally(() => setLoading(false))
    }
  }, [company?.id])

  // Alerts surface what needs attention — the heart of the Central de Operações.
  const alerts: { tone: 'red' | 'yellow'; message: string; action: string; route: string }[] = []
  if (metrics) {
    if (metrics.overdueInvoices > 0) {
      alerts.push({
        tone: 'red',
        message: `${metrics.overdueInvoices} fatura(s) vencida(s) aguardando cobrança`,
        action: 'Ver faturas',
        route: '/invoices',
      })
    }
    if (metrics.lowStockProducts > 0) {
      alerts.push({
        tone: 'yellow',
        message: `${metrics.lowStockProducts} produto(s) com estoque baixo`,
        action: 'Repor estoque',
        route: '/products',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{vertical.icon}</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Operações</h1>
          <p className="text-gray-600">
            {company?.name} · {vertical.name}
          </p>
        </div>
      </div>

      {/* What do you want to do? */}
      <Card className="p-6" >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">O que você deseja fazer?</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {vertical.quickActions.map(qa => (
            <button
              key={qa.route}
              onClick={() => navigate(qa.route)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {qa.label}
              <ArrowRight className="w-4 h-4" />
            </button>
          ))}
        </div>
      </Card>

      {/* Alerts / pendencies */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Card
              key={i}
              className={`p-4 border-l-4 ${
                alert.tone === 'red' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className={`w-5 h-5 ${alert.tone === 'red' ? 'text-red-600' : 'text-yellow-600'}`}
                  />
                  <span className="text-gray-900">{alert.message}</span>
                </div>
                <button
                  onClick={() => navigate(alert.route)}
                  className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
                >
                  {alert.action} →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* KPIs — labels adapt to the business segment */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Receita (paga)"
              value={formatCurrency(metrics?.totalRevenue || 0)}
            />
            <StatCard title="Clientes" value={metrics?.totalCustomers || 0} />
            <StatCard title="Faturas emitidas" value={metrics?.totalInvoices || 0} />
            <StatCard title="Produtos ativos" value={metrics?.activeProducts || 0} />
          </>
        )}
      </div>

      {/* Recent activity */}
      {!loading && metrics && metrics.recentInvoices.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Faturas recentes</h2>
          <div className="divide-y divide-gray-100">
            {metrics.recentInvoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-2">
                <span className="text-gray-700">#{inv.number}</span>
                <span className="font-medium text-gray-900">{formatCurrency(inv.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
