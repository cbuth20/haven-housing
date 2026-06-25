'use client'

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchFilters } from '@/components/property/PropertyFilters'
import { PlacesAutocompleteDropdown } from '@/components/property/PlacesAutocompleteDropdown'
import { MapView } from '@/components/maps/MapView'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PropertyListCard } from '@/components/property/PropertyListCard'
import { usePropertySearch } from '@/hooks/usePropertySearch'
import { Property } from '@/types/property'
import { MapPinIcon, AdjustmentsHorizontalIcon, HomeIcon, CurrencyDollarIcon, GlobeAmericasIcon, MapIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentLocation, loadGoogleMaps } from '@/lib/google-maps'
import { formatCurrency } from '@/lib/utils'

const LA_CENTER = { lat: 34.0522, lng: -118.2437 }

function PropertiesPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { properties, isLoading, error, searchProperties } = usePropertySearch({ includeAuth: true })
  const [mapCenter, setMapCenter] = useState(LA_CENTER)
  const [mapZoom, setMapZoom] = useState(10)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Filter states — initialized from URL params
  const [location, setLocation] = useState(() => searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [radius, setRadius] = useState(() => searchParams.get('radius') || '20')
  const [minBeds, setMinBeds] = useState(() => searchParams.get('beds') || '')
  const [minBaths, setMinBaths] = useState(() => searchParams.get('baths') || '')
  const [maxRent, setMaxRent] = useState(() => searchParams.get('rent') || '')
  const [petFriendly, setPetFriendly] = useState(() => searchParams.get('pets') || 'all')
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [isGlobalView, setIsGlobalView] = useState(() => searchParams.get('global') === '1')
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
  })

  // Stable ref for searchProperties so the mount effect doesn't go stale
  const searchRef = useRef(searchProperties)
  searchRef.current = searchProperties

  // Initial load: check URL params first, then geolocation or SD fallback
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const urlLat = searchParams.get('lat')
      const urlLng = searchParams.get('lng')
      const urlGlobal = searchParams.get('global') === '1'

      if (urlGlobal) {
        if (!cancelled) {
          setMapCenter({ lat: 39.8283, lng: -98.5795 })
          setMapZoom(4)
          await searchRef.current({ status: 'published', limit: 5000 })
          setInitialLoadDone(true)
        }
        return
      }

      if (urlLat && urlLng) {
        const coords = { lat: Number(urlLat), lng: Number(urlLng) }
        if (!cancelled) {
          setMapCenter(coords)
          setMapZoom(11)
          const filters: SearchFilters = {
            lat: coords.lat,
            lng: coords.lng,
            radius: Number(searchParams.get('radius') || '20'),
          }
          const beds = searchParams.get('beds')
          const baths = searchParams.get('baths')
          const rent = searchParams.get('rent')
          const pets = searchParams.get('pets')
          if (beds) filters.minBeds = Number(beds)
          if (baths) filters.minBaths = Number(baths)
          if (rent) filters.maxRent = Number(rent)
          if (pets && pets !== 'all') filters.allowsPets = pets === 'yes'
          await searchRef.current(filters)
          setInitialLoadDone(true)
        }
        return
      }

      // No URL params — geolocation or SD fallback (existing behavior)
      try {
        const coords = await getCurrentLocation()
        if (!cancelled) {
          setMapCenter({ lat: coords.lat, lng: coords.lng })
          setMapZoom(11)
          await searchRef.current({ lat: coords.lat, lon: coords.lng, radius: 20, limit: 500 })
        }
      } catch (error) {
        if (!cancelled) {
          const sanDiego = { lat: 32.7157, lng: -117.1611 }
          setMapCenter(sanDiego)
          setMapZoom(11)
          await searchRef.current({ lat: sanDiego.lat, lon: sanDiego.lng, radius: 20, limit: 500 })
        }
      } finally {
        if (!cancelled) setInitialLoadDone(true)
      }
    }

    init()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Note: searchParams intentionally excluded from deps — read only on mount

  // pushSearchParams is defined before the handlers that depend on it
  const pushSearchParams = useCallback((overrides: {
    q?: string
    lat?: number | null
    lng?: number | null
    radius?: string
    beds?: string
    baths?: string
    rent?: string
    pets?: string
    global?: boolean
  } = {}) => {
    const params = new URLSearchParams()
    const q = overrides.q !== undefined ? overrides.q : location
    const lat = overrides.lat !== undefined ? overrides.lat : selectedCoords?.lat
    const lng = overrides.lng !== undefined ? overrides.lng : selectedCoords?.lng
    const r = overrides.radius !== undefined ? overrides.radius : radius
    const b = overrides.beds !== undefined ? overrides.beds : minBeds
    const ba = overrides.baths !== undefined ? overrides.baths : minBaths
    const rent = overrides.rent !== undefined ? overrides.rent : maxRent
    const pets = overrides.pets !== undefined ? overrides.pets : petFriendly
    const isGlobal = overrides.global !== undefined ? overrides.global : isGlobalView

    if (isGlobal) {
      params.set('global', '1')
    } else {
      if (q) params.set('q', q)
      if (lat != null) params.set('lat', String(lat))
      if (lng != null) params.set('lng', String(lng))
      if (r && r !== '20') params.set('radius', r)
      if (b) params.set('beds', b)
      if (ba) params.set('baths', ba)
      if (rent) params.set('rent', rent)
      if (pets && pets !== 'all') params.set('pets', pets)
    }

    const queryString = params.toString()
    router.push(`/properties${queryString ? `?${queryString}` : ''}`)
  }, [location, selectedCoords, radius, minBeds, minBaths, maxRent, petFriendly, isGlobalView, router])

  const handlePlaceSelect = useCallback(async (place: google.maps.places.AutocompletePrediction) => {
    // Get place details to extract coordinates
    await loadGoogleMaps()
    const placesService = new google.maps.places.PlacesService(document.createElement('div'))

    placesService.getDetails(
      {
        placeId: place.place_id,
        fields: ['geometry'],
      },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
          const coords = {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          }

          setMapCenter(coords)
          setMapZoom(11)
          setSelectedCoords(coords)

          // Auto-trigger search when place is selected
          const filters: SearchFilters = {
            location: place.description,
            lat: coords.lat,
            lng: coords.lng,
            radius: Number(radius),
          }

          if (minBeds) filters.minBeds = Number(minBeds)
          if (minBaths) filters.minBaths = Number(minBaths)
          if (maxRent) filters.maxRent = Number(maxRent)
          if (petFriendly !== 'all') {
            filters.allowsPets = petFriendly === 'yes'
          }

          searchProperties(filters)
          pushSearchParams({
            q: place.description,
            lat: coords.lat,
            lng: coords.lng,
          })
        }
      }
    )
  }, [radius, minBeds, minBaths, maxRent, petFriendly, searchProperties, pushSearchParams])

  const handleSearch = useCallback(async () => {
    const filters: SearchFilters = {
      radius: Number(radius),
    }
    if (selectedCoords) {
      filters.lat = selectedCoords.lat
      filters.lng = selectedCoords.lng
    }
    if (minBeds) filters.minBeds = Number(minBeds)
    if (minBaths) filters.minBaths = Number(minBaths)
    if (maxRent) filters.maxRent = Number(maxRent)
    if (petFriendly !== 'all') filters.allowsPets = petFriendly === 'yes'

    pushSearchParams({ global: false })
    await searchProperties(filters)
  }, [selectedCoords, radius, minBeds, minBaths, maxRent, petFriendly, searchProperties, pushSearchParams])

  const handleGlobalView = useCallback(async () => {
    setIsGlobalView(true)
    setLocation('')
    setMapCenter({ lat: 39.8283, lng: -98.5795 }) // Center of US
    setMapZoom(4)

    // Fetch all published properties without location filter
    await searchProperties({
      status: 'published',
      limit: 5000,
    })
    pushSearchParams({ global: true })
  }, [searchProperties, pushSearchParams])

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
      setSelectedCoords({ lat: coords.lat, lng: coords.lng })

      await searchProperties({
        lat: coords.lat,
        lng: coords.lng,
        radius: Number(radius),
        minBeds: minBeds ? Number(minBeds) : undefined,
        minBaths: minBaths ? Number(minBaths) : undefined,
        maxRent: maxRent ? Number(maxRent) : undefined,
        allowsPets: petFriendly === 'yes' ? true : petFriendly === 'no' ? false : undefined,
      })
      pushSearchParams({
        q: result.results?.[0]?.formatted_address || '',
        lat: coords.lat,
        lng: coords.lng,
      })
    } catch (err) {
      console.error('Error getting location:', err)
      alert('Could not get your location. Please enter a location manually.')
    } finally {
      setIsGeolocating(false)
    }
  }, [radius, minBeds, minBaths, maxRent, petFriendly, searchProperties, pushSearchParams])

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

  const handleClearFilters = useCallback(() => {
    setRadius('20')
    setMinBeds('')
    setMinBaths('')
    setMaxRent('')
    setPetFriendly('all')
    setSelectedCoords(null)
    setIsGlobalView(false)

    // Sync URL: keep location/coords, clear filter params
    pushSearchParams({ radius: '20', beds: '', baths: '', rent: '', pets: 'all', global: false })

    // Re-run search with reset filter values directly (can't use handleSearch — async state won't reflect yet)
    if (selectedCoords) {
      searchProperties({
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        radius: 20,
      })
    }
  }, [selectedCoords, searchProperties, pushSearchParams])

  // Memoize to give MapView a stable array reference
  const propertiesWithCoords = useMemo(
    () => properties.filter((p) => p.latitude && p.longitude),
    [properties]
  )

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Compact Header */}
      <div className="bg-navy text-white py-4 sm:py-6 flex-shrink-0">
        <div className="max-w-full px-4 sm:px-6">
          <h1 className="text-xl sm:text-2xl font-heading font-bold">Find Your Perfect Property</h1>
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${mobileView === 'list' ? 'text-navy border-b-2 border-navy' : 'text-gray-500'}`}
        >
          <ListBulletIcon className="h-4 w-4" />
          List
        </button>
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${mobileView === 'map' ? 'text-navy border-b-2 border-navy' : 'text-gray-500'}`}
        >
          <MapIcon className="h-4 w-4" />
          Map
        </button>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Search and Results */}
        <div className={`w-full lg:w-1/2 flex flex-col border-r border-gray-200 ${mobileView === 'map' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Location Search */}
          <div className="p-4 sm:p-6 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <PlacesAutocompleteDropdown
                    value={location}
                    onChange={(val) => {
                      setLocation(val)
                      setSelectedCoords(null)
                    }}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Search by city, neighborhood, or address"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseMyLocation}
                  isLoading={isGeolocating}
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <MapPinIcon className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">My Location</span>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-1 sm:ml-2 bg-orange text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant={isGlobalView ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleGlobalView}
                  isLoading={isLoading && isGlobalView}
                  className="flex items-center"
                >
                  <GlobeAmericasIcon className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Global View</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={() => { setIsGlobalView(false); handleSearch() }}
                  isLoading={isLoading && !isGlobalView}
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

                  {activeFilterCount > 0 && (
                    <div className="col-span-2 flex justify-end pt-1">
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-orange hover:underline font-medium"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {initialLoadDone && (
              <p className="text-sm text-gray-600 mt-4">
                <span className="font-semibold text-navy">{properties.length}</span>{' '}
                {properties.length === 1 ? 'property' : 'properties'} found
                {isGlobalView && <span className="ml-1 text-orange font-medium">(Global View)</span>}
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
        <div className={`w-full lg:w-1/2 flex flex-col ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="h-full">
            <MapView
              properties={propertiesWithCoords}
              center={mapCenter}
              zoom={mapZoom}
              onMarkerClick={handleMarkerClick}
              className="w-full h-full"
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>}>
      <PropertiesPageInner />
    </Suspense>
  )
}
