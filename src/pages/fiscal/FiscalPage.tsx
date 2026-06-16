import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Card, StatCard } from '@/components/Card'
import { ComplianceService } from '@/services/fiscal/compliance.service'
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export default function FiscalPage() {
  const { company } = useAuthStore()
  const [complianceData, setComplianceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'obligations' | 'planning'>('overview')

  useEffect(() => {
    if (company?.id) loadComplianceData()
  }, [company?.id])

  const loadComplianceData = async () => {
    if (!company?.id) return

    try {
      setLoading(true)
      const data = await ComplianceService.getComplianceStatus(company.id)
      setComplianceData(data)
    } catch (error) {
      console.error('Error loading compliance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>
  }

  const health = complianceData?.healthScore || 0
  const healthColor = health > 80 ? 'green' : health > 50 ? 'yellow' : 'red'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Fiscal</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Regime: {company?.tax_regime || 'MEI'}</p>
          <p className="text-sm text-gray-600">Órgão: {company?.cnpj ? 'PJ' : 'PF'}</p>
        </div>
      </div>

      {/* Health Score */}
      <Card className={`p-6 border-l-4 border-${healthColor}-500 bg-${healthColor}-50`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Saúde Fiscal</h2>
            <p className="text-sm text-gray-600">Conformidade com obrigações fiscais</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold text-${healthColor}-600`}>{health}</div>
            <p className="text-xs text-gray-600">Score</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Pendentes"
          value={complianceData?.status?.pending || 0}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title="Vencidas"
          value={complianceData?.status?.overdue || 0}
          trend="down"
          icon={<AlertCircle className="w-6 h-6" />}
        />
        <StatCard
          title="Vencendo em 7 dias"
          value={complianceData?.status?.upcomingDue || 0}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          title="Concluídas"
          value={complianceData?.status?.completed || 0}
          icon={<CheckCircle className="w-6 h-6" />}
        />
      </div>

      {/* Alerts */}
      {complianceData?.status?.overdue > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900">Obrigações Vencidas</h3>
              <p className="text-sm text-red-800 mt-1">
                Você tem {complianceData.status.overdue} obrigação(ões) fiscal(is) vencida(s).
                Regularize imediatamente para evitar multas e penalidades.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Card className="border-b-0 rounded-b-none">
        <div className="flex gap-2 p-2 border-b border-gray-200">
          {[
            { label: 'Visão Geral', value: 'overview' },
            { label: 'Obrigações', value: 'obligations' },
            { label: 'Planejamento Tributário', value: 'planning' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-4 py-2 font-medium whitespace-nowrap rounded-t-lg transition ${
                activeTab === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card className="p-6 rounded-t-none">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Documentos Fiscais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'NF-e', desc: 'Nota Fiscal Eletrônica', icon: '📄' },
                { label: 'NFS-e', desc: 'Nota Fiscal de Serviços', icon: '📋' },
                { label: 'NFC-e', desc: 'NFe do Consumidor', icon: '🧾' },
              ].map(doc => (
                <button
                  key={doc.label}
                  className="p-4 border border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-left"
                >
                  <div className="text-2xl mb-2">{doc.icon}</div>
                  <h4 className="font-semibold text-gray-900">{doc.label}</h4>
                  <p className="text-sm text-gray-600">{doc.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'obligations' && (
        <Card className="p-6 rounded-t-none">
          <h3 className="font-semibold text-gray-900 mb-4">Obrigações Fiscais</h3>
          {complianceData?.obligations?.length > 0 ? (
            <div className="space-y-2">
              {complianceData.obligations.map((obl: any) => (
                <div
                  key={obl.id}
                  className={`p-4 rounded-lg border ${
                    obl.status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : obl.status === 'overdue'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{obl.description}</h4>
                      <p className="text-sm text-gray-600 mt-1">Vencimento: {obl.due_date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      obl.status === 'completed'
                        ? 'bg-green-200 text-green-800'
                        : obl.status === 'overdue'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {obl.status === 'completed' ? 'Concluída' : obl.status === 'overdue' ? 'Vencida' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma obrigação registrada</p>
          )}
        </Card>
      )}

      {activeTab === 'planning' && (
        <Card className="p-6 rounded-t-none">
          <h3 className="font-semibold text-gray-900 mb-4">Planejamento Tributário</h3>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              Análise de cenários tributários disponível em breve. Você poderá comparar diferentes regimes
              de tributação e receber recomendações personalizadas.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
