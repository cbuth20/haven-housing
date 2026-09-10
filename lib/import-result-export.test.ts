import { describe, it, expect } from 'vitest'
import Papa from 'papaparse'
import {
  buildImportResultCsv,
  buildImportResultXlsx,
  importResultHeaders,
  importResultRows,
  pickImportedData,
  type ImportedRow,
} from './import-result-export'
import { autoMapColumns } from './csv-import'

const ORIGIN = 'https://x.test'

const rows: ImportedRow[] = [
  {
    id: 'aaaaaaaa-0000-4000-8000-000000000001',
    action: 'created',
    data: { title: 'Loft', street_address: '1 Main St', city: 'Wilmington', state: 'DE', zip_code: '19801', beds: 2, other_amenities: ['Gym', 'Pool'], featured: false },
  },
  {
    id: 'aaaaaaaa-0000-4000-8000-000000000002',
    action: 'updated',
    data: { street_address: '9 Elm Ave', city: 'Dover', state: 'DE', zip_code: '19901', monthly_rent: 1200 },
  },
]

describe('importResultHeaders', () => {
  it('starts with id and import_action, ends with property_url', () => {
    const h = importResultHeaders(rows)
    expect(h.slice(0, 2)).toEqual(['id', 'import_action'])
    expect(h[h.length - 1]).toBe('property_url')
  })

  it('includes only columns some row supplied, in export order', () => {
    const h = importResultHeaders(rows)
    expect(h).toEqual([
      'id', 'import_action',
      'title', 'street_address', 'city', 'state', 'zip_code', 'beds', 'other_amenities', 'monthly_rent',
      'featured',
      'property_url',
    ])
    expect(h).not.toContain('description')
  })

  it('never emits transient or internal keys even if present in data', () => {
    const h = importResultHeaders([{ id: 'x', action: 'created', data: { photo_folder: 'f', wix_id: 'w', street_address: 'a' } }])
    expect(h).toEqual(['id', 'import_action', 'street_address', 'property_url'])
  })

  it('round-trips through the importer auto-mapper', () => {
    const mapping = autoMapColumns(importResultHeaders(rows))
    expect(mapping['id']).toBe('id')
    expect(mapping['street_address']).toBe('street_address')
    expect(mapping['import_action']).toBeUndefined() // ignored, not a property field
    expect(mapping['property_url']).toBeUndefined()
  })
})

describe('pickImportedData', () => {
  const transformed = {
    status: 'draft', featured: false, title: '1 Main St, Dover, DE', // seeded / synthesized by transformRow
    street_address: '1 Main St', city: 'Dover', state: 'DE', zip_code: '19901', monthly_rent: 900,
    cover_photo_url: 'https://cdn/x.jpg', media_gallery_urls: ['https://cdn/x.jpg'],
  }

  it('keeps only fields the user mapped, plus the hosted cover photo', () => {
    expect(pickImportedData(transformed, ['street_address', 'city', 'state', 'zip_code', 'monthly_rent'])).toEqual({
      street_address: '1 Main St', city: 'Dover', state: 'DE', zip_code: '19901', monthly_rent: 900,
      cover_photo_url: 'https://cdn/x.jpg',
    })
  })

  it('drops seeded status/featured and a synthesized title so an updated row does not claim values it never wrote', () => {
    const picked = pickImportedData(transformed, ['street_address', 'zip_code'])
    expect(picked).not.toHaveProperty('status')
    expect(picked).not.toHaveProperty('featured')
    expect(picked).not.toHaveProperty('title')
  })

  it('keeps status/featured/title when the user actually mapped them', () => {
    const picked = pickImportedData(transformed, ['title', 'featured', 'street_address'])
    expect(picked).toMatchObject({ title: '1 Main St, Dover, DE', featured: false })
  })
})

describe('importResultRows', () => {
  it('fills id, action, url and formats values; blanks unsupplied cells', () => {
    const [created, updated] = importResultRows(rows, ORIGIN)
    const h = importResultHeaders(rows)
    const get = (r: (string | number)[], key: string) => r[h.indexOf(key)]

    expect(get(created, 'id')).toBe(rows[0].id)
    expect(get(created, 'import_action')).toBe('created')
    expect(get(created, 'other_amenities')).toBe('Gym; Pool')
    expect(get(created, 'beds')).toBe(2)
    expect(get(created, 'featured')).toBe('false')
    expect(get(created, 'monthly_rent')).toBe('')
    expect(get(created, 'property_url')).toBe(`${ORIGIN}/properties/${rows[0].id}`)

    expect(get(updated, 'import_action')).toBe('updated')
    expect(get(updated, 'title')).toBe('')
    expect(get(updated, 'monthly_rent')).toBe(1200)
  })
})

describe('buildImportResultCsv', () => {
  it('produces a BOM-prefixed CSV that parses back to the same rows', () => {
    const csv = buildImportResultCsv(rows, ORIGIN)
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    const parsed = Papa.parse<Record<string, string>>(csv.slice(1), { header: true })
    expect(parsed.data).toHaveLength(2)
    expect(parsed.data[0].id).toBe(rows[0].id)
    expect(parsed.data[1].monthly_rent).toBe('1200')
  })

  it('escapes formula-looking cells', () => {
    const csv = buildImportResultCsv([{ id: 'x', action: 'created', data: { title: '=HYPERLINK("evil")' } }], ORIGIN)
    expect(csv).toContain(`"'=HYPERLINK(""evil"")"`)
  })
})

describe('buildImportResultXlsx', () => {
  it('builds a workbook with a hyperlinked property_url column', async () => {
    const bytes = await buildImportResultXlsx(rows, ORIGIN)
    const XLSX = await import('xlsx')
    const wb = XLSX.read(bytes, { type: 'array' })
    const sheet = wb.Sheets['Imported']
    const h = importResultHeaders(rows)
    const urlAddr = XLSX.utils.encode_cell({ r: 1, c: h.indexOf('property_url') })
    expect(sheet[urlAddr].v).toBe(`${ORIGIN}/properties/${rows[0].id}`)
    expect(sheet[urlAddr].l?.Target).toBe(`${ORIGIN}/properties/${rows[0].id}`)
    expect(sheet['A1'].v).toBe('id')
    expect(sheet['A2'].v).toBe(rows[0].id)
  })
})
