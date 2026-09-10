import { describe, it, expect } from 'vitest'
import {
  addressKey,
  buildExistingIndex,
  findRepeatedIds,
  isUuid,
  matchImportRow,
  normalizeAddress,
  rowId,
  type ExistingProperty,
} from './import-match'

const ID_A = '11111111-2222-4333-8444-555555555555'
const ID_B = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'

function existing(overrides: Partial<ExistingProperty> = {}): ExistingProperty {
  return {
    id: ID_A,
    title: '1 Main St',
    street_address: '1 Main St',
    city: 'Wilmington',
    state: 'DE',
    zip_code: '19801',
    status: 'published',
    beds: 2,
    baths: 1,
    monthly_rent: 1500,
    listing_link: 'https://listing.example/a',
    ...overrides,
  }
}

const index = buildExistingIndex([
  existing(),
  existing({ id: ID_B, street_address: '9 Elm Ave', zip_code: '19802', listing_link: null }),
])

describe('isUuid', () => {
  it('accepts canonical UUIDs in either case', () => {
    expect(isUuid(ID_A)).toBe(true)
    expect(isUuid(ID_B.toUpperCase())).toBe(true)
  })

  it('rejects near-misses', () => {
    expect(isUuid('11111111-2222-4333-8444-55555555555')).toBe(false) // one char short
    expect(isUuid('not-a-uuid')).toBe(false)
    expect(isUuid('')).toBe(false)
    expect(isUuid(null)).toBe(false)
    expect(isUuid(42)).toBe(false)
  })
})

describe('normalizeAddress / addressKey', () => {
  it('expands common suffix abbreviations and collapses whitespace', () => {
    expect(normalizeAddress('1  Main St.')).toBe('1 main street')
    expect(normalizeAddress('9 Elm Ave')).toBe('9 elm avenue')
  })

  it('keys on the 5-digit zip only', () => {
    expect(addressKey('1 Main Street', '19801-1234')).toBe(addressKey('1 Main St', '19801'))
  })

  it('tolerates missing values', () => {
    expect(addressKey(null, undefined)).toBe('|')
  })
})

describe('matchImportRow — ID supplied', () => {
  it('matches by ID (case-insensitive) when the address agrees', () => {
    const result = matchImportRow(
      { id: ID_A.toUpperCase(), street_address: '1 Main Street', zip_code: '19801' },
      index
    )
    expect(result).toEqual({ status: 'duplicate', match: index.byId.get(ID_A), matchedBy: 'id', addressMismatch: false })
  })

  it('ID wins over an address that points at a different property', () => {
    // Row carries B's ID but A's address (address is being corrected).
    const result = matchImportRow({ id: ID_B, street_address: '1 Main St', zip_code: '19801' }, index)
    expect(result.status).toBe('duplicate')
    if (result.status !== 'duplicate') return
    expect(result.match.id).toBe(ID_B)
    expect(result.matchedBy).toBe('id')
    expect(result.addressMismatch).toBe(true)
  })

  it('flags addressMismatch when the row address differs from the matched property', () => {
    const result = matchImportRow({ id: ID_A, street_address: '1 Main St', zip_code: '99999' }, index)
    expect(result).toMatchObject({ status: 'duplicate', matchedBy: 'id', addressMismatch: true })
  })

  it('does NOT flag a mismatch for an equivalent address spelling', () => {
    const result = matchImportRow({ id: ID_A, street_address: '1  MAIN STREET', zip_code: '19801-0001' }, index)
    expect(result).toMatchObject({ status: 'duplicate', addressMismatch: false })
  })

  it('errors on an unknown ID instead of falling back to address or create', () => {
    const unknown = '99999999-9999-4999-8999-999999999999'
    // Address matches A, but the unknown ID must not silently fall through.
    const result = matchImportRow({ id: unknown, street_address: '1 Main St', zip_code: '19801' }, index)
    expect(result.status).toBe('error')
    if (result.status !== 'error') return
    expect(result.errors[0]).toContain(unknown)
  })

  it('errors on a malformed ID', () => {
    const result = matchImportRow({ id: 'abc', street_address: '1 Main St', zip_code: '19801' }, index)
    expect(result.status).toBe('error')
    if (result.status !== 'error') return
    expect(result.errors[0]).toMatch(/Invalid property ID/)
  })

  it('treats a whitespace-only ID as blank', () => {
    const result = matchImportRow({ id: '   ', street_address: '1 Main St', zip_code: '19801' }, index)
    expect(result).toMatchObject({ status: 'duplicate', matchedBy: 'address' })
  })
})

describe('repeated IDs within one file', () => {
  it('findRepeatedIds counts case-insensitively and ignores blanks', () => {
    const repeated = findRepeatedIds([
      { id: ID_A }, { id: ID_A.toUpperCase() }, { id: ID_B }, { id: '' }, { id: null }, {},
    ])
    expect(repeated.get(ID_A.toLowerCase())).toBe(2)
    expect(repeated.has(ID_B.toLowerCase())).toBe(false)
  })

  it('matchImportRow errors every row that shares an ID instead of updating the same property twice', () => {
    const rows = [
      { id: ID_A, street_address: '1 Main St', zip_code: '19801' },
      { id: ID_A, street_address: '1 Main St', zip_code: '19801' },
    ]
    const repeated = findRepeatedIds(rows)
    for (const row of rows) {
      const result = matchImportRow(row, index, repeated)
      expect(result.status).toBe('error')
      if (result.status === 'error') expect(result.errors[0]).toMatch(/appears on 2 rows/)
    }
  })

  it('rowId trims and treats blank as null', () => {
    expect(rowId({ id: '  x ' })).toBe('x')
    expect(rowId({ id: '   ' })).toBeNull()
    expect(rowId({})).toBeNull()
  })
})

describe('matchImportRow — no ID', () => {
  it('matches by normalized address + zip', () => {
    const result = matchImportRow({ street_address: '1 Main Street', zip_code: '19801' }, index)
    expect(result).toMatchObject({ status: 'duplicate', matchedBy: 'address', addressMismatch: false })
  })

  it('falls back to listing_link', () => {
    const result = matchImportRow(
      { street_address: '500 New Rd', zip_code: '00000', listing_link: 'HTTPS://listing.example/a' },
      index
    )
    expect(result).toMatchObject({ status: 'duplicate', matchedBy: 'listing_link' })
  })

  it('is ready when nothing matches', () => {
    expect(matchImportRow({ street_address: '500 New Rd', zip_code: '00000' }, index)).toEqual({ status: 'ready' })
  })

  it('accepts null id the same as absent', () => {
    expect(matchImportRow({ id: null, street_address: '500 New Rd', zip_code: '00000' }, index)).toEqual({ status: 'ready' })
  })
})
