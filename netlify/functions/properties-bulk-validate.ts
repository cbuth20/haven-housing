import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import {
  buildExistingIndex,
  findRepeatedIds,
  matchImportRow,
  rowId,
  type ExistingProperty,
  type MatchedBy,
} from './utils/import-match'

interface ValidateRequest {
  properties: Record<string, any>[]
}

interface RowValidationResult {
  index: number
  status: 'ready' | 'duplicate' | 'error'
  errors?: string[]
  match?: ExistingProperty
  /** How the existing property was found. Present when status === 'duplicate'. */
  matchedBy?: MatchedBy
  /**
   * True when the row's ID resolved to a property whose address differs from
   * the row's address. The UI must require explicit confirmation before
   * updating such a row (a pasted ID from the wrong line would otherwise
   * overwrite an unrelated listing).
   */
  addressMismatch?: boolean
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

    // Fetch ALL existing properties for duplicate checking. PostgREST caps a
    // single select at 1000 rows, so page explicitly — a truncated index would
    // reject valid IDs as "not found" once the table grows past the cap.
    const existing = await fetchAllExisting()
    if ('error' in existing) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Failed to fetch existing properties', error: existing.error }) }
    }

    const index = buildExistingIndex(existing.rows)
    const repeatedIds = findRepeatedIds(properties)

    // Validate each row
    const results: RowValidationResult[] = properties.map((row, i) => {
      const errors: string[] = []
      if (!row.street_address?.trim()) errors.push('Street address is required')
      if (!row.city?.trim()) errors.push('City is required')
      if (!row.state?.trim()) errors.push('State is required')
      if (!row.zip_code?.trim()) errors.push('Zip code is required')

      if (errors.length > 0) {
        return { index: i, status: 'error' as const, errors }
      }

      const result = matchImportRow(row, index, repeatedIds)
      switch (result.status) {
        case 'ready':
          return { index: i, status: 'ready' as const }
        case 'error':
          return { index: i, status: 'error' as const, errors: result.errors }
        case 'duplicate':
          return {
            index: i,
            status: 'duplicate' as const,
            match: result.match,
            matchedBy: result.matchedBy,
            addressMismatch: result.addressMismatch,
          }
      }
    })

    // If the file carries IDs and none of them resolve, the ID column is almost
    // certainly mis-mapped (e.g. a legacy Wix "ID" column of foreign UUIDs).
    // Tell the UI so it can point the user back to the mapping step.
    const idRows = properties.filter((row) => rowId(row) !== null).length
    const idMatches = results.filter((r) => r.status === 'duplicate' && r.matchedBy === 'id').length
    const noIdsMatched = idRows > 0 && idMatches === 0

    return {
      statusCode: 200,
      body: JSON.stringify({ results, idRows, idMatches, noIdsMatched }),
    }
  } catch (error: any) {
    console.error('Bulk validate error:', error)
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) }
  }
})

const PAGE_SIZE = 1000
const SELECT_COLUMNS = 'id, title, street_address, city, state, zip_code, status, beds, baths, monthly_rent, listing_link'

async function fetchAllExisting(): Promise<{ rows: ExistingProperty[] } | { error: string }> {
  const rows: ExistingProperty[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin
      .from('properties')
      .select(SELECT_COLUMNS)
      .order('id')
      .range(from, from + PAGE_SIZE - 1)
    if (error) return { error: error.message }
    const page = (data || []) as ExistingProperty[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) return { rows }
  }
}

export { handler }
