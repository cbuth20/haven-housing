'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Property } from '@/types/property'
import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyForm } from '@/components/forms/PropertyForm'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useProperties } from '@/hooks/useProperties'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { deleteProperty, isLoading: isDeleting } = useProperties()

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    filterProperties()
  }, [properties, searchQuery, statusFilter])

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProperties = () => {
    let filtered = [...properties]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.city?.toLowerCase().includes(query) ||
          p.state?.toLowerCase().includes(query) ||
          p.street_address?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    setFilteredProperties(filtered)
  }

  const handleCreateNew = () => {
    setSelectedProperty(null)
    setIsFormOpen(true)
  }

  const handleEdit = (property: Property) => {
    setSelectedProperty(property)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return

    try {
      await deleteProperty(propertyToDelete.id)
      await fetchProperties()
      setIsDeleteModalOpen(false)
      setPropertyToDelete(null)
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    setSelectedProperty(null)
    await fetchProperties()
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ]

  const stats = {
    total: properties.length,
    published: properties.filter((p) => p.status === 'published').length,
    draft: properties.filter((p) => p.status === 'draft').length,
    archived: properties.filter((p) => p.status === 'archived').length,
  }

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

      {/* Properties Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              showActions
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No properties match your filters'
              : 'No properties yet. Create your first property!'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button
              variant="primary"
              onClick={handleCreateNew}
              className="mt-4"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Property
            </Button>
          )}
        </div>
      )}

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
