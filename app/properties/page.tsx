'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyFilters, SearchFilters } from '@/components/property/PropertyFilters'
import { PropertyList } from '@/components/property/PropertyList'
import { MapView } from '@/components/maps/MapView'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { usePropertySearch } from '@/hooks/usePropertySearch'
import { Property } from '@/types/property'
import { supabase } from '@/lib/supabase'
import { MapIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/common/Button'

export default function PropertiesPage() {
  const router = useRouter()
  const { properties, isLoading, error, searchProperties } = usePropertySearch()
  const [allPublishedProperties, setAllPublishedProperties] = useState<Property[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 39.8283,
    lng: -98.5795,
  })
  const [showMap, setShowMap] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Load all published properties on mount
  useEffect(() => {
    loadPublishedProperties()
  }, [])

  const loadPublishedProperties = async () => {
    try {
      setIsLoadingInitial(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      setAllPublishedProperties(data || [])
    } catch (err) {
      console.error('Error loading properties:', err)
    } finally {
      setIsLoadingInitial(false)
    }
  }

  const handleSearch = async (filters: SearchFilters) => {
    if (filters.lat && filters.lng) {
      setMapCenter({ lat: filters.lat, lng: filters.lng })
    }
    await searchProperties(filters)
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    router.push(`/properties/${property.id}`)
  }

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property)
    // Optionally scroll to the property in the list
  }

  // Display properties: search results if available, otherwise all published
  const displayProperties = properties.length > 0 ? properties : allPublishedProperties

  // Filter properties with coordinates for map display
  const propertiesWithCoords = displayProperties.filter(
    (p) => p.latitude && p.longitude
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-xl text-gray-200">
            Search from our extensive collection of properties across the country
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filters */}
        <div className="mb-6">
          <PropertyFilters onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Map/List Toggle */}
        <div className="mb-4 flex justify-end gap-2">
          <Button
            variant={showMap ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowMap(true)}
          >
            <MapIcon className="h-5 w-5 mr-2" />
            Map View
          </Button>
          <Button
            variant={!showMap ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowMap(false)}
          >
            <ListBulletIcon className="h-5 w-5 mr-2" />
            List Only
          </Button>
        </div>

        {/* Results */}
        {isLoadingInitial ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold mb-2">Error loading properties</p>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            {showMap && (
              <div className="lg:sticky lg:top-4 h-[600px]">
                <MapView
                  properties={propertiesWithCoords}
                  center={mapCenter}
                  zoom={properties.length > 0 ? 10 : 4}
                  onMarkerClick={handleMarkerClick}
                  className="w-full h-full"
                />
                {propertiesWithCoords.length < displayProperties.length && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Showing {propertiesWithCoords.length} of {displayProperties.length}{' '}
                    properties with coordinates
                  </p>
                )}
              </div>
            )}

            {/* Property List */}
            <div className={showMap ? '' : 'lg:col-span-2'}>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <PropertyList
                  properties={displayProperties}
                  onPropertyClick={handlePropertyClick}
                />
              )}
            </div>
          </div>
        )}

        {/* No Properties Message */}
        {!isLoadingInitial && displayProperties.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-2">No properties available yet</p>
            <p className="text-sm text-gray-400">Check back soon for new listings</p>
          </div>
        )}
      </div>
    </div>
  )
}
