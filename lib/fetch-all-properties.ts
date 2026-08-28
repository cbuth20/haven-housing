import { Property, UnifiedSearchFilters } from '@/types/property'
import { getAuthHeaders } from '@/lib/auth-headers'

export type FetchAllFilters = Pick<
  UnifiedSearchFilters,
  'search' | 'status' | 'sortBy' | 'sortDirection'
>

export interface FetchAllOptions {
  /** Rows per request. The search function caps this at 500. */
  pageSize?: number
  /** Safety valve against runaway loops. */
  maxPages?: number
}

export interface FetchAllResult {
  properties: Property[]
  /** Total row count reported by the server for these filters. */
  expectedCount: number
}

/**
 * Pages through /.netlify/functions/properties-search until every row matching
 * the filters has been collected. Rows are de-duplicated by id so an unstable
 * sort across pages cannot produce duplicates.
 */
export async function fetchAllProperties(
  filters: FetchAllFilters,
  options: FetchAllOptions = {}
): Promise<FetchAllResult> {
  const pageSize = options.pageSize ?? 500
  const maxPages = options.maxPages ?? 200

  const headers = await getAuthHeaders()

  const byId = new Map<string, Property>()
  let offset = 0
  let expectedCount = 0

  for (let page = 0; page < maxPages; page++) {
    const response = await fetch('/.netlify/functions/properties-search', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...filters, limit: pageSize, offset }),
    })

    if (!response.ok) {
      throw new Error(`Export failed (HTTP ${response.status})`)
    }

    const { properties, count } = (await response.json()) as {
      properties: Property[]
      count: number
    }

    expectedCount = count ?? expectedCount
    for (const p of properties ?? []) byId.set(p.id, p)

    const received = properties?.length ?? 0
    offset += received
    if (received === 0 || offset >= expectedCount) break
  }

  return { properties: Array.from(byId.values()), expectedCount }
}
