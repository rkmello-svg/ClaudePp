import { ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export interface Column<T> {
  key: keyof T
  header: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  loading,
  emptyMessage = 'Nenhum registro encontrado',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0

    const aVal = a[sortKey]
    const bVal = b[sortKey]

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                  col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => col.sortable && handleSort(col.key)}
                style={{ width: col.width }}
              >
                <div className="flex items-center gap-2">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
