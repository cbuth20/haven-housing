import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { parseExcel, isSpreadsheetFile } from './spreadsheet-parse'

function workbookBytes(aoa: unknown[][]): Uint8Array {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'Sheet1')
  return new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer)
}

describe('isSpreadsheetFile', () => {
  it('accepts csv/xlsx/xls regardless of case and rejects others', () => {
    expect(isSpreadsheetFile('a.csv')).toBe(true)
    expect(isSpreadsheetFile('A.XLSX')).toBe(true)
    expect(isSpreadsheetFile('a.xls')).toBe(true)
    expect(isSpreadsheetFile('a.zip')).toBe(false)
  })
})

describe('parseExcel', () => {
  it('returns header-keyed string rows from the first sheet', async () => {
    const { headers, rows } = await parseExcel(
      workbookBytes([
        ['title', 'monthly_rent', 'beds'],
        ['Loft', 1800, 2],
        ['House', 2500, ''],
      ])
    )
    expect(headers).toEqual(['title', 'monthly_rent', 'beds'])
    expect(rows).toEqual([
      { title: 'Loft', monthly_rent: '1800', beds: '2' },
      { title: 'House', monthly_rent: '2500', beds: '' },
    ])
  })

  it('skips blank rows and trims/ignores empty headers', async () => {
    const { headers, rows } = await parseExcel(
      workbookBytes([[' title ', '', 'city'], ['A', 'x', 'B'], ['', '', ''], ['C', '', 'D']])
    )
    expect(headers).toEqual(['title', 'city'])
    expect(rows).toEqual([{ title: 'A', city: 'B' }, { title: 'C', city: 'D' }])
  })

  it('handles an empty sheet', async () => {
    expect(await parseExcel(workbookBytes([]))).toEqual({ headers: [], rows: [] })
  })

  it('uses underlying values, not display formatting', async () => {
    const wb = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet([
      ['monthly_rent', 'zip_code', 'landlord_phone', 'created'],
      [1800, '02134', 5550001234, new Date(Date.UTC(2026, 0, 15))],
    ])
    // Apply display formats that would mangle the text form
    sheet['A2'].z = '"$"#,##0.00'
    sheet['C2'].z = '0.00E+00'
    XLSX.utils.book_append_sheet(wb, sheet, 'Sheet1')
    const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx', cellDates: true }) as ArrayBuffer)

    const { rows } = await parseExcel(bytes)
    expect(rows[0].monthly_rent).toBe('1800')
    expect(rows[0].zip_code).toBe('02134')
    expect(rows[0].landlord_phone).toBe('5550001234')
    expect(rows[0].created).toBe('2026-01-15')
  })

  it('wraps parse failures in a friendly error', async () => {
    await expect(parseExcel(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 9, 9, 9, 9]))).rejects.toThrow(/Failed to parse Excel file/)
  })
})
