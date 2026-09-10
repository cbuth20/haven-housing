import Papa from 'papaparse'
import { EXPORT_COLUMNS } from '@/lib/property-export'
import { getPropertyUrl } from '@/lib/property-url'

/**
 * Builds the "rows you just imported, with their IDs" file offered on the
 * import completion screen. The point is reconciliation: the user pastes the
 * `id` column back into their master sheet so later imports match by ID.
 *
 * Column layout mirrors the property export (same snake_case headers, same
 * order) so the file re-imports without manual mapping, but only columns the
 * import actually supplied are included — an "updated" row only carried the
 * fields being changed, and inventing blanks for the rest would be misleading.
 */

export interface ImportedRow {
  id: string
  action: 'created' | 'updated'
  /** The transformed row data as sent to the server (transient fields stripped). */
  data: Record<string, any>
}

export const IMPORT_RESULT_FIXED_HEADERS = ['id', 'import_action'] as const

/**
 * Reduces a transformed row to the fields the user actually mapped from their
 * file (plus photo URLs the import hosted). transformRow seeds status/featured
 * defaults and can synthesize a title; an UPDATE never writes those, so echoing
 * them in the results file would assert values the database doesn't have.
 */
export function pickImportedData(
  data: Record<string, any>,
  mappedFields: Iterable<string>
): Record<string, any> {
  const keep = new Set<string>(mappedFields)
  keep.add('cover_photo_url')
  const out: Record<string, any> = {}
  for (const key of Object.keys(data)) {
    if (keep.has(key) && data[key] !== undefined) out[key] = data[key]
  }
  return out
}

/** Property columns eligible for the file, in export order (id/url are fixed). */
const DATA_COLUMN_KEYS: string[] = EXPORT_COLUMNS
  .map((c) => c.key as string)
  .filter((k) => k !== 'id' && k !== 'property_url')

function formatCell(value: unknown): string | number {
  if (value == null) return ''
  if (Array.isArray(value)) return value.join('; ')
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return value
  return String(value)
}

/** Headers in output order: fixed id/action, then supplied data columns, then property_url. */
export function importResultHeaders(rows: ImportedRow[]): string[] {
  const supplied = new Set<string>()
  for (const r of rows) {
    for (const key of Object.keys(r.data)) supplied.add(key)
  }
  const dataCols = DATA_COLUMN_KEYS.filter((k) => supplied.has(k))
  return [...IMPORT_RESULT_FIXED_HEADERS, ...dataCols, 'property_url']
}

export function importResultRows(rows: ImportedRow[], origin: string): (string | number)[][] {
  const headers = importResultHeaders(rows)
  return rows.map((r) =>
    headers.map((h) => {
      if (h === 'id') return r.id
      if (h === 'import_action') return r.action
      if (h === 'property_url') return getPropertyUrl(r.id, origin)
      return formatCell(r.data[h])
    })
  )
}

export function buildImportResultCsv(rows: ImportedRow[], origin: string): string {
  const fields = importResultHeaders(rows)
  const data = importResultRows(rows, origin)
  // escapeFormulae guards against =/+/-/@ cells executing when opened in Excel.
  const csv = Papa.unparse({ fields, data }, { escapeFormulae: true })
  return `﻿${csv}`
}

export async function buildImportResultXlsx(rows: ImportedRow[], origin: string): Promise<Uint8Array> {
  const XLSX = await import('xlsx')
  const headers = importResultHeaders(rows)
  const aoa: (string | number)[][] = [headers, ...importResultRows(rows, origin)]

  const sheet = XLSX.utils.aoa_to_sheet(aoa)
  sheet['!cols'] = headers.map((h, i) => {
    const longest = aoa.reduce((max, row) => Math.max(max, String(row[i] ?? '').length), h.length)
    return { wch: Math.min(Math.max(longest + 2, 8), 60) }
  })

  const urlCol = headers.indexOf('property_url')
  for (let i = 1; i < aoa.length; i++) {
    const addr = XLSX.utils.encode_cell({ r: i, c: urlCol })
    const cell = sheet[addr]
    if (cell && typeof cell.v === 'string' && cell.v) cell.l = { Target: cell.v }
  }
  sheet['!freeze'] = { xSplit: 0, ySplit: 1 }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Imported')
  return new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer)
}
