'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Property } from '@/types/property'
import { DataTable, Column } from '@/components/common/DataTable'
import { PropertyDetailsModal } from '@/components/property/PropertyDetailsModal'
import { PropertyForm } from '@/components/forms/PropertyForm'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Select } from '@/components/common/Select'
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useProperties } from '@/hooks/useProperties'
import { usePropertySearch } from '@/hooks/usePropertySearch'
import Image from 'next/image'
import { getPropertyDisplayTitle } from '@/lib/property-utils'

export default function PropertiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 })
  const [isStatsLoading, setIsStatsLoading] = useState(true)

  const { deleteProperty, isLoading: isDeleting } = useProperties()
  const { properties, isLoading, searchProperties } = usePropertySearch({ includeAuth: true })

  // Keep a stable ref to searchProperties so effects/callbacks never go stale
  const searchRef = useRef(searchProperties)
  searchRef.current = searchProperties

  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('id, status')

      if (error) throw error

      const all = data || []
      setStats({
        total: all.length,
        published: all.filter((p) => p.status === 'published').length,
        draft: all.filter((p) => p.status === 'draft').length,
        archived: all.filter((p) => p.status === 'archived').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsStatsLoading(false)
    }
  }, [])

  const doSearch = useCallback(() => {
    searchRef.current({
      search: searchQuery || undefined,
      status: statusFilter === 'all' ? 'all' : statusFilter as any,
      sortBy: sortKey,
      sortDirection,
      limit: 200,
    })
  }, [searchQuery, statusFilter, sortKey, sortDirection])

  // Initial load
  useEffect(() => {
    fetchStats()
    doSearch()
  }, [fetchStats, doSearch])

  // Debounced search on filter changes (skip initial render)
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      doSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [doSearch])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (property: Property) => {
    setSelectedProperty(property)
    setIsDetailsOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedProperty(null)
    setIsFormOpen(true)
  }

  const handleEdit = (property: Property) => {
    setIsDetailsOpen(false)
    setSelectedProperty(property)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (property: Property) => {
    setIsDetailsOpen(false)
    setPropertyToDelete(property)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return

    try {
      await deleteProperty(propertyToDelete.id)
      doSearch()
      fetchStats()
      setIsDeleteModalOpen(false)
      setPropertyToDelete(null)
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    setSelectedProperty(null)
    doSearch()
    fetchStats()
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ]

  const columns: Column<Property>[] = useMemo(
    () => [
      {
        key: 'cover_photo_url',
        label: 'Image',
        className: 'w-20',
        render: (url: string | null) => (
          <div className="relative w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {url ? (
              <Image
                src={url}
                alt="Property"
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-[10px] text-center px-1">No image</span>
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'title',
        label: 'Property',
        sortable: true,
        render: (value: string, property: Property) => (
          <div className="min-w-0">
            <div className="font-medium text-navy truncate max-w-xs">
              {getPropertyDisplayTitle(property)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
              <span>{property.city}, {property.state}</span>
              {property.featured && (
                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px] font-medium">
                  Featured
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'unit_type',
        label: 'Type',
        sortable: true,
        render: (value: string | null, property: Property) => (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{value || '-'}</div>
            {property.furnish_level && (
              <div className="text-xs text-gray-500">{property.furnish_level}</div>
            )}
          </div>
        ),
      },
      {
        key: 'beds',
        label: 'Beds/Baths',
        render: (value: number | null, property: Property) => (
          <span className="text-sm whitespace-nowrap">
            <span className="font-medium">{value ?? '-'}</span> / <span className="font-medium">{property.baths ?? '-'}</span>
          </span>
        ),
      },
      {
        key: 'square_footage',
        label: 'Sq Ft',
        sortable: true,
        render: (value: number | null) =>
          value ? <span className="text-sm">{value.toLocaleString()}</span> : '-',
      },
      {
        key: 'monthly_rent',
        label: 'Rent',
        sortable: true,
        render: (value: number | null) =>
          value ? <span className="text-sm font-semibold text-navy">${value.toLocaleString()}</span> : '-',
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string, property: Property) => {
          const colors = {
            published: 'bg-green-100 text-green-800',
            draft: 'bg-gray-100 text-gray-800',
            archived: 'bg-red-100 text-red-800',
          }
          return (
            <div className="flex flex-col gap-1">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium inline-block text-center ${
                  colors[value as keyof typeof colors]
                }`}
              >
                {value}
              </span>
              {property.wix_id && (
                <span className="text-[10px] text-gray-400" title={`Wix ID: ${property.wix_id}`}>
                  Wix
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (value: string) => (
          <span className="text-sm text-gray-600">
            {new Date(value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        className: 'w-20',
        render: (_: any, property: Property) => (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(property)
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              aria-label="Edit"
              title="Edit property"
            >
              <PencilIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(property)
              }}
              className="p-1.5 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete"
              title="Delete property"
            >
              <TrashIcon className="h-4 w-4 text-red-600" />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-navy">
            Properties
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your property listings
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-navy">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Archived</p>
          <p className="text-2xl font-bold text-red-600">{stats.archived}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Properties Table */}
      {isLoading && properties.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={properties}
          onRowClick={handleRowClick}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage={
            searchQuery || statusFilter !== 'all'
              ? 'No properties match your filters'
              : 'No properties yet. Click "Add Property" to create your first property!'
          }
        />
      )}

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedProperty(null)
        }}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Property Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedProperty(null)
        }}
        title={selectedProperty ? 'Edit Property' : 'Add New Property'}
        size="full"
      >
        <PropertyForm
          property={selectedProperty || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false)
            setSelectedProperty(null)
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setPropertyToDelete(null)
        }}
        title="Delete Property"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{propertyToDelete?.title}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setPropertyToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Delete Property
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
