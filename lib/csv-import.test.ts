import { describe, it, expect } from 'vitest'
import {
  autoMapColumns,
  getPropertyFields,
  normalizeValue,
  transformRow,
  validateRow,
  COLUMN_ALIASES,
  TRANSIENT_FIELDS,
} from './csv-import'

// ---------------------------------------------------------------------------
// autoMapColumns
// ---------------------------------------------------------------------------
describe('autoMapColumns', () => {
  it('maps exact alias matches (case-insensitive)', () => {
    const mapping = autoMapColumns(['Title', 'CITY', 'Rent'])
    expect(mapping['Title']).toBe('title')
    expect(mapping['CITY']).toBe('city')
    expect(mapping['Rent']).toBe('monthly_rent')
  })

  it('maps trimmed headers (strips surrounding whitespace)', () => {
    const mapping = autoMapColumns(['  title  ', ' Address '])
    expect(mapping['  title  ']).toBe('title')
    expect(mapping[' Address ']).toBe('street_address')
  })

  it('maps snake_case field keys (export round-trip)', () => {
    const mapping = autoMapColumns(['street_address', 'monthly_rent', 'other_amenities', 'Zip_Code'])
    expect(mapping['street_address']).toBe('street_address')
    expect(mapping['monthly_rent']).toBe('monthly_rent')
    expect(mapping['other_amenities']).toBe('other_amenities')
    expect(mapping['Zip_Code']).toBe('zip_code')
  })

  it('leaves unknown headers unmapped', () => {
    const mapping = autoMapColumns(['Unknown Column', 'Foobar'])
    expect(mapping['Unknown Column']).toBeUndefined()
    expect(mapping['Foobar']).toBeUndefined()
  })

  it('handles Wix CSV header names', () => {
    const wixHeaders = [
      'Landlord',
      'Landlord Phone Number',
      'Other Ammenities', // intentional Wix typo
      'Property Address',
      'Property Name',
      'Listing URL',
      'Cover Photo URL',
      'Sq Ft',
    ]
    const mapping = autoMapColumns(wixHeaders)
    expect(mapping['Landlord']).toBe('landlord_name')
    expect(mapping['Landlord Phone Number']).toBe('landlord_phone')
    expect(mapping['Other Ammenities']).toBe('other_amenities')
    expect(mapping['Property Address']).toBe('street_address')
    expect(mapping['Property Name']).toBe('title')
    expect(mapping['Listing URL']).toBe('listing_link')
    expect(mapping['Cover Photo URL']).toBe('cover_photo_url')
    expect(mapping['Sq Ft']).toBe('square_footage')
  })

  it('handles actual client spreadsheet headers', () => {
    const clientHeaders = [
      'Add  ', 'Address 2', 'City', 'State', 'Zip',
      'Unit Type Final', 'Laundry', 'Pet Policy', 'Parking',
      'Beds', 'Baths', 'Furnish Level', 'Description',
      'Other Ammenities', 'Listing Link', "Photo's Link",
    ]
    const mapping = autoMapColumns(clientHeaders)
    expect(mapping['Add  ']).toBe('street_address')
    expect(mapping['City']).toBe('city')
    expect(mapping['State']).toBe('state')
    expect(mapping['Zip']).toBe('zip_code')
    expect(mapping['Unit Type Final']).toBe('unit_type')
    expect(mapping['Laundry']).toBe('laundry')
    expect(mapping['Pet Policy']).toBe('pet_policy')
    expect(mapping['Parking']).toBe('parking')
    expect(mapping['Beds']).toBe('beds')
    expect(mapping['Baths']).toBe('baths')
    expect(mapping['Furnish Level']).toBe('furnish_level')
    expect(mapping['Description']).toBe('description')
    expect(mapping['Other Ammenities']).toBe('other_amenities')
    expect(mapping['Listing Link']).toBe('listing_link')
    expect(mapping["Photo's Link"]).toBe('cover_photo_url')
    // Address 2 has no matching field — should be unmapped
    expect(mapping['Address 2']).toBeUndefined()
  })

  it('maps all known aliases from COLUMN_ALIASES', () => {
    // Every alias in the dictionary should resolve to its field
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      for (const alias of aliases) {
        const mapping = autoMapColumns([alias])
        expect(mapping[alias]).toBe(field)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// getPropertyFields
// ---------------------------------------------------------------------------
describe('getPropertyFields', () => {
  it('returns an array of { value, label } objects', () => {
    const fields = getPropertyFields()
    expect(Array.isArray(fields)).toBe(true)
    for (const f of fields) {
      expect(f).toHaveProperty('value')
      expect(f).toHaveProperty('label')
      expect(typeof f.value).toBe('string')
      expect(typeof f.label).toBe('string')
    }
  })

  it('includes all field keys from COLUMN_ALIASES', () => {
    const fields = getPropertyFields()
    const values = fields.map((f) => f.value)
    for (const field of Object.keys(COLUMN_ALIASES)) {
      expect(values).toContain(field)
    }
  })
})

// ---------------------------------------------------------------------------
// normalizeValue
// ---------------------------------------------------------------------------
describe('normalizeValue', () => {
  // empty / null handling
  it('returns null for empty strings on most fields', () => {
    expect(normalizeValue('', 'title')).toBeNull()
    expect(normalizeValue('   ', 'city')).toBeNull()
    expect(normalizeValue('', 'beds')).toBeNull()
  })

  it('returns false (not null) for empty featured', () => {
    expect(normalizeValue('', 'featured')).toBe(false)
    expect(normalizeValue('   ', 'featured')).toBe(false)
  })

  // array-wrapper unwrapping (Wix format)
  it('strips array wrappers from single values', () => {
    expect(normalizeValue('["Single Family"]', 'unit_type')).toBe('Single Family')
    expect(normalizeValue('["Downtown"]', 'city')).toBe('Downtown')
    expect(normalizeValue('[ "Ranch" ]', 'unit_type')).toBe('Ranch')
  })

  // square_footage
  it('parses square footage with "SF" unit suffix', () => {
    expect(normalizeValue('888 SF', 'square_footage')).toBe(888)
  })

  it('parses square footage with "sq ft" unit suffix', () => {
    expect(normalizeValue('1,590 sq ft', 'square_footage')).toBe(1590)
  })

  it('parses square footage with "sqft" unit suffix', () => {
    expect(normalizeValue('900sqft', 'square_footage')).toBe(900)
  })

  it('parses square footage with "square feet" unit suffix', () => {
    expect(normalizeValue('1200 square feet', 'square_footage')).toBe(1200)
  })

  it('parses bare square footage number', () => {
    expect(normalizeValue('1200', 'square_footage')).toBe(1200)
  })

  it('parses square footage with comma-thousands separator', () => {
    expect(normalizeValue('1,200', 'square_footage')).toBe(1200)
  })

  // numeric fields
  it('parses beds to number', () => {
    expect(normalizeValue('3', 'beds')).toBe(3)
    expect(normalizeValue('2.5', 'baths')).toBe(2.5)
  })

  it('parses monthly_rent to number', () => {
    expect(normalizeValue('1500', 'monthly_rent')).toBe(1500)
    expect(normalizeValue('2,000', 'monthly_rent')).toBe(2000)
  })

  it('parses latitude and longitude to numbers', () => {
    expect(normalizeValue('37.7749', 'latitude')).toBe(37.7749)
    expect(normalizeValue('-122.4194', 'longitude')).toBe(-122.4194)
  })

  // featured boolean
  it('parses "true" as true for featured', () => {
    expect(normalizeValue('true', 'featured')).toBe(true)
    expect(normalizeValue('TRUE', 'featured')).toBe(true)
  })

  it('parses "false" as false for featured', () => {
    expect(normalizeValue('false', 'featured')).toBe(false)
    expect(normalizeValue('FALSE', 'featured')).toBe(false)
  })

  it('parses "yes"/"no" for featured', () => {
    expect(normalizeValue('yes', 'featured')).toBe(true)
    expect(normalizeValue('no', 'featured')).toBe(false)
  })

  it('parses "1"/"0" for featured', () => {
    expect(normalizeValue('1', 'featured')).toBe(true)
    expect(normalizeValue('0', 'featured')).toBe(false)
  })

  // other_amenities
  it('splits comma-separated amenities into an array', () => {
    const result = normalizeValue('Washer/Dryer, Dishwasher, AC', 'other_amenities')
    expect(result).toEqual(['Washer/Dryer', 'Dishwasher', 'AC'])
  })

  it('parses JSON array amenities', () => {
    const result = normalizeValue('["Pool","Gym","Parking"]', 'other_amenities')
    expect(result).toEqual(['Pool', 'Gym', 'Parking'])
  })

  it('returns array with one item for single amenity', () => {
    const result = normalizeValue('Pool', 'other_amenities')
    expect(result).toEqual(['Pool'])
  })

  // email
  it('trims and accepts valid landlord_email', () => {
    expect(normalizeValue('  user@example.com  ', 'landlord_email')).toBe('user@example.com')
  })

  it('returns null for invalid landlord_email without @', () => {
    expect(normalizeValue('notanemail', 'landlord_email')).toBeNull()
  })

  it('returns null for empty landlord_email', () => {
    expect(normalizeValue('', 'landlord_email')).toBeNull()
  })

  // URLs
  it('accepts valid https listing_link', () => {
    expect(normalizeValue('https://example.com/listing/123', 'listing_link')).toBe(
      'https://example.com/listing/123'
    )
  })

  it('accepts valid http cover_photo_url', () => {
    expect(normalizeValue('http://cdn.example.com/photo.jpg', 'cover_photo_url')).toBe(
      'http://cdn.example.com/photo.jpg'
    )
  })

  it('returns null for non-URL listing_link', () => {
    expect(normalizeValue('not-a-url', 'listing_link')).toBeNull()
    expect(normalizeValue('ftp://bad.com', 'listing_link')).toBeNull()
  })

  it('returns null for non-URL cover_photo_url', () => {
    expect(normalizeValue('photo.jpg', 'cover_photo_url')).toBeNull()
  })

  // plain strings
  it('returns trimmed string for title, city, state, etc.', () => {
    expect(normalizeValue('  Seattle  ', 'city')).toBe('Seattle')
    expect(normalizeValue(' WA ', 'state')).toBe('WA')
  })
})

// ---------------------------------------------------------------------------
// transformRow
// ---------------------------------------------------------------------------
describe('transformRow', () => {
  it('transforms using column mapping and normalizes values', () => {
    const mapping = { 'Property Name': 'title', City: 'city', Beds: 'beds' }
    const row = { 'Property Name': 'Cozy Studio', City: 'Portland', Beds: '2' }
    const result = transformRow(row, mapping)
    expect(result.title).toBe('Cozy Studio')
    expect(result.city).toBe('Portland')
    expect(result.beds).toBe(2)
  })

  it('sets default status to "draft"', () => {
    const result = transformRow({}, {})
    expect(result.status).toBe('draft')
  })

  it('sets default featured to false', () => {
    const result = transformRow({}, {})
    expect(result.featured).toBe(false)
  })

  it('auto-generates title from address when not mapped', () => {
    const mapping = {
      Address: 'street_address',
      City: 'city',
      State: 'state',
    }
    const row = { Address: '123 Main St', City: 'Seattle', State: 'WA' }
    const result = transformRow(row, mapping)
    expect(result.title).toBeTruthy()
    expect(result.title).toContain('123 Main St')
  })

  it('preserves mapped title over auto-generated title', () => {
    const mapping = { Name: 'title', Address: 'street_address' }
    const row = { Name: 'My Property', Address: '456 Oak Ave' }
    const result = transformRow(row, mapping)
    expect(result.title).toBe('My Property')
  })

  it('normalizes square_footage via mapping', () => {
    const mapping = { 'Sq Ft': 'square_footage' }
    const row = { 'Sq Ft': '1,200 SF' }
    const result = transformRow(row, mapping)
    expect(result.square_footage).toBe(1200)
  })
})

// ---------------------------------------------------------------------------
// photo_folder (ZIP matching key)
// ---------------------------------------------------------------------------
describe('photo_folder', () => {
  it('auto-maps photo folder headers', () => {
    expect(autoMapColumns(['Photo Folder'])['Photo Folder']).toBe('photo_folder')
    expect(autoMapColumns(['Image Folder'])['Image Folder']).toBe('photo_folder')
  })

  it('normalizes to a trimmed string (not URL-validated like cover_photo_url)', () => {
    expect(normalizeValue('  123 Main St  ', 'photo_folder')).toBe('123 Main St')
    // unlike cover_photo_url, a non-URL value is kept (it is a folder name)
    expect(normalizeValue('123 Main St', 'photo_folder')).toBe('123 Main St')
  })

  it('is a transient field that must never be persisted', () => {
    expect(TRANSIENT_FIELDS.has('photo_folder')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateRow
// ---------------------------------------------------------------------------
describe('validateRow', () => {
  it('returns valid: true for a complete required-fields row', () => {
    const row = {
      street_address: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zip_code: '98101',
    }
    const result = validateRow(row)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns errors for all missing required fields', () => {
    const result = validateRow({})
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(4)
  })

  it('returns error for missing street_address', () => {
    const row = { city: 'Seattle', state: 'WA', zip_code: '98101' }
    const result = validateRow(row)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('address') || e.toLowerCase().includes('street'))).toBe(true)
  })

  it('returns error for missing city', () => {
    const row = { street_address: '123 Main St', state: 'WA', zip_code: '98101' }
    const result = validateRow(row)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('city'))).toBe(true)
  })

  it('returns error for missing state', () => {
    const row = { street_address: '123 Main St', city: 'Seattle', zip_code: '98101' }
    const result = validateRow(row)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('state'))).toBe(true)
  })

  it('returns error for missing zip_code', () => {
    const row = { street_address: '123 Main St', city: 'Seattle', state: 'WA' }
    const result = validateRow(row)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('zip'))).toBe(true)
  })

  it('treats null values as missing', () => {
    const row = { street_address: '123 Main St', city: null, state: 'WA', zip_code: '98101' }
    const result = validateRow(row)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('city'))).toBe(true)
  })
})
