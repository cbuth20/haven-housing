import { describe, it, expect } from 'vitest'
import { EXPORT_COLUMNS, propertyToExportRow, buildPropertiesCsv, buildPropertiesXlsx } from './property-export'
import { Property } from '@/types/property'

const ORIGIN = 'https://x.test'

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 'abc-123',
    title: 'Cozy Loft',
    street_address: '1 Main St',
    city: 'Wilmington',
    state: 'DE',
    zip_code: '19801',
    country: 'USA',
    latitude: 39.7,
    longitude: -75.5,
    description: 'Nice place',
    square_footage: 900,
    unit_type: 'Apartment',
    beds: 2,
    baths: 1.5,
    laundry: 'In unit',
    pet_policy: 'Cats allowed',
    parking: 'Street',
    furnish_level: 'Furnished',
    other_amenities: ['Gym', 'Pool'],
    landlord_name: 'Pat',
    landlord_email: 'pat@example.com',
    landlord_phone: '555-0100',
    monthly_rent: 1800,
    cover_photo_url: 'https://img/cover.jpg',
    media_gallery_urls: ['https://img/1.jpg'],
    listing_link: 'https://listing.example',
    property_level: 'Standard',
    featured: true,
    status: 'published',
    salesforce_id: 'sf1',
    last_synced_at: null,
    wix_id: 'wix1',
    owner_id: 'owner1',
    created_by: 'user1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
    ...overrides,
  }
}

describe('EXPORT_COLUMNS', () => {
  const keys = EXPORT_COLUMNS.map((c) => c.key)

  it('excludes photo and internal-id columns', () => {
    for (const k of ['cover_photo_url', 'media_gallery_urls', 'salesforce_id', 'wix_id', 'owner_id', 'created_by', 'distance']) {
      expect(keys).not.toContain(k)
    }
  })

  it('has unique keys and ends with property_url', () => {
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys[keys.length - 1]).toBe('property_url')
  })
})

describe('propertyToExportRow', () => {
  it('builds the public URL from origin + id', () => {
    const row = propertyToExportRow(makeProperty(), ORIGIN)
    expect(row.property_url).toBe('https://x.test/properties/abc-123')
  })

  it('joins amenities with "; " and blanks a null array', () => {
    expect(propertyToExportRow(makeProperty(), ORIGIN).other_amenities).toBe('Gym; Pool')
    expect(propertyToExportRow(makeProperty({ other_amenities: null }), ORIGIN).other_amenities).toBe('')
  })

  it('blanks null scalars and stringifies booleans', () => {
    const row = propertyToExportRow(makeProperty({ beds: null, featured: false }), ORIGIN)
    expect(row.beds).toBe('')
    expect(row.featured).toBe('false')
    expect(row.monthly_rent).toBe(1800)
  })

  it('unwraps Wix JSON-formatted descriptions', () => {
    expect(propertyToExportRow(makeProperty(), ORIGIN).description).toBe('Nice place')
    expect(
      propertyToExportRow(makeProperty({ description: '{"formatted":"Wix text"}' }), ORIGIN).description
    ).toBe('Wix text')
  })

  it('does not include excluded columns', () => {
    const row = propertyToExportRow(makeProperty(), ORIGIN)
    expect(row).not.toHaveProperty('cover_photo_url')
    expect(row).not.toHaveProperty('salesforce_id')
  })
})

describe('buildPropertiesCsv', () => {
  const headerLine = EXPORT_COLUMNS.map((c) => c.header).join(',')

  it('prefixes a BOM by default and omits it when disabled', () => {
    expect(buildPropertiesCsv([], ORIGIN).startsWith('﻿')).toBe(true)
    expect(buildPropertiesCsv([], ORIGIN, { bom: false }).startsWith('﻿')).toBe(false)
  })

  it('emits a header row only for empty input', () => {
    expect(buildPropertiesCsv([], ORIGIN, { bom: false }).trim()).toBe(headerLine)
  })

  it('emits one line per property plus header', () => {
    const csv = buildPropertiesCsv([makeProperty(), makeProperty({ id: 'b' })], ORIGIN, { bom: false })
    const lines = csv.split(/\r?\n/)
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe(headerLine)
    expect(lines[2]).toContain('https://x.test/properties/b')
  })

  it('neutralises formula-injection prefixes', () => {
    const csv = buildPropertiesCsv([makeProperty({ title: '=HYPERLINK("http://evil","x")' })], ORIGIN, { bom: false })
    expect(csv).not.toContain('\n=HYPERLINK')
    expect(csv).toContain("'=HYPERLINK")
  })

  it('quotes and escapes commas, quotes, and newlines', () => {
    const csv = buildPropertiesCsv([makeProperty({ title: 'a, "b"\nc' })], ORIGIN, { bom: false })
    expect(csv).toContain('"a, ""b""\nc"')
  })
})

describe('buildPropertiesXlsx', () => {
  it('produces a workbook with headers, rows, and hyperlinked URLs', async () => {
    const XLSX = await import('xlsx')
    const bytes = await buildPropertiesXlsx([makeProperty(), makeProperty({ id: 'b', title: 'Second' })], ORIGIN)
    expect(bytes.length).toBeGreaterThan(0)

    const wb = XLSX.read(bytes, { type: 'array' })
    expect(wb.SheetNames).toEqual(['Properties'])
    const sheet = wb.Sheets['Properties']
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
    expect(rows).toHaveLength(2)
    expect(rows[1].title).toBe('Second')
    expect(rows[1].property_url).toBe('https://x.test/properties/b')
    expect(Object.keys(rows[0])).toEqual(EXPORT_COLUMNS.map((c) => c.header))

    const urlCol = EXPORT_COLUMNS.findIndex((c) => c.key === 'property_url')
    const cell = sheet[XLSX.utils.encode_cell({ r: 1, c: urlCol })]
    expect(cell.l?.Target).toBe('https://x.test/properties/abc-123')
  })
})
