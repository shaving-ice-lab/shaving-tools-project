'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ColumnDef<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  sortable?: boolean
  exportable?: boolean
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, sortable = true, exportable = true, className }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortedData = useMemo(() => {
    if (!sortKey) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal)
      const bStr = String(bVal)
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, sortKey, sortDirection])

  const handleSort = (key: string) => {
    if (!sortable) return

    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const exportToCSV = () => {
    const headers = columns.map(col => col.header).join(',')
    const rows = sortedData.map(row =>
      columns
        .map(col => {
          const value = row[col.key as keyof T]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : String(value ?? '')
        })
        .join(',')
    )

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {exportable && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            导出 CSV
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left font-medium',
                    sortable && col.sortable !== false && 'cursor-pointer hover:bg-muted/80',
                    col.className
                  )}
                  onClick={() => col.sortable !== false && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {sortable && col.sortable !== false && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr key={i} className="border-t hover:bg-muted/50 transition-colors">
                {columns.map(col => (
                  <td key={String(col.key)} className={cn('px-4 py-3', col.className)}>
                    {col.render ? col.render(row[col.key as keyof T], row) : String(row[col.key as keyof T] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {sortedData.length === 0 && <div className="text-center py-8 text-muted-foreground">暂无数据</div>}
      </div>
    </div>
  )
}
