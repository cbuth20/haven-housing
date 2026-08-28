import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedSpreadsheet {
  headers: string[]
  rows: Record<string, string>[]
}

export const SPREADSHEET_EXTENSIONS = ['.csv', '.xlsx', '.xls'] as const

export const SPREADSHEET_ACCEPT: Record<string, string[]> = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
}

export function isSpreadsheetFile(name: string): boolean {
  const lower = name.toLowerCase()
  return SPREADSHEET_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/**
 * Parses a CSV or Excel file into header-keyed string rows. Both formats yield
 * the same shape so the import wizard is format-agnostic. Excel input reads the
 * first sheet; cell values are formatted as text (dates/numbers as displayed).
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  if (file.name.toLowerCase().endsWith('.csv')) {
    return parseCsv(file)
  }
  return parseExcel(await file.arrayBuffer())
}

function parseCsv(file: File): Promise<ParsedSpreadsheet> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error(`Failed to parse CSV: ${results.errors[0].message}`))
          return
        }
        resolve({ headers: results.meta.fields || [], rows: results.data })
      },
      error: (err) => reject(new Error(`Failed to read file: ${err.message}`)),
    })
  })
}

export function parseExcel(data: ArrayBuffer | Uint8Array): ParsedSpreadsheet {
  const workbook = XLSX.read(data, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { headers: [], rows: [] }
  const sheet = workbook.Sheets[sheetName]

  // First row = headers (as displayed text), remaining rows = data.
  const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  })
  if (matrix.length === 0) return { headers: [], rows: [] }

  const headers = matrix[0].map((h) => String(h ?? '').trim())
  const rows: Record<string, string>[] = []
  for (const line of matrix.slice(1)) {
    const row: Record<string, string> = {}
    let hasValue = false
    headers.forEach((h, i) => {
      if (!h) return
      const v = String(line[i] ?? '')
      row[h] = v
      if (v !== '') hasValue = true
    })
    if (hasValue) rows.push(row)
  }
  return { headers: headers.filter(Boolean), rows }
}
