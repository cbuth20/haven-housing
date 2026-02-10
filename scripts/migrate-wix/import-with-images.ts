#!/usr/bin/env node
// Import properties with images - simplified for testing
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { CSVParser } from './csv-parser'
import { FieldTransformer } from './field-transformer'
import { WixImageConverter } from './wix-image-converter'
import { BatchImporter } from './batch-importer'
import { MigrationLogger } from './logger'
import { MIGRATION_CONFIG } from './config'
import { PropertySchema } from '../../netlify/functions/utils/validation'
import { WixCSVRow } from './types'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importWithImages(csvPath: string, limit: number = 50) {
  const logger = new MigrationLogger('import-with-images.log', 'import-with-images-errors.log')
  const csvParser = new CSVParser()
  const transformer = new FieldTransformer()
  const imageConverter = new WixImageConverter(supabase)
  const importer = new BatchImporter(supabase, logger)

  try {
    logger.phase(`Importing ${limit} Properties with Images`)

    // Parse CSV
    logger.info(`Parsing CSV: ${csvPath}`)
    const rows = await csvParser.parse(csvPath, limit)
    logger.info(`✓ Parsed ${rows.length} rows`)

    // Transform and validate
    const validProperties: any[] = []
    const rowMap = new Map<string, WixCSVRow>()

    logger.info('Transforming and validating...')
    for (const row of rows) {
      try {
        const transformed = transformer.transform(row)
        const validation = PropertySchema.safeParse(transformed)

        if (validation.success) {
          validProperties.push(transformed)
          rowMap.set(transformed.wix_id, row)
        } else {
          const errors = validation.error.issues?.map(e => e.message).join(', ') || 'Unknown error'
          logger.warn(`Skipping invalid property: ${errors}`)
        }
      } catch (error: any) {
        logger.warn(`Skipping property: ${error.message}`)
      }
    }

    logger.info(`✓ Valid properties: ${validProperties.length}`)

    if (validProperties.length === 0) {
      logger.error('No valid properties to import!')
      return
    }

    // Import properties (without images first)
    logger.info('\nStep 1: Importing property data...')
    const progressBar = logger.createProgressBar(validProperties.length, 'Importing Properties')

    const { successful, failed } = await importer.importInBatches(
      validProperties,
      (current) => progressBar.update(current)
    )

    logger.stopProgressBar()
    logger.info(`✓ Imported ${successful.length} properties`)
    if (failed.length > 0) {
      logger.warn(`✗ Failed ${failed.length} properties`)
    }

    // Migrate images for successful imports
    if (successful.length > 0) {
      logger.info(`\nStep 2: Migrating images for ${successful.length} properties...`)
      logger.info('This may take a while (downloading from Wix, uploading to Supabase)')

      const imageProgressBar = logger.createProgressBar(successful.length, 'Migrating Images')

      let successCount = 0
      let failCount = 0

      for (let i = 0; i < successful.length; i++) {
        const { id: propertyId, wixId } = successful[i]
        const originalRow = rowMap.get(wixId)

        if (!originalRow) {
          logger.warn(`No CSV row found for wix_id: ${wixId}`)
          imageProgressBar.update(i + 1)
          continue
        }

        try {
          // Extract Wix image URLs
          const coverPhotoWixUrl = transformer.extractCoverPhotoWixUrl(originalRow)
          const galleryWixUrls = transformer.extractMediaGalleryWixUrls(originalRow)

          if (!coverPhotoWixUrl && galleryWixUrls.length === 0) {
            logger.warn(`No images found for property ${propertyId}`)
            imageProgressBar.update(i + 1)
            continue
          }

          // Migrate images
          const { coverPhotoUrl, galleryUrls, errors } = await imageConverter.migrateImagesForProperty(
            propertyId,
            coverPhotoWixUrl,
            galleryWixUrls
          )

          // Update property with new URLs
          await importer.updatePropertyImages(propertyId, coverPhotoUrl, galleryUrls.length > 0 ? galleryUrls : null)

          successCount++

          if (errors.length > 0) {
            logger.warn(`Partial success for ${propertyId}: ${errors.length} image(s) failed`)
          }
        } catch (error: any) {
          failCount++
          logger.error(`Failed to migrate images for ${propertyId}: ${error.message}`)
        }

        imageProgressBar.update(i + 1)

        // Rate limiting delay
        if ((i + 1) % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      logger.stopProgressBar()

      logger.summary({
        'Properties Imported': successful.length,
        'Images Migrated Successfully': successCount,
        'Image Migrations Failed': failCount,
        'Property Import Failures': failed.length,
      })

      logger.success(`\n✅ Import complete! Check your admin panel to view properties.`)
      logger.info('Run: npx tsx scripts/check-migration-status.ts')
    }
  } catch (error: any) {
    logger.error('Import failed', error)
    throw error
  }
}

// CLI
const args = process.argv.slice(2)
const csvPath = args[0]
const limit = args[1] ? parseInt(args[1], 10) : 50

if (!csvPath) {
  console.error('❌ Error: CSV file path is required')
  console.error('\nUsage:')
  console.error('  npx tsx scripts/migrate-wix/import-with-images.ts <csv-path> [limit]')
  console.error('\nExample:')
  console.error('  npx tsx scripts/migrate-wix/import-with-images.ts ./All+Properties.csv 50')
  process.exit(1)
}

importWithImages(csvPath, limit)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
