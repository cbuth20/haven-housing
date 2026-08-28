import Papa from 'papaparse'

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
 * first sheet using underlying cell values (not display formatting), so a
 * currency-formatted 1800 arrives as "1800" and dates as YYYY-MM-DD.
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

/** Underlying cell value -> import string. */
export function formatCell(value: unknown): string {
  if (value == null) return ''
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10)
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

export async function parseExcel(data: ArrayBuffer | Uint8Array): Promise<ParsedSpreadsheet> {
  // SheetJS is large; load it only when an Excel file is actually parsed.
  const XLSX = await import('xlsx')
  let workbook: ReturnType<typeof XLSX.read>
  try {
    workbook = XLSX.read(data, { type: 'array', cellDates: true })
  } catch (err) {
    throw new Error(`Failed to parse Excel file: ${err instanceof Error ? err.message : String(err)}`)
  }
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { headers: [], rows: [] }
  const sheet = workbook.Sheets[sheetName]

  // First row = headers, remaining rows = data, using raw cell values.
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: '',
    blankrows: false,
  })
  if (matrix.length === 0) return { headers: [], rows: [] }

  const headers = matrix[0].map((h) => formatCell(h).trim())
  const rows: Record<string, string>[] = []
  for (const line of matrix.slice(1)) {
    const row: Record<string, string> = {}
    let hasValue = false
    headers.forEach((h, i) => {
      if (!h) return
      const v = formatCell(line[i])
      row[h] = v
      if (v !== '') hasValue = true
    })
    if (hasValue) rows.push(row)
  }
  return { headers: headers.filter(Boolean), rows }
}
