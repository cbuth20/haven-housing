// CSV parsing with streaming for memory efficiency
import csvParser from 'csv-parser'
import { createReadStream } from 'fs'
import { WixCSVRow } from './types'

export class CSVParser {
  async parse(filePath: string, limit?: number): Promise<WixCSVRow[]> {
    return new Promise((resolve, reject) => {
      const rows: WixCSVRow[] = []
      let rowCount = 0

      createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: WixCSVRow) => {
          rowCount++

          // If limit is set, stop after reaching it
          if (limit && rowCount > limit) {
            return
          }

          rows.push(row)
        })
        .on('end', () => {
          resolve(rows)
        })
        .on('error', (error) => {
          reject(error)
        })
    })
  }

  async count(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0

      createReadStream(filePath)
        .pipe(csvParser())
        .on('data', () => {
          count++
        })
        .on('end', () => {
          resolve(count)
        })
        .on('error', (error) => {
          reject(error)
        })
    })
  }

  async stream(
    filePath: string,
    onRow: (row: WixCSVRow, index: number) => Promise<void>,
    limit?: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let index = 0

      const stream = createReadStream(filePath)
        .pipe(csvParser())

      stream.on('data', async (row: WixCSVRow) => {
        if (limit && index >= limit) {
          stream.destroy()
          resolve()
          return
        }

        try {
          await onRow(row, index)
          index++
        } catch (error) {
          stream.destroy()
          reject(error)
        }
      })

      stream.on('end', () => {
        resolve()
      })

      stream.on('error', (error) => {
        reject(error)
      })
    })
  }
}
