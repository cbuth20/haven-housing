#!/usr/bin/env node
// Main migration orchestrator
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { CSVParser } from './csv-parser'
import { FieldTransformer } from './field-transformer'
import { WixImageConverter } from './wix-image-converter'
import { BatchImporter } from './batch-importer'
import { CheckpointManager } from './checkpoint-manager'
import { MigrationLogger } from './logger'
import { MIGRATION_CONFIG } from './config'
import { PropertySchema } from '../../netlify/functions/utils/validation'
import { MigrationMode, MigrationStats, ValidationResult, SupabaseProperty, WixCSVRow } from './types'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

class MigrationOrchestrator {
  private csvParser: CSVParser
  private transformer: FieldTransformer
  private imageConverter: WixImageConverter
  private importer: BatchImporter
  private checkpoint: CheckpointManager
  private logger: MigrationLogger

  constructor() {
    this.csvParser = new CSVParser()
    this.transformer = new FieldTransformer()
    this.imageConverter = new WixImageConverter(supabase)
    this.logger = new MigrationLogger(
      MIGRATION_CONFIG.logFile,
      MIGRATION_CONFIG.errorLogFile
    )
    this.importer = new BatchImporter(supabase, this.logger)
    this.checkpoint = new CheckpointManager(MIGRATION_CONFIG.checkpointFile)
  }

  async run(mode: MigrationMode, csvPath?: string, limit?: number) {
    const startTime = Date.now()

    try {
      switch (mode) {
        case 'validate':
          await this.runValidation(csvPath!, limit)
          break
        case 'test':
          await this.runTestMigration(csvPath!, limit || MIGRATION_CONFIG.testBatchSize)
          break
        case 'images':
          await this.runImageMigration(limit, csvPath)
          break
        case 'full':
          await this.runFullMigration(csvPath!)
          break
        case 'resume':
          await this.runResume(csvPath!)
          break
        case 'verify':
          await this.runVerification()
          break
        default:
          throw new Error(`Unknown mode: ${mode}`)
      }

      const duration = Math.round((Date.now() - startTime) / 1000)
      this.logger.success(`Migration completed in ${duration}s`)
    } catch (error: any) {
      this.logger.error('Migration failed', error)
      process.exit(1)
    }
  }

  private async runValidation(csvPath: string, limit?: number) {
    this.logger.phase('Phase 1: CSV Validation (Dry Run)')

    const rows = await this.csvParser.parse(csvPath, limit)
    this.logger.info(`Parsed ${rows.length} rows`)

    const validationResults: ValidationResult[] = []
    let validCount = 0
    let invalidCount = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const result = this.validateRow(row, i)
      validationResults.push(result)

      if (result.valid) {
        validCount++
      } else {
        invalidCount++
        this.logger.error(`Row ${i + 1} validation failed: ${result.errors.join(', ')}`)
      }

      if (result.warnings.length > 0) {
        this.logger.warn(`Row ${i + 1} warnings: ${result.warnings.join(', ')}`)
      }
    }

    // Generate validation report
    const report = {
      totalRows: rows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      invalidDetails: validationResults.filter(r => !r.valid).map(r => ({
        row: r.row,
        wixId: r.wixId,
        errors: r.errors,
      })),
      warnings: validationResults
        .filter(r => r.warnings.length > 0)
        .map(r => ({
          row: r.row,
          wixId: r.wixId,
          warnings: r.warnings,
        })),
    }

    writeFileSync(
      resolve(__dirname, MIGRATION_CONFIG.validationReportFile),
      JSON.stringify(report, null, 2)
    )

    this.logger.summary({
      'Total Rows': rows.length,
      'Valid Rows': validCount,
      'Invalid Rows': invalidCount,
      'Success Rate': `${((validCount / rows.length) * 100).toFixed(1)}%`,
    })

    this.logger.info(`Validation report saved to ${MIGRATION_CONFIG.validationReportFile}`)
  }

  private validateRow(row: WixCSVRow, index: number): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      row: index + 1,
      wixId: row.ID || 'unknown',
      errors: [],
      warnings: [],
    }

    try {
      const transformed = this.transformer.transform(row)

      // Validate with Zod schema
      const validation = PropertySchema.safeParse(transformed)

      if (!validation.success) {
        result.valid = false
        if (validation.error?.issues && Array.isArray(validation.error.issues)) {
          result.errors = validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
        } else {
          result.errors = [validation.error?.message || 'Validation failed']
        }
      }

      // Check for warnings (missing optional but recommended fields)
      if (!transformed.square_footage) {
        result.warnings.push('Missing square footage')
      }
      if (!transformed.description) {
        result.warnings.push('Missing description')
      }
      if (!transformed.monthly_rent) {
        result.warnings.push('Missing monthly rent')
      }
    } catch (error: any) {
      result.valid = false
      result.errors.push(error.message)
    }

    return result
  }

  private async runTestMigration(csvPath: string, limit: number) {
    this.logger.phase(`Phase 2: Test Migration (${limit} Properties)`)

    // Reset checkpoint for fresh start
    this.checkpoint.reset()

    const rows = await this.csvParser.parse(csvPath, limit)
    this.logger.info(`Loaded ${rows.length} rows for test migration`)

    await this.importProperties(rows)

    this.logger.success('Test migration complete!')
    this.logger.info('Review the results, then run image migration with: npm run migrate:images -- --test')
  }

  private async runFullMigration(csvPath: string) {
    this.logger.phase('Phase 3: Full Migration (All Properties)')

    // Confirm with user
    console.log('\n⚠️  WARNING: This will migrate ALL properties from the CSV file.')
    console.log('   Make sure you have tested the migration first with: npm run migrate:test')
    console.log('\n   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

    await new Promise(resolve => setTimeout(resolve, 5000))

    // Reset checkpoint
    this.checkpoint.reset()

    const rows = await this.csvParser.parse(csvPath)
    this.logger.info(`Loaded ${rows.length} rows for full migration`)

    await this.importProperties(rows)

    this.logger.success('Full property import complete!')
    this.logger.info('Now migrating images...')

    // Automatically run image migration
    await this.runImageMigration(undefined, csvPath)

    this.logger.success('Full migration complete!')
  }

  private async importProperties(rows: WixCSVRow[]) {
    const properties: SupabaseProperty[] = []
    const validationErrors: Array<{ row: number; error: string }> = []

    // Transform and validate all rows
    for (let i = 0; i < rows.length; i++) {
      try {
        const transformed = this.transformer.transform(rows[i])
        const validation = PropertySchema.safeParse(transformed)

        if (validation.success) {
          properties.push(transformed)
        } else {
          const errorMsg = validation.error.errors.map(e => e.message).join(', ')
          validationErrors.push({ row: i + 1, error: errorMsg })
          this.logger.error(`Validation failed for row ${i + 1}: ${errorMsg}`)
        }
      } catch (error: any) {
        validationErrors.push({ row: i + 1, error: error.message })
        this.logger.error(`Transform failed for row ${i + 1}`, error)
      }
    }

    this.logger.info(`Valid properties: ${properties.length}`)
    this.logger.info(`Invalid properties: ${validationErrors.length}`)

    if (properties.length === 0) {
      this.logger.error('No valid properties to import')
      return
    }

    // Import in batches
    const progressBar = this.logger.createProgressBar(properties.length, 'Importing')

    const { successful, failed } = await this.importer.importInBatches(
      properties,
      (current) => progressBar.update(current)
    )

    this.logger.stopProgressBar()

    // Update checkpoint
    successful.forEach(({ id }) => this.checkpoint.addSuccess(id))
    failed.forEach(({ wixId, error }) => {
      this.checkpoint.addFailure({
        wixId,
        row: 0,
        error,
        phase: 'import',
      })
    })
    this.checkpoint.save()

    this.logger.summary({
      'Total Rows': rows.length,
      'Valid Properties': properties.length,
      'Successfully Imported': successful.length,
      'Failed': failed.length,
      'Validation Errors': validationErrors.length,
    })
  }

  private async runImageMigration(limit?: number, csvPath?: string) {
    this.logger.phase('Phase 4: Image Migration')

    // Get properties without images
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, wix_id')
      .is('cover_photo_url', null)
      .limit(limit || 10000)

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`)
    }

    if (!properties || properties.length === 0) {
      this.logger.info('No properties found needing image migration')
      return
    }

    this.logger.info(`Found ${properties.length} properties needing images`)

    // Resolve CSV path - check arg, then look for common default
    const resolvedCsvPath = csvPath || resolve(process.cwd(), 'All+Properties.csv')

    // Reload CSV to get Wix image URLs
    let rows: WixCSVRow[]
    try {
      rows = await this.csvParser.parse(resolvedCsvPath)
      this.logger.info(`Loaded ${rows.length} CSV rows for image URL lookup`)
    } catch (err: any) {
      this.logger.error(`Failed to load CSV for image migration: ${err.message}`)
      this.logger.info('Provide CSV path: npm run migrate -- --mode images /path/to/file.csv')
      return
    }

    // Build lookup map: wix_id -> CSV row
    const rowMap = new Map<string, WixCSVRow>()
    for (const row of rows) {
      if (row.ID) {
        rowMap.set(row.ID, row)
      }
    }

    const progressBar = this.logger.createProgressBar(properties.length, 'Migrating Images')

    let successCount = 0
    let failCount = 0
    let skippedCount = 0

    for (let i = 0; i < properties.length; i++) {
      const { id: propertyId, wix_id: wixId } = properties[i]
      const originalRow = rowMap.get(wixId)

      if (!originalRow) {
        this.logger.warn(`No CSV row found for wix_id: ${wixId}`)
        skippedCount++
        progressBar.update(i + 1)
        continue
      }

      try {
        const coverPhotoWixUrl = this.transformer.extractCoverPhotoWixUrl(originalRow)
        const galleryWixUrls = this.transformer.extractMediaGalleryWixUrls(originalRow)

        if (!coverPhotoWixUrl && galleryWixUrls.length === 0) {
          skippedCount++
          progressBar.update(i + 1)
          continue
        }

        const { coverPhotoUrl, galleryUrls, errors } = await this.imageConverter.migrateImagesForProperty(
          propertyId,
          coverPhotoWixUrl,
          galleryWixUrls
        )

        await this.importer.updatePropertyImages(
          propertyId,
          coverPhotoUrl,
          galleryUrls.length > 0 ? galleryUrls : null
        )

        successCount++

        if (errors.length > 0) {
          this.logger.warn(`Partial success for ${propertyId}: ${errors.join(', ')}`)
        }
      } catch (err: any) {
        failCount++
        this.logger.error(`Failed images for ${propertyId}: ${err.message}`)
      }

      progressBar.update(i + 1)

      // Rate limiting: pause every 5 properties
      if ((i + 1) % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    this.logger.stopProgressBar()

    this.logger.summary({
      'Properties Needing Images': properties.length,
      'Images Migrated Successfully': successCount,
      'Image Migrations Failed': failCount,
      'Skipped (no images in CSV)': skippedCount,
    })
  }

  private async runResume(csvPath: string) {
    this.logger.phase('Phase 5: Resume Migration')

    if (!this.checkpoint.exists()) {
      this.logger.error('No checkpoint found. Nothing to resume.')
      return
    }

    const state = this.checkpoint.get()
    this.logger.info(`Resuming from row ${state.lastProcessedRow}`)
    this.logger.info(`Phase: ${state.phase}`)

    const rows = await this.csvParser.parse(csvPath)
    const remainingRows = rows.slice(state.lastProcessedRow)

    this.logger.info(`Remaining rows: ${remainingRows.length}`)

    await this.importProperties(remainingRows)

    this.logger.success('Resume complete!')
  }

  private async runVerification() {
    this.logger.phase('Phase 6: Migration Verification')

    const stats: any = {}

    // Count total properties
    const { count: totalCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })

    stats['Total Properties'] = totalCount

    // Count with Wix ID
    const { count: withWixId } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .not('wix_id', 'is', null)

    stats['With Wix ID'] = withWixId

    // Count with cover photos
    const { count: withCover } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .not('cover_photo_url', 'is', null)

    stats['With Cover Photo'] = withCover

    // Count with gallery
    const { count: withGallery } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .not('media_gallery_urls', 'is', null)

    stats['With Gallery'] = withGallery

    // Count published
    const { count: published } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    stats['Published'] = published

    // Check checkpoint
    if (this.checkpoint.exists()) {
      const state = this.checkpoint.get()
      stats['Checkpoint Exists'] = 'Yes'
      stats['Last Phase'] = state.phase
      stats['Successful Imports'] = state.successfulProperties.length
      stats['Failed Imports'] = state.failedProperties.length
    } else {
      stats['Checkpoint Exists'] = 'No'
    }

    this.logger.summary(stats)

    // Save verification report
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      checkpoint: this.checkpoint.exists() ? this.checkpoint.get() : null,
    }

    writeFileSync(
      resolve(__dirname, 'verification-report.json'),
      JSON.stringify(report, null, 2)
    )

    this.logger.info('Verification report saved to verification-report.json')
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  let mode: MigrationMode = 'validate'
  let csvPath: string | undefined
  let limit: number | undefined

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--mode') {
      mode = args[++i] as MigrationMode
    } else if (arg === '--limit') {
      limit = parseInt(args[++i], 10)
    } else if (!arg.startsWith('--')) {
      csvPath = arg
    }
  }

  // Validate required arguments
  if (['validate', 'test', 'full', 'resume'].includes(mode) && !csvPath) {
    console.error('❌ Error: CSV file path is required for this mode')
    console.error('\nUsage:')
    console.error('  npm run migrate:validate -- /path/to/file.csv')
    console.error('  npm run migrate:test -- /path/to/file.csv')
    console.error('  npm run migrate:full -- /path/to/file.csv')
    console.error('  npm run migrate -- --mode images /path/to/file.csv')
    process.exit(1)
  }

  const orchestrator = new MigrationOrchestrator()
  await orchestrator.run(mode, csvPath, limit)
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { MigrationOrchestrator }
