import Papa from 'papaparse'
import { Property } from '@/types/property'
import { extractPlainText } from '@/lib/property-utils'
import { getPropertyUrl } from '@/lib/property-url'

/**
 * Pure property -> spreadsheet-row mapping and CSV building. No DOM access, so
 * this is unit-testable and an .xlsx builder can consume the same rows.
 */

export type ExportColumnKey = keyof Property | 'property_url'

export interface ExportColumn {
  key: ExportColumnKey
  header: string
}

const col = (key: ExportColumnKey, header: string = key): ExportColumn => ({ key, header })

/**
 * Columns in output order. Headers are snake_case field keys, which the
 * bulk-import wizard's autoMapColumns recognises (underscores -> spaces), so
 * an exported file re-imports without manual mapping. Columns the importer
 * does not know (id, status, timestamps, property_url) are simply ignored.
 *
 * Intentionally excluded: cover_photo_url, media_gallery_urls (photos) and
 * salesforce_id, wix_id, owner_id, created_by (internal IDs).
 */
export const EXPORT_COLUMNS: readonly ExportColumn[] = [
  col('id'),
  col('title'),
  col('street_address'),
  col('city'),
  col('state'),
  col('zip_code'),
  col('country'),
  col('latitude'),
  col('longitude'),
  col('description'),
  col('square_footage'),
  col('unit_type'),
  col('beds'),
  col('baths'),
  col('laundry'),
  col('pet_policy'),
  col('parking'),
  col('furnish_level'),
  col('other_amenities'),
  col('landlord_name'),
  col('landlord_email'),
  col('landlord_phone'),
  col('monthly_rent'),
  col('listing_link'),
  col('property_level'),
  col('featured'),
  col('status'),
  col('last_synced_at'),
  col('created_at'),
  col('updated_at'),
  col('property_url'),
]

export type PropertyExportRow = Record<string, string | number>

function formatValue(key: ExportColumnKey, property: Property, origin: string): string | number {
  if (key === 'property_url') return getPropertyUrl(property.id, origin)
  if (key === 'description') return extractPlainText(property.description)

  const value = property[key]
  if (value == null) return ''
  if (Array.isArray(value)) return value.join('; ')
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return value
  return String(value)
}

export function propertyToExportRow(property: Property, origin: string): PropertyExportRow {
  const row: PropertyExportRow = {}
  for (const { key, header } of EXPORT_COLUMNS) {
    row[header] = formatValue(key, property, origin)
  }
  return row
}

export interface BuildCsvOptions {
  /** Prefix a UTF-8 BOM so Excel renders non-ASCII characters. Default true. */
  bom?: boolean
}

export function buildPropertiesCsv(
  properties: Property[],
  origin: string,
  options: BuildCsvOptions = {}
): string {
  const fields = EXPORT_COLUMNS.map((c) => c.header)
  const data = properties.map((p) => {
    const row = propertyToExportRow(p, origin)
    return fields.map((f) => row[f])
  })
  // escapeFormulae guards against =/+/-/@ cells executing when opened in Excel.
  const csv = Papa.unparse({ fields, data }, { escapeFormulae: true })
  return options.bom === false ? csv : `﻿${csv}`
}

/**
 * Builds a native .xlsx workbook (single "Properties" sheet) with sized
 * columns and clickable property_url cells. Returns the file bytes.
 */
export async function buildPropertiesXlsx(properties: Property[], origin: string): Promise<Uint8Array> {
  // SheetJS is large; load it only when an Excel export is requested.
  const XLSX = await import('xlsx')
  const headers = EXPORT_COLUMNS.map((c) => c.header)
  const rows = properties.map((p) => propertyToExportRow(p, origin))
  const aoa: (string | number)[][] = [headers, ...rows.map((r) => headers.map((h) => r[h]))]

  const sheet = XLSX.utils.aoa_to_sheet(aoa)

  // Column widths: fit content, clamped so long descriptions don't blow up.
  sheet['!cols'] = headers.map((h, i) => {
    const longest = aoa.reduce((max, row) => Math.max(max, String(row[i] ?? '').length), h.length)
    return { wch: Math.min(Math.max(longest + 2, 8), 60) }
  })

  // Make property_url cells real hyperlinks.
  const urlCol = headers.indexOf('property_url')
  rows.forEach((r, i) => {
    const addr = XLSX.utils.encode_cell({ r: i + 1, c: urlCol })
    const cell = sheet[addr]
    if (cell && typeof cell.v === 'string' && cell.v) cell.l = { Target: cell.v }
  })

  // Freeze the header row.
  sheet['!freeze'] = { xSplit: 0, ySplit: 1 }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Properties')
  return new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer)
}

export const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
