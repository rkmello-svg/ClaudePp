import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Customer } from '@/types'
import { CustomersService } from '@/services/customers.service'
import { Table, Column } from '@/components/Table'
import { Card } from '@/components/Card'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { CustomerForm } from '@/components/CustomerForm'

export default function CustomersPage() {
  const { company } = useAuthStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [company?.id])

  const loadCustomers = async () => {
    if (!company?.id) return

    try {
      setLoading(true)
      const data = await CustomersService.list(company.id)
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (!company?.id) return

    if (query.length > 2) {
      try {
        const results = await CustomersService.search(company.id, query)
        setCustomers(results)
      } catch (error) {
        console.error('Error searching:', error)
      }
    } else if (query.length === 0) {
      loadCustomers()
    }
  }

  const handleDelete = async (customerId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este cliente?')) return

    try {
      await CustomersService.delete(customerId)
      setCustomers(customers.filter(c => c.id !== customerId))
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const handleSuccess = (customer: Customer) => {
    if (selectedCustomer) {
      setCustomers(customers.map(c => (c.id === customer.id ? customer : c)))
    } else {
      setCustomers([customer, ...customers])
    }
    setShowForm(false)
    setSelectedCustomer(null)
  }

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Telefone',
    },
    {
      key: 'city',
      header: 'Cidade',
    },
    {
      key: 'active',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Ações',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedCustomer(row)
              setShowForm(true)
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(value)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => {
            setSelectedCustomer(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {showForm ? (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {selectedCustomer ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <CustomerForm
            customer={selectedCustomer || undefined}
            companyId={company?.id || ''}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false)
              setSelectedCustomer(null)
            }}
          />
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CPF/CNPJ..."
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1 border-0 bg-transparent focus:outline-none"
              />
            </div>
          </Card>

          <Table<Customer>
            columns={columns}
            data={customers}
            loading={loading}
            emptyMessage="Nenhum cliente cadastrado"
          />
        </>
      )}
    </div>
  )
}
