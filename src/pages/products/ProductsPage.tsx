import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Product, ProductsService } from '@/services/products.service'
import { Table, Column } from '@/components/Table'
import { Card, StatCard } from '@/components/Card'
import { Plus, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

export default function ProductsPage() {
  const { company } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, totalValue: 0, lowStock: 0 })

  useEffect(() => {
    loadProducts()
  }, [company?.id])

  const loadProducts = async () => {
    if (!company?.id) return

    try {
      setLoading(true)
      const data = await ProductsService.list(company.id)
      const lowStock = await ProductsService.getLowStock(company.id)

      setProducts(data)
      setLowStockProducts(lowStock)

      const totalValue = data.reduce((sum, p) => sum + p.price * p.stock_quantity, 0)
      setStats({
        total: data.length,
        totalValue,
        lowStock: lowStock.length,
      })
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'sku',
      header: 'SKU',
    },
    {
      key: 'price',
      header: 'Preço',
      render: (value) => formatCurrency(value),
      sortable: true,
    },
    {
      key: 'cost',
      header: 'Custo',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'stock_quantity',
      header: 'Estoque',
      sortable: true,
      render: (value) => (
        <span className={value < 10 ? 'text-red-600 font-bold' : ''}>
          {value} un.
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total de Produtos" value={stats.total} />
        <StatCard title="Valor em Estoque" value={formatCurrency(stats.totalValue)} />
        <StatCard title="Produtos com Baixo Estoque" value={stats.lowStock} trend="down" />
        <StatCard title="Margem Média" value="35%" />
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900">Produtos com Baixo Estoque</h3>
              <p className="text-sm text-yellow-800 mt-1">
                {lowStockProducts.length} produto(s) com menos de 10 unidades
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lowStockProducts.slice(0, 5).map(p => (
                  <span key={p.id} className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded">
                    {p.name} ({p.stock_quantity} un.)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Table<Product>
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="Nenhum produto cadastrado"
      />
    </div>
  )
}
