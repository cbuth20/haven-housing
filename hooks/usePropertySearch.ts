import { useState } from 'react'
import { Property } from '@/types/property'

interface SearchFilters {
  lat?: number
  lng?: number
  radius?: number
  minBeds?: number
  minBaths?: number
  maxRent?: number
  allowsPets?: boolean
}

export function usePropertySearch() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProperties = async (filters: SearchFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/.netlify/functions/properties-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: filters.lat,
          lon: filters.lng,
          radius: filters.radius || 20,
          minBeds: filters.minBeds,
          minBaths: filters.minBaths,
          maxRent: filters.maxRent,
          allowsPets: filters.allowsPets,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to search properties')
      }

      const data = await response.json()
      setProperties(data.properties || [])
    } catch (err: any) {
      setError(err.message)
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setProperties([])
    setError(null)
  }

  return {
    properties,
    isLoading,
    error,
    searchProperties,
    clearSearch,
  }
}
