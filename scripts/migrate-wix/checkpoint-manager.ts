// Checkpoint manager for migration progress tracking and resume capability
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { MigrationCheckpoint, FailedProperty } from './types'

export class CheckpointManager {
  private checkpointPath: string
  private checkpoint: MigrationCheckpoint

  constructor(checkpointFile: string) {
    this.checkpointPath = resolve(__dirname, checkpointFile)
    this.checkpoint = this.load()
  }

  private load(): MigrationCheckpoint {
    if (existsSync(this.checkpointPath)) {
      try {
        const data = readFileSync(this.checkpointPath, 'utf-8')
        return JSON.parse(data)
      } catch (error) {
        console.warn('⚠ Failed to load checkpoint, starting fresh')
      }
    }

    return {
      phase: 'parsing',
      lastProcessedRow: 0,
      totalRows: 0,
      successfulProperties: [],
      failedProperties: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    }
  }

  save() {
    this.checkpoint.lastUpdatedAt = new Date().toISOString()
    writeFileSync(this.checkpointPath, JSON.stringify(this.checkpoint, null, 2))
  }

  exists(): boolean {
    return existsSync(this.checkpointPath)
  }

  delete() {
    if (existsSync(this.checkpointPath)) {
      writeFileSync(this.checkpointPath, '')
    }
  }

  get(): MigrationCheckpoint {
    return this.checkpoint
  }

  setPhase(phase: MigrationCheckpoint['phase']) {
    this.checkpoint.phase = phase
    this.save()
  }

  setTotalRows(total: number) {
    this.checkpoint.totalRows = total
    this.save()
  }

  updateProgress(row: number) {
    this.checkpoint.lastProcessedRow = row
    this.save()
  }

  addSuccess(propertyId: string) {
    this.checkpoint.successfulProperties.push(propertyId)
  }

  addFailure(failure: FailedProperty) {
    this.checkpoint.failedProperties.push(failure)
  }

  shouldSkipRow(row: number): boolean {
    return row < this.checkpoint.lastProcessedRow
  }

  reset() {
    this.checkpoint = {
      phase: 'parsing',
      lastProcessedRow: 0,
      totalRows: 0,
      successfulProperties: [],
      failedProperties: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    }
    this.save()
  }
}
