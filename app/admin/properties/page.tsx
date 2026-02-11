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
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useProperties } from '@/hooks/useProperties'
import { usePropertySearch } from '@/hooks/usePropertySearch'
import Image from 'next/image'
import { getPropertyDisplayTitle } from '@/lib/property-utils'

const STATUS_CHIPS = [
  { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-700 border-gray-300', activeColor: 'bg-navy text-white border-navy' },
  { value: 'published', label: 'Published', color: 'bg-green-50 text-green-700 border-green-300', activeColor: 'bg-green-600 text-white border-green-600' },
  { value: 'draft', label: 'Draft', color: 'bg-gray-50 text-gray-600 border-gray-300', activeColor: 'bg-gray-600 text-white border-gray-600' },
  { value: 'archived', label: 'Archived', color: 'bg-red-50 text-red-700 border-red-300', activeColor: 'bg-red-600 text-white border-red-600' },
] as const

export default function PropertiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sortKey, setSortKey] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 })

  const { deleteProperty, isLoading: isDeleting } = useProperties()
  const { properties, totalCount, isLoading, searchProperties } = usePropertySearch({ includeAuth: true })

  const searchRef = useRef(searchProperties)
  searchRef.current = searchProperties

  // Efficient count-only stats query (no row data fetched)
  const fetchStats = useCallback(async () => {
    try {
      const [totalRes, pubRes, draftRes, archRes] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
      ])
      setStats({
        total: totalRes.count ?? 0,
        published: pubRes.count ?? 0,
        draft: draftRes.count ?? 0,
        archived: archRes.count ?? 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  const doSearch = useCallback(() => {
    searchRef.current({
      search: searchQuery || undefined,
      status: statusFilter === 'all' ? 'all' : statusFilter as any,
      sortBy: sortKey,
      sortDirection,
      limit: 500,
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

  // Client-side featured filter (applied on top of server results)
  const displayProperties = useMemo(() => {
    if (!featuredOnly) return properties
    return properties.filter((p) => p.featured)
  }, [properties, featuredOnly])

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDirection('asc')
      return key
    })
  }, [])

  const handleRowClick = useCallback((property: Property) => {
    setSelectedProperty(property)
    setIsDetailsOpen(true)
  }, [])

  const handleCreateNew = useCallback(() => {
    setSelectedProperty(null)
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((property: Property) => {
    setIsDetailsOpen(false)
    setSelectedProperty(property)
    setIsFormOpen(true)
  }, [])

  const handleDeleteClick = useCallback((property: Property) => {
    setIsDetailsOpen(false)
    setPropertyToDelete(property)
    setIsDeleteModalOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
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
  }, [propertyToDelete, deleteProperty, doSearch, fetchStats])

  const handleFormSuccess = useCallback(async () => {
    setIsFormOpen(false)
    setSelectedProperty(null)
    doSearch()
    fetchStats()
  }, [doSearch, fetchStats])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || featuredOnly

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
    [handleEdit, handleDeleteClick]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-navy">
            Properties
          </h1>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold text-navy">{stats.total.toLocaleString()}</span> total properties in database
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg shadow text-left transition-all ${
            statusFilter === 'all' ? 'ring-2 ring-navy bg-navy/5' : 'bg-white hover:shadow-md'
          }`}
        >
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-navy">{stats.total.toLocaleString()}</p>
        </button>
        <button
          onClick={() => setStatusFilter('published')}
          className={`p-4 rounded-lg shadow text-left transition-all ${
            statusFilter === 'published' ? 'ring-2 ring-green-500 bg-green-50' : 'bg-white hover:shadow-md'
          }`}
        >
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published.toLocaleString()}</p>
        </button>
        <button
          onClick={() => setStatusFilter('draft')}
          className={`p-4 rounded-lg shadow text-left transition-all ${
            statusFilter === 'draft' ? 'ring-2 ring-gray-400 bg-gray-50' : 'bg-white hover:shadow-md'
          }`}
        >
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-600">{stats.draft.toLocaleString()}</p>
        </button>
        <button
          onClick={() => setStatusFilter('archived')}
          className={`p-4 rounded-lg shadow text-left transition-all ${
            statusFilter === 'archived' ? 'ring-2 ring-red-400 bg-red-50' : 'bg-white hover:shadow-md'
          }`}
        >
          <p className="text-sm text-gray-600">Archived</p>
          <p className="text-2xl font-bold text-red-600">{stats.archived.toLocaleString()}</p>
        </button>
      </div>

      {/* Search & Filter Chips */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, city, state, address, or zip..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1">Status:</span>
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setStatusFilter(chip.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                statusFilter === chip.value ? chip.activeColor : chip.color
              }`}
            >
              {chip.label}
              {chip.value !== 'all' && (
                <span className="ml-1 opacity-75">
                  {chip.value === 'published' ? stats.published : chip.value === 'draft' ? stats.draft : stats.archived}
                </span>
              )}
            </button>
          ))}

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
              featuredOnly
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-yellow-50 text-yellow-700 border-yellow-300'
            }`}
          >
            {featuredOnly ? (
              <StarIconSolid className="h-3 w-3" />
            ) : (
              <StarIcon className="h-3 w-3" />
            )}
            Featured
          </button>

          {hasActiveFilters && (
            <>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setFeaturedOnly(false)
                }}
                className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Result count */}
        {!isLoading && (
          <p className="text-xs text-gray-500">
            {featuredOnly
              ? `${displayProperties.length} featured of ${properties.length} results`
              : `${properties.length} results`
            }
            {totalCount > properties.length && ` (${totalCount.toLocaleString()} total matches)`}
          </p>
        )}
      </div>

      {/* Properties Table */}
      {isLoading && properties.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={displayProperties}
          onRowClick={handleRowClick}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          pageSize={50}
          totalItems={featuredOnly ? displayProperties.length : totalCount}
          emptyMessage={
            hasActiveFilters
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
