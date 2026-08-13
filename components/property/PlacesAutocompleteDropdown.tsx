'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { loadGoogleMaps } from '@/lib/google-maps'

// Normalized suggestion passed to consumers — decoupled from the underlying
// Google Places types (this component uses the Places API (New) Autocomplete
// Data API; the legacy AutocompleteService is unavailable to new customers)
export interface PlaceSuggestion {
  placeId: string
  description: string
}

interface PlacesAutocompleteDropdownProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (place: PlaceSuggestion) => void
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
  const [predictions, setPredictions] = useState<PlaceSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [serviceReady, setServiceReady] = useState(false)

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const requestIdRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize Google Places service
  useEffect(() => {
    const initService = async () => {
      try {
        await loadGoogleMaps()
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

  const fetchPredictions = useCallback(async (input: string) => {
    if (!input || input.length < 2) {
      setPredictions([])
      setShowDropdown(false)
      setIsLoading(false)
      return
    }

    if (!sessionTokenRef.current) {
      return
    }

    setIsLoading(true)
    setShowDropdown(true)

    const requestId = ++requestIdRef.current
    try {
      const { suggestions } =
        await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: sessionTokenRef.current,
        })

      // A newer request has been issued while this one was in flight
      if (requestId !== requestIdRef.current) return

      const results: PlaceSuggestion[] = suggestions
        .map((s) => s.placePrediction)
        .filter((p): p is google.maps.places.PlacePrediction => p != null)
        .map((p) => ({ placeId: p.placeId, description: p.text.text }))

      setIsLoading(false)
      setPredictions(results)
      setShowDropdown(results.length > 0)
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      console.error('Places API error:', error)
      setIsLoading(false)
      setPredictions([])
      setShowDropdown(false)
    }
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

  const handlePredictionClick = (prediction: PlaceSuggestion) => {
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
                    key={prediction.placeId}
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
