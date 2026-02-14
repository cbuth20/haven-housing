import { optionalAuth, OptionalAuthEvent } from './utils/auth-middleware'
import { supabaseAdmin } from './utils/supabase-client'

const SORT_ALLOWLIST = [
  'title', 'city', 'state', 'beds', 'baths', 'monthly_rent',
  'square_footage', 'status', 'created_at', 'updated_at', 'unit_type', 'featured',
]

const handler = optionalAuth(async (event: OptionalAuthEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')

    const lat = body.lat != null ? Number(body.lat) : undefined
    const lon = body.lon != null ? Number(body.lon) : undefined
    const radius = Number(body.radius) || 20
    const minBeds = body.minBeds != null ? Number(body.minBeds) : null
    const minBaths = body.minBaths != null ? Number(body.minBaths) : null
    const maxRent = body.maxRent != null ? Number(body.maxRent) : null
    const allowsPets = body.allowsPets != null ? Boolean(body.allowsPets) : null
    const search = body.search || null
    const sortBy = SORT_ALLOWLIST.includes(body.sortBy) ? body.sortBy : null
    const sortDirection: 'asc' | 'desc' = body.sortDirection === 'asc' ? 'asc' : 'desc'
    const limit = Math.min(Number(body.limit) || 200, 500)
    const offset = Number(body.offset) || 0

    // Status logic: admins can filter by any status or 'all'; public always gets 'published'
    let filterStatus: string | null = 'published'
    if (event.userRole === 'admin') {
      if (body.status === 'all') {
        filterStatus = null // no status filter
      } else if (['published', 'draft', 'archived'].includes(body.status)) {
        filterStatus = body.status
      }
    }

    // Geo path: lat + lon provided
    if (lat != null && lon != null) {
      const { data, error } = await supabaseAdmin.rpc('search_properties_v2', {
        search_lat: lat,
        search_lon: lon,
        search_radius: radius,
        min_beds: minBeds,
        min_baths: minBaths,
        allows_pets: allowsPets,
        max_rent: maxRent,
        filter_status: filterStatus,
        search_text: search,
        p_limit: limit,
        p_offset: offset,
      })

      if (error) {
        console.error('Search RPC error:', error)
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Search failed', error: error.message }),
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ properties: data || [], count: data?.length || 0 }),
      }
    }

    // Non-geo path: query builder
    let query = supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact' })

    // Status filter
    if (filterStatus) {
      query = query.eq('status', filterStatus)
    }

    // Text search
    if (search) {
      const term = `%${search}%`
      query = query.or(
        `title.ilike.${term},city.ilike.${term},state.ilike.${term},street_address.ilike.${term},zip_code.ilike.${term}`
      )
    }

    // Attribute filters
    if (minBeds != null) {
      query = query.gte('beds', minBeds)
    }
    if (minBaths != null) {
      query = query.gte('baths', minBaths)
    }
    if (maxRent != null) {
      query = query.lte('monthly_rent', maxRent)
    }
    if (allowsPets === true) {
      query = query.or('pet_policy.ilike.%allow%,pet_policy.ilike.%yes%')
    }

    // Sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDirection === 'asc' })
    } else {
      query = query
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Search query error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Search failed', error: error.message }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ properties: data || [], count: count ?? data?.length ?? 0 }),
    }
  } catch (error: any) {
    console.error('Error searching properties:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
