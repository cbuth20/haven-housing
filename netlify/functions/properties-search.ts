import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'

interface SearchFilters {
  lat?: number
  lon?: number
  radius?: number
  minBeds?: number
  minBaths?: number
  allowsPets?: boolean
  maxRent?: number
  limit?: number
  offset?: number
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const filters: SearchFilters = JSON.parse(event.body || '{}')

    // If lat/lon provided, use geolocation search
    if (filters.lat && filters.lon) {
      const { data, error } = await supabaseAdmin.rpc('search_properties', {
        search_lat: filters.lat,
        search_lon: filters.lon,
        search_radius: filters.radius || 20,
        min_beds: filters.minBeds || null,
        min_baths: filters.minBaths || null,
        allows_pets: filters.allowsPets || null,
        max_rent: filters.maxRent || null,
        p_limit: filters.limit || 50,
        p_offset: filters.offset || 0,
      })

      if (error) {
        console.error('Search error:', error)
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Search failed', error: error.message }),
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ properties: data, count: data?.length || 0 }),
      }
    }

    // Otherwise, basic filtered search
    let query = supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'published')

    if (filters.minBeds) {
      query = query.gte('beds', filters.minBeds)
    }

    if (filters.minBaths) {
      query = query.gte('baths', filters.minBaths)
    }

    if (filters.maxRent) {
      query = query.lte('monthly_rent', filters.maxRent)
    }

    if (filters.allowsPets) {
      query = query.or('pet_policy.ilike.%allow%,pet_policy.ilike.%yes%')
    }

    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Search error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Search failed', error: error.message }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ properties: data, count }),
    }
  } catch (error: any) {
    console.error('Error searching properties:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}

export { handler }
