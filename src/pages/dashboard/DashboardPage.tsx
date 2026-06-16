import { useAuthStore } from '@/stores/authStore'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, company } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company?.name || 'Empresa'}</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* KPI Cards */}
          {[
            { label: 'Receita Mensal', value: 'R$ 45.200', change: '+12%' },
            { label: 'Clientes Ativos', value: '234', change: '+8%' },
            { label: 'Pedidos Pendentes', value: '12', change: '-2%' },
            { label: 'Produtos em Estoque', value: '1.240', change: '+5%' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className={`text-xs mt-2 ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change} vs mês anterior
              </p>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Central de Operações</h2>
          <p className="text-blue-700 mb-4">
            Seu Business Operating System está sendo construído com recursos avançados de IA e automação.
          </p>
          <div className="space-y-2 text-left inline-block">
            <p className="text-sm text-blue-700">✓ CRM integrado</p>
            <p className="text-sm text-blue-700">✓ Gestão Fiscal completa</p>
            <p className="text-sm text-blue-700">✓ IA e Automações</p>
            <p className="text-sm text-blue-700">✓ Business Intelligence</p>
          </div>
        </div>
      </main>
    </div>
  )
}
