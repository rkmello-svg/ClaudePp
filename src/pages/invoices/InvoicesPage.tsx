import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Invoice, InvoiceStatus } from '@/types'
import { InvoicesService, InvoiceDetail } from '@/services/invoices.service'
import { Table, Column } from '@/components/Table'
import { Card, StatCard } from '@/components/Card'
import { Plus, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'

export default function InvoicesPage() {
  const { company } = useAuthStore()
  const [invoices, setInvoices] = useState<InvoiceDetail[]>([])
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all')
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  })

  useEffect(() => {
    loadInvoices()
  }, [company?.id, selectedStatus])

  const loadInvoices = async () => {
    if (!company?.id) return

    try {
      setLoading(true)

      const status = selectedStatus === 'all' ? undefined : selectedStatus

      const data = await InvoicesService.list(company.id, status)
      const overdue = await InvoicesService.getOverdue(company.id)

      setInvoices(data)
      setOverdueInvoices(overdue)

      const allInvoices = await InvoicesService.list(company.id)
      const paid = allInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0)
      const pending = allInvoices.filter(i => i.status === 'issued').length
      const overdueCount = overdue.length

      setStats({
        total: allInvoices.length,
        paid,
        pending,
        overdue: overdueCount,
      })
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<InvoiceDetail>[] = [
    {
      key: 'number',
      header: 'Número',
      sortable: true,
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (customer) => customer?.name || '-',
    },
    {
      key: 'issue_date',
      header: 'Data Emissão',
      render: (date) => formatDate(date),
      sortable: true,
    },
    {
      key: 'due_date',
      header: 'Data Vencimento',
      render: (date) => date ? formatDate(date) : '-',
      sortable: true,
    },
    {
      key: 'total_amount',
      header: 'Valor',
      render: (value) => formatCurrency(value),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (status: InvoiceStatus) => {
        const statusColors: Record<InvoiceStatus, string> = {
          draft: 'bg-gray-100 text-gray-800',
          issued: 'bg-blue-100 text-blue-800',
          paid: 'bg-green-100 text-green-800',
          overdue: 'bg-red-100 text-red-800',
          cancelled: 'bg-gray-100 text-gray-800',
        }
        const statusLabels: Record<InvoiceStatus, string> = {
          draft: 'Rascunho',
          issued: 'Emitida',
          paid: 'Paga',
          overdue: 'Vencida',
          cancelled: 'Cancelada',
        }
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        )
      },
    },
  ]

  const statusTabs: { label: string; value: InvoiceStatus | 'all' }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Emitidas', value: InvoiceStatus.ISSUED },
    { label: 'Pagas', value: InvoiceStatus.PAID },
    { label: 'Vencidas', value: InvoiceStatus.OVERDUE },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nova Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total de Invoices" value={stats.total} />
        <StatCard title="Valor Recebido" value={formatCurrency(stats.paid)} />
        <StatCard title="Pendentes" value={stats.pending} trend="down" />
        <StatCard title="Vencidas" value={stats.overdue} trend="down" />
      </div>

      {overdueInvoices.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Invoices Vencidas</h3>
              <p className="text-sm text-red-800 mt-1">
                {overdueInvoices.length} invoice(s) vencida(s) aguardando pagamento
              </p>
              <div className="mt-2 text-sm font-semibold text-red-900">
                Total: {formatCurrency(overdueInvoices.reduce((sum, i) => sum + i.total_amount, 0))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-2 border-b-0 rounded-b-none">
        <div className="flex gap-2 overflow-x-auto">
          {statusTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-4 py-2 whitespace-nowrap font-medium rounded-t-lg transition ${
                selectedStatus === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Table<InvoiceDetail>
        columns={columns}
        data={invoices}
        loading={loading}
        emptyMessage="Nenhuma invoice encontrada"
      />
    </div>
  )
}
