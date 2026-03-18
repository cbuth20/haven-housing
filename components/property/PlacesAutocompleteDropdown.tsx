'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { loadGoogleMaps } from '@/lib/google-maps'

interface PlacesAutocompleteDropdownProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (place: google.maps.places.AutocompletePrediction) => void
  placeholder?: string
  className?: string
}

export function PlacesAutocompleteDropdown({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search for a City, Neighborhood, street, or point of interest',
  className = '',
}: PlacesAutocompleteDropdownProps) {
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [serviceReady, setServiceReady] = useState(false)

  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize Google Places service
  useEffect(() => {
    const initService = async () => {
      try {
        await loadGoogleMaps()
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
        setServiceReady(true)
      } catch (error) {
        console.error('Error initializing Places service:', error)
      }
    }

    initService()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPredictions = useCallback((input: string) => {
    if (!input || input.length < 2) {
      setPredictions([])
      setShowDropdown(false)
      setIsLoading(false)
      return
    }

    if (!autocompleteServiceRef.current) {
      return
    }

    setIsLoading(true)
    setShowDropdown(true)

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        types: ['geocode'],
        sessionToken: sessionTokenRef.current!,
      },
      (results, status) => {
        setIsLoading(false)

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results)
          setShowDropdown(true)
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([])
          setShowDropdown(false)
        } else {
          console.error('Places API error:', status)
          setPredictions([])
          setShowDropdown(false)
        }
      }
    )
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce API calls by 300ms
    debounceTimerRef.current = setTimeout(() => {
      fetchPredictions(newValue)
    }, 300)
  }

  const handlePredictionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    onChange(prediction.description)
    setShowDropdown(false)
    setPredictions([])
    onPlaceSelect(prediction)

    // Reset session token after selection
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0) setShowDropdown(true)
          }}
          placeholder={placeholder}
          disabled={!serviceReady}
          autoComplete="off"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Location
            </div>

            {isLoading ? (
              <div className="py-4 text-center text-gray-500 text-sm">
                Loading...
              </div>
            ) : predictions.length > 0 ? (
              <div className="space-y-2">
                {predictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    onClick={() => handlePredictionClick(prediction)}
                    className="w-full text-left px-4 py-2 rounded-full border border-gray-300 hover:border-navy hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  >
                    {prediction.description}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-gray-500 text-sm">
                No results found
              </div>
            )}
          </div>

          {/* Info message */}
          <div className="px-3 py-2 bg-blue-50 border-t border-blue-100 rounded-b-lg">
            <div className="flex items-start gap-2">
              <svg
                className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-blue-800">
                Search for a City, Neighborhood, street, or point of interest (regions, countries and continents are not allowed)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
