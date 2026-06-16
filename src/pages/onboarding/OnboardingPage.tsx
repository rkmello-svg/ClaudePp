import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { BusinessSegment, TaxRegime } from '@/types'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    segment: BusinessSegment.OUTROS,
    employees_count: 1,
    annual_revenue: 0,
    cnpj: '',
    tax_regime: TaxRegime.MEI,
  })

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: formData.company_name,
          segment: formData.segment,
          employees_count: formData.employees_count,
          annual_revenue: formData.annual_revenue,
          cnpj: formData.cnpj,
          tax_regime: formData.tax_regime,
          owner_id: user.id,
        }])
        .select()
        .single()

      if (companyError) throw companyError

      await supabase
        .from('profiles')
        .update({ current_company_id: company.id })
        .eq('id', user.id)

      navigate('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao ERP Enterprise OS</h1>
          <p className="text-gray-600 mb-8">Vamos configurar seu Business Operating System em poucos passos</p>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Passo {step} de 3</span>
              <span className="text-sm text-gray-600">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Dados da Empresa</h2>
              <input
                type="text"
                placeholder="Nome da empresa"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="CNPJ"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Perfil do Negócio</h2>
              <select
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value as BusinessSegment })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.values(BusinessSegment).map((seg) => (
                  <option key={seg} value={seg}>{seg}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Número de funcionários"
                value={formData.employees_count}
                onChange={(e) => setFormData({ ...formData, employees_count: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Configuração Fiscal</h2>
              <select
                value={formData.tax_regime}
                onChange={(e) => setFormData({ ...formData, tax_regime: e.target.value as TaxRegime })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.values(TaxRegime).map((regime) => (
                  <option key={regime} value={regime}>{regime}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Faturamento anual"
                value={formData.annual_revenue}
                onChange={(e) => setFormData({ ...formData, annual_revenue: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50"
            >
              Voltar
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Finalizando...' : 'Finalizar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
