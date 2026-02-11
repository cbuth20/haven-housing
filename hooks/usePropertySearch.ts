import { useState } from 'react'
import { Property, UnifiedSearchFilters } from '@/types/property'
import { supabase } from '@/lib/supabase'

interface SearchFilters extends UnifiedSearchFilters {
  /** @deprecated Use `lon` instead. Kept for backward compatibility. */
  lng?: number
}

interface UsePropertySearchOptions {
  includeAuth?: boolean
}

export function usePropertySearch(options: UsePropertySearchOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProperties = async (filters: SearchFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (options.includeAuth) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
      }

      // Support both lng (legacy) and lon keys
      const lon = filters.lon ?? filters.lng

      const response = await fetch('/.netlify/functions/properties-search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          lat: filters.lat,
          lon,
          radius: filters.radius || 20,
          minBeds: filters.minBeds,
          minBaths: filters.minBaths,
          maxRent: filters.maxRent,
          allowsPets: filters.allowsPets,
          search: filters.search,
          status: filters.status,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
          limit: filters.limit,
          offset: filters.offset,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to search properties')
      }

      const data = await response.json()
      setProperties(data.properties || [])
      setTotalCount(data.count ?? data.properties?.length ?? 0)
    } catch (err: any) {
      setError(err.message)
      setProperties([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setProperties([])
    setTotalCount(0)
    setError(null)
  }

  return {
    properties,
    totalCount,
    isLoading,
    error,
    searchProperties,
    clearSearch,
  }
}
