import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'

interface ValidateRequest {
  properties: Record<string, any>[]
}

interface DuplicateMatch {
  id: string
  title: string
  street_address: string
  city: string
  state: string
  zip_code: string
  status: string
  beds: number | null
  baths: number | null
  monthly_rent: number | null
  listing_link: string | null
}

interface RowValidationResult {
  index: number
  status: 'ready' | 'duplicate' | 'error'
  errors?: string[]
  match?: DuplicateMatch
}

// Normalize address for comparison
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .trim()
    .replace(/\bst\b\.?/g, 'street')
    .replace(/\bdr\b\.?/g, 'drive')
    .replace(/\bave\b\.?/g, 'avenue')
    .replace(/\bct\b\.?/g, 'court')
    .replace(/\bter\b\.?/g, 'terrace')
    .replace(/\bblvd\b\.?/g, 'boulevard')
    .replace(/\bln\b\.?/g, 'lane')
    .replace(/\brd\b\.?/g, 'road')
    .replace(/\bpl\b\.?/g, 'place')
    .replace(/\s+/g, ' ')
}

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { properties }: ValidateRequest = JSON.parse(event.body || '{}')

    if (!Array.isArray(properties) || properties.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Properties array is required' }) }
    }

    // Fetch all existing properties for duplicate checking
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('id, title, street_address, city, state, zip_code, status, beds, baths, monthly_rent, listing_link, wix_id')

    if (fetchError) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Failed to fetch existing properties', error: fetchError.message }) }
    }

    // Build lookup maps for duplicate detection
    const addressMap = new Map<string, DuplicateMatch>()
    const listingLinkMap = new Map<string, DuplicateMatch>()

    for (const prop of existing || []) {
      const normalizedAddr = normalizeAddress(prop.street_address)
      const zip = (prop.zip_code || '').trim().split('-')[0]
      const key = `${normalizedAddr}|${zip}`
      addressMap.set(key, prop)

      if (prop.listing_link) {
        listingLinkMap.set(prop.listing_link.trim().toLowerCase(), prop)
      }
    }

    // Validate each row
    const results: RowValidationResult[] = properties.map((row, index) => {
      const errors: string[] = []
      if (!row.street_address?.trim()) errors.push('Street address is required')
      if (!row.city?.trim()) errors.push('City is required')
      if (!row.state?.trim()) errors.push('State is required')
      if (!row.zip_code?.trim()) errors.push('Zip code is required')

      if (errors.length > 0) {
        return { index, status: 'error' as const, errors }
      }

      const normalizedAddr = normalizeAddress(row.street_address)
      const zip = (row.zip_code || '').trim().split('-')[0]
      const addrKey = `${normalizedAddr}|${zip}`

      const addrMatch = addressMap.get(addrKey)
      if (addrMatch) {
        return { index, status: 'duplicate' as const, match: addrMatch }
      }

      if (row.listing_link) {
        const linkMatch = listingLinkMap.get(row.listing_link.trim().toLowerCase())
        if (linkMatch) {
          return { index, status: 'duplicate' as const, match: linkMatch }
        }
      }

      return { index, status: 'ready' as const }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ results }),
    }
  } catch (error: any) {
    console.error('Bulk validate error:', error)
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) }
  }
})

export { handler }
