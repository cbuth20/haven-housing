'use client'

import { ReactNode, useState, useMemo } from 'react'
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyMessage?: string
  className?: string
  /** When set, enables client-side pagination with this many rows per page */
  pageSize?: number
  /** Total items in the full dataset (may exceed data.length if server-truncated). Shown in the pagination footer. */
  totalItems?: number
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage = 'No data available',
  className = '',
  pageSize,
  totalItems,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(0)

  // Reset to page 0 when data changes
  const dataKey = data.length + (data[0] as any)?.id
  const [prevDataKey, setPrevDataKey] = useState(dataKey)
  if (dataKey !== prevDataKey) {
    setPrevDataKey(dataKey)
    if (currentPage !== 0) setCurrentPage(0)
  }

  const paginated = useMemo(() => {
    if (!pageSize) return data
    const start = currentPage * pageSize
    return data.slice(start, start + pageSize)
  }, [data, currentPage, pageSize])

  const totalPages = pageSize ? Math.ceil(data.length / pageSize) : 1
  const displayTotal = totalItems ?? data.length

  const handleSort = (key: string) => {
    if (onSort) onSort(key)
  }

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.label}</span>
                    {column.sortable && sortKey === column.key && (
                      <span className="text-navy">
                        {sortDirection === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`${
                    onRowClick
                      ? 'cursor-pointer hover:bg-gray-50 transition-colors'
                      : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.className || ''
                      }`}
                    >
                      {column.render
                        ? column.render(
                            (item as any)[column.key],
                            item
                          )
                        : (item as any)[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {pageSize && data.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-medium">{currentPage * pageSize + 1}</span>
            {' '}&ndash;{' '}
            <span className="font-medium">{Math.min((currentPage + 1) * pageSize, data.length)}</span>
            {' '}of{' '}
            <span className="font-medium">{displayTotal.toLocaleString()}</span>
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((page) => {
                  // Show first, last, and pages near current
                  if (page === 0 || page === totalPages - 1) return true
                  return Math.abs(page - currentPage) <= 1
                })
                .reduce<(number | 'gap')[]>((acc, page) => {
                  const prev = acc[acc.length - 1]
                  if (typeof prev === 'number' && page - prev > 1) {
                    acc.push('gap')
                  }
                  acc.push(page)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === 'gap' ? (
                    <span key={`gap-${idx}`} className="px-1 text-gray-400 text-sm">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`min-w-[32px] h-8 rounded text-sm font-medium transition-colors ${
                        currentPage === item
                          ? 'bg-navy text-white'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {item + 1}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
