/**
 * Matches a bulk-import row to an existing property. Pure functions so the
 * matching rules are unit-testable (see import-match.test.ts).
 *
 * Precedence:
 * 1. `id` — when the row supplies a property ID, it is authoritative. An ID that
 *    is malformed or doesn't exist is an ERROR (never a silent fall-through to a
 *    create, which would produce a duplicate). An ID that resolves to a property
 *    at a different address is flagged `addressMismatch` so the UI can require
 *    an explicit confirmation before updating.
 * 2. street address + zip (normalized) — when the ID cell is blank.
 * 3. listing_link — when neither of the above matched.
 */

export interface ExistingProperty {
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

export type MatchedBy = 'id' | 'address' | 'listing_link'

export type MatchResult =
  | { status: 'ready' }
  | { status: 'error'; errors: string[] }
  | { status: 'duplicate'; match: ExistingProperty; matchedBy: MatchedBy; addressMismatch: boolean }

export interface ExistingIndex {
  byId: Map<string, ExistingProperty>
  byAddress: Map<string, ExistingProperty>
  byLink: Map<string, ExistingProperty>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value.trim())
}

// Normalize address for comparison
export function normalizeAddress(address: string): string {
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

/** Lookup key for address matching: normalized street + 5-digit zip. */
export function addressKey(street: string | null | undefined, zip: string | null | undefined): string {
  const normalizedAddr = normalizeAddress(street || '')
  const zip5 = (zip || '').trim().split('-')[0]
  return `${normalizedAddr}|${zip5}`
}

export function buildExistingIndex(existing: ExistingProperty[]): ExistingIndex {
  const byId = new Map<string, ExistingProperty>()
  const byAddress = new Map<string, ExistingProperty>()
  const byLink = new Map<string, ExistingProperty>()

  for (const prop of existing) {
    byId.set(prop.id.toLowerCase(), prop)
    byAddress.set(addressKey(prop.street_address, prop.zip_code), prop)
    if (prop.listing_link) {
      byLink.set(prop.listing_link.trim().toLowerCase(), prop)
    }
  }

  return { byId, byAddress, byLink }
}

/** The row's ID, trimmed, or null when blank/absent. */
export function rowId(row: Record<string, any>): string | null {
  const raw = row.id
  if (raw === null || raw === undefined) return null
  const id = String(raw).trim()
  return id === '' ? null : id
}

/**
 * IDs that appear on more than one row of the same file (case-insensitive),
 * mapped to their occurrence count. Two rows updating the same property would
 * silently apply in sequence with the last one winning, so these are errors.
 */
export function findRepeatedIds(rows: Record<string, any>[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const id = rowId(row)
    if (!id) continue
    const key = id.toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  for (const [key, n] of counts) if (n < 2) counts.delete(key)
  return counts
}

export function matchImportRow(
  row: Record<string, any>,
  index: ExistingIndex,
  repeatedIds: Map<string, number> = new Map()
): MatchResult {
  const id = rowId(row)

  if (id !== null) {
    if (!isUuid(id)) {
      return { status: 'error', errors: [`Invalid property ID "${id}" — leave the ID blank for new properties`] }
    }
    const repeats = repeatedIds.get(id.toLowerCase())
    if (repeats) {
      return { status: 'error', errors: [`Property ID ${id} appears on ${repeats} rows of this file — each property can only be updated once per import`] }
    }
    const match = index.byId.get(id.toLowerCase())
    if (!match) {
      return { status: 'error', errors: [`No property found with ID ${id}`] }
    }
    const addressMismatch =
      addressKey(row.street_address, row.zip_code) !== addressKey(match.street_address, match.zip_code)
    return { status: 'duplicate', match, matchedBy: 'id', addressMismatch }
  }

  const addrMatch = index.byAddress.get(addressKey(row.street_address, row.zip_code))
  if (addrMatch) {
    return { status: 'duplicate', match: addrMatch, matchedBy: 'address', addressMismatch: false }
  }

  if (row.listing_link) {
    const linkMatch = index.byLink.get(String(row.listing_link).trim().toLowerCase())
    if (linkMatch) {
      return { status: 'duplicate', match: linkMatch, matchedBy: 'listing_link', addressMismatch: false }
    }
  }

  return { status: 'ready' }
}
