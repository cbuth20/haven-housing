'use client'

import { useState } from 'react'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { PlacesAutocompleteDropdown } from './PlacesAutocompleteDropdown'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { getCurrentLocation, loadGoogleMaps } from '@/lib/google-maps'

interface PropertyFiltersProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

export interface SearchFilters {
  location?: string
  lat?: number
  lng?: number
  radius?: number
  minBeds?: number
  minBaths?: number
  maxRent?: number
  allowsPets?: boolean
}

export function PropertyFilters({ onSearch, isLoading = false }: PropertyFiltersProps) {
  const [location, setLocation] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.AutocompletePrediction | null>(null)
  const [radius, setRadius] = useState('20')
  const [minBeds, setMinBeds] = useState('')
  const [minBaths, setMinBaths] = useState('')
  const [maxRent, setMaxRent] = useState('')
  const [petFriendly, setPetFriendly] = useState('all')
  const [isGeolocating, setIsGeolocating] = useState(false)

  const handlePlaceSelect = async (place: google.maps.places.AutocompletePrediction) => {
    setSelectedPlace(place)

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

          onSearch(filters)
        }
      }
    )
  }

  const handleSearch = async () => {
    const filters: SearchFilters = {
      location,
      radius: Number(radius),
    }

    // Use coordinates from selected place if available
    if (selectedPlace) {
      await loadGoogleMaps()
      const placesService = new google.maps.places.PlacesService(document.createElement('div'))

      placesService.getDetails(
        {
          placeId: selectedPlace.place_id,
          fields: ['geometry'],
        },
        (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
            filters.lat = result.geometry.location.lat()
            filters.lng = result.geometry.location.lng()
          }

          // Add other filters
          if (minBeds) filters.minBeds = Number(minBeds)
          if (minBaths) filters.minBaths = Number(minBaths)
          if (maxRent) filters.maxRent = Number(maxRent)
          if (petFriendly !== 'all') {
            filters.allowsPets = petFriendly === 'yes'
          }

          onSearch(filters)
        }
      )
    } else {
      // Add other filters
      if (minBeds) filters.minBeds = Number(minBeds)
      if (minBaths) filters.minBaths = Number(minBaths)
      if (maxRent) filters.maxRent = Number(maxRent)
      if (petFriendly !== 'all') {
        filters.allowsPets = petFriendly === 'yes'
      }

      onSearch(filters)
    }
  }

  const handleUseMyLocation = async () => {
    try {
      setIsGeolocating(true)
      const coords = await getCurrentLocation()

      // Reverse geocode to get address name
      const geocoder = new google.maps.Geocoder()
      const result = await geocoder.geocode({
        location: { lat: coords.lat, lng: coords.lng },
      })

      if (result.results && result.results.length > 0) {
        const address = result.results[0].formatted_address
        setLocation(address)
      }

      onSearch({
        lat: coords.lat,
        lng: coords.lng,
        radius: Number(radius),
        minBeds: minBeds ? Number(minBeds) : undefined,
        minBaths: minBaths ? Number(minBaths) : undefined,
        maxRent: maxRent ? Number(maxRent) : undefined,
        allowsPets: petFriendly === 'yes' ? true : petFriendly === 'no' ? false : undefined,
      })
    } catch (error) {
      console.error('Error getting location:', error)
      alert('Could not get your location. Please enter a location manually.')
    } finally {
      setIsGeolocating(false)
    }
  }

  const bedsOptions = [
    { value: '', label: 'Any' },
    { value: '0', label: 'Studio' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
  ]

  const bathsOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '1.5', label: '1.5+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
  ]

  const radiusOptions = [
    { value: '5', label: '5 miles' },
    { value: '10', label: '10 miles' },
    { value: '20', label: '20 miles' },
    { value: '50', label: '50 miles' },
    { value: '100', label: '100 miles' },
  ]

  const petOptions = [
    { value: 'all', label: 'Any' },
    { value: 'yes', label: 'Pet Friendly' },
    { value: 'no', label: 'No Pets' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Location Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="flex gap-2">
          <PlacesAutocompleteDropdown
            value={location}
            onChange={setLocation}
            onPlaceSelect={handlePlaceSelect}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleUseMyLocation}
            isLoading={isGeolocating}
            className="whitespace-nowrap"
          >
            Use My Location
          </Button>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Select
          label="Radius"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          options={radiusOptions}
        />

        <Select
          label="Min Beds"
          value={minBeds}
          onChange={(e) => setMinBeds(e.target.value)}
          options={bedsOptions}
        />

        <Select
          label="Min Baths"
          value={minBaths}
          onChange={(e) => setMinBaths(e.target.value)}
          options={bathsOptions}
        />

        <Input
          label="Max Rent"
          type="number"
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
          placeholder="$2,500"
          min="0"
        />

        <Select
          label="Pet Policy"
          value={petFriendly}
          onChange={(e) => setPetFriendly(e.target.value)}
          options={petOptions}
        />
      </div>

      {/* Search Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSearch}
          isLoading={isLoading}
          className="w-full md:w-auto"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
          Search Properties
        </Button>
      </div>
    </div>
  )
}
