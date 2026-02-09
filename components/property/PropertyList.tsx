'use client'

import { useState } from 'react'
import { Property } from '@/types/property'
import { PropertyCard } from './PropertyCard'
import { Button } from '@/components/common/Button'
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'

interface PropertyListProps {
  properties: Property[]
  onPropertyClick?: (property: Property) => void
}

export function PropertyList({ properties, onPropertyClick }: PropertyListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No properties found matching your criteria</p>
        <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-navy">{properties.length}</span>{' '}
          {properties.length === 1 ? 'property' : 'properties'} found
        </p>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Squares2X2Icon className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListBulletIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Properties */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={onPropertyClick}
              showActions={false}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-64 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                  {property.cover_photo_url ? (
                    <img
                      src={property.cover_photo_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-heading font-bold text-navy">
                      {property.title}
                    </h3>
                    {property.monthly_rent && (
                      <p className="text-xl font-bold text-navy ml-4">
                        ${property.monthly_rent.toLocaleString()}/mo
                      </p>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3">
                    {property.street_address}
                    <br />
                    {property.city}, {property.state} {property.zip_code}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    {property.beds && <span>{property.beds} beds</span>}
                    {property.baths && <span>{property.baths} baths</span>}
                    {property.square_footage && <span>{property.square_footage} sq ft</span>}
                    {property.distance && (
                      <span className="text-orange font-semibold">
                        {property.distance.toFixed(1)} mi away
                      </span>
                    )}
                  </div>

                  {property.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {property.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onPropertyClick?.(property)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
