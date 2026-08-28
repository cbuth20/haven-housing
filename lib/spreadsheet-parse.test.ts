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
  it('returns header-keyed string rows from the first sheet', () => {
    const { headers, rows } = parseExcel(
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

  it('skips blank rows and trims/ignores empty headers', () => {
    const { headers, rows } = parseExcel(
      workbookBytes([[' title ', '', 'city'], ['A', 'x', 'B'], ['', '', ''], ['C', '', 'D']])
    )
    expect(headers).toEqual(['title', 'city'])
    expect(rows).toEqual([{ title: 'A', city: 'B' }, { title: 'C', city: 'D' }])
  })

  it('handles an empty sheet', () => {
    expect(parseExcel(workbookBytes([]))).toEqual({ headers: [], rows: [] })
  })
})
