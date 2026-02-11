'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SearchFilters } from '@/components/property/PropertyFilters'
import { MapView } from '@/components/maps/MapView'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PropertyListCard } from '@/components/property/PropertyListCard'
import { usePropertySearch } from '@/hooks/usePropertySearch'
import { Property } from '@/types/property'
import { MapPinIcon, AdjustmentsHorizontalIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/common/Button'
import { geocodeAddress, getCurrentLocation, loadGoogleMaps } from '@/lib/google-maps'
import { formatCurrency } from '@/lib/utils'

const LA_CENTER = { lat: 34.0522, lng: -118.2437 }

export default function PropertiesPage() {
  const router = useRouter()
  const { properties, isLoading, error, searchProperties } = usePropertySearch()
  const [mapCenter, setMapCenter] = useState(LA_CENTER)
  const [mapZoom, setMapZoom] = useState(10)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Filter states
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [radius, setRadius] = useState('20')
  const [minBeds, setMinBeds] = useState('')
  const [minBaths, setMinBaths] = useState('')
  const [maxRent, setMaxRent] = useState('')
  const [petFriendly, setPetFriendly] = useState('all')
  const [isGeolocating, setIsGeolocating] = useState(false)

  // Stable ref for searchProperties so the mount effect doesn't go stale
  const searchRef = useRef(searchProperties)
  searchRef.current = searchProperties

  // Single mount effect: search LA immediately, then try geolocation
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      await searchRef.current({
        lat: LA_CENTER.lat,
        lng: LA_CENTER.lng,
        radius: 20,
      })
      if (!cancelled) {
        setLocation('Los Angeles, CA')
        setInitialLoadDone(true)
      }

      try {
        const userCoords = await getCurrentLocation()
        if (cancelled) return

        setMapCenter(userCoords)
        setMapZoom(11)

        try {
          await loadGoogleMaps()
          const geocoder = new google.maps.Geocoder()
          const result = await geocoder.geocode({
            location: { lat: userCoords.lat, lng: userCoords.lng },
          })
          if (!cancelled && result.results?.length) {
            const cityResult = result.results.find((r) =>
              r.types.includes('locality')
            )
            setLocation(
              cityResult
                ? cityResult.formatted_address
                : result.results[0].formatted_address
            )
          }
        } catch {
          // Reverse geocode failed — keep coordinates
        }

        if (!cancelled) {
          await searchRef.current({
            lat: userCoords.lat,
            lng: userCoords.lng,
            radius: 20,
          })
        }
      } catch {
        // Geolocation denied/unavailable — keep LA results
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  const handleSearch = useCallback(async () => {
    const filters: SearchFilters = {
      location,
      radius: Number(radius),
    }

    if (location) {
      const coords = await geocodeAddress(location)
      if (coords) {
        filters.lat = coords.lat
        filters.lng = coords.lng
        setMapCenter({ lat: coords.lat, lng: coords.lng })
        setMapZoom(11)
      }
    }

    if (minBeds) filters.minBeds = Number(minBeds)
    if (minBaths) filters.minBaths = Number(minBaths)
    if (maxRent) filters.maxRent = Number(maxRent)
    if (petFriendly !== 'all') {
      filters.allowsPets = petFriendly === 'yes'
    }

    await searchProperties(filters)
  }, [location, radius, minBeds, minBaths, maxRent, petFriendly, searchProperties])

  const handleUseMyLocation = useCallback(async () => {
    try {
      setIsGeolocating(true)
      const coords = await getCurrentLocation()

      const geocoder = new google.maps.Geocoder()
      const result = await geocoder.geocode({
        location: { lat: coords.lat, lng: coords.lng },
      })

      if (result.results && result.results.length > 0) {
        setLocation(result.results[0].formatted_address)
      }

      setMapCenter({ lat: coords.lat, lng: coords.lng })
      setMapZoom(11)

      await searchProperties({
        lat: coords.lat,
        lng: coords.lng,
        radius: Number(radius),
        minBeds: minBeds ? Number(minBeds) : undefined,
        minBaths: minBaths ? Number(minBaths) : undefined,
        maxRent: maxRent ? Number(maxRent) : undefined,
        allowsPets: petFriendly === 'yes' ? true : petFriendly === 'no' ? false : undefined,
      })
    } catch (err) {
      console.error('Error getting location:', err)
      alert('Could not get your location. Please enter a location manually.')
    } finally {
      setIsGeolocating(false)
    }
  }, [radius, minBeds, minBaths, maxRent, petFriendly, searchProperties])

  const handlePropertyClick = useCallback((property: Property) => {
    router.push(`/properties/${property.id}`)
  }, [router])

  const handleMarkerClick = useCallback((property: Property) => {
    router.push(`/properties/${property.id}`)
  }, [router])

  const activeFilterCount = useMemo(
    () => [minBeds, minBaths, maxRent, petFriendly !== 'all' ? petFriendly : null].filter(Boolean).length,
    [minBeds, minBaths, maxRent, petFriendly]
  )

  // Memoize to give MapView a stable array reference
  const propertiesWithCoords = useMemo(
    () => properties.filter((p) => p.latitude && p.longitude),
    [properties]
  )

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Compact Header */}
      <div className="bg-navy text-white py-6 flex-shrink-0">
        <div className="max-w-full px-6">
          <h1 className="text-2xl font-heading font-bold">Find Your Perfect Property</h1>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Search and Results */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Location Search */}
          <div className="p-6 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="space-y-4">
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter city, state, or zip code"
                  className="w-full pl-10 pr-32 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUseMyLocation}
                  isLoading={isGeolocating}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  Use My Location
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-orange text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Search
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Radius</label>
                    <select
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="5">5 miles</option>
                      <option value="10">10 miles</option>
                      <option value="20">20 miles</option>
                      <option value="50">50 miles</option>
                      <option value="100">100 miles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min Beds</label>
                    <select
                      value={minBeds}
                      onChange={(e) => setMinBeds(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="">Any</option>
                      <option value="0">Studio</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min Baths</label>
                    <select
                      value={minBaths}
                      onChange={(e) => setMinBaths(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="1.5">1.5+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Max Rent</label>
                    <input
                      type="number"
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                      placeholder="Any"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pet Policy</label>
                    <select
                      value={petFriendly}
                      onChange={(e) => setPetFriendly(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="all">Any</option>
                      <option value="yes">Pet Friendly</option>
                      <option value="no">No Pets</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {initialLoadDone && (
              <p className="text-sm text-gray-600 mt-4">
                <span className="font-semibold text-navy">{properties.length}</span>{' '}
                {properties.length === 1 ? 'property' : 'properties'} found
              </p>
            )}
          </div>

          {/* Property List - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {!initialLoadDone && isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-semibold mb-2">Unable to load properties</p>
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="m-6 text-center py-12 bg-white rounded-lg shadow">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Try adjusting your filters or search location
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {properties.map((property) => (
                  <PropertyListCard
                    key={property.id}
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                    showDistance={initialLoadDone}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-1/2 flex flex-col">
          <div className="h-full">
            <MapView
              properties={propertiesWithCoords}
              center={mapCenter}
              zoom={mapZoom}
              onMarkerClick={handleMarkerClick}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
