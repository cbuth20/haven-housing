// Batch importer for properties with duplicate detection
import { createClient } from '@supabase/supabase-js'
import { SupabaseProperty } from './types'
import { MIGRATION_CONFIG } from './config'
import { MigrationLogger } from './logger'

export class BatchImporter {
  private supabase: ReturnType<typeof createClient>
  private logger: MigrationLogger

  constructor(supabase: ReturnType<typeof createClient>, logger: MigrationLogger) {
    this.supabase = supabase
    this.logger = logger
  }

  async isDuplicate(wixId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('properties')
      .select('id')
      .eq('wix_id', wixId)
      .maybeSingle()

    return !!data
  }

  async importProperty(property: SupabaseProperty): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Check for duplicate
      if (await this.isDuplicate(property.wix_id)) {
        return {
          success: false,
          error: 'Duplicate (wix_id already exists)'
        }
      }

      // Insert property
      const { data, error } = await this.supabase
        .from('properties')
        .insert(property)
        .select('id')
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        id: data.id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error'
      }
    }
  }

  async importBatch(properties: SupabaseProperty[]): Promise<{
    successful: Array<{ id: string; wixId: string }>
    failed: Array<{ wixId: string; error: string }>
  }> {
    const successful: Array<{ id: string; wixId: string }> = []
    const failed: Array<{ wixId: string; error: string }> = []

    // Filter out duplicates first
    const nonDuplicates: SupabaseProperty[] = []
    for (const property of properties) {
      const isDupe = await this.isDuplicate(property.wix_id)
      if (isDupe) {
        failed.push({
          wixId: property.wix_id,
          error: 'Duplicate (wix_id already exists)'
        })
      } else {
        nonDuplicates.push(property)
      }
    }

    if (nonDuplicates.length === 0) {
      return { successful, failed }
    }

    // Try batch insert
    const { data, error } = await this.supabase
      .from('properties')
      .insert(nonDuplicates)
      .select('id, wix_id')

    if (error) {
      // Batch failed, try individual inserts
      this.logger.warn('Batch insert failed, trying individual inserts')

      for (const property of nonDuplicates) {
        const result = await this.importProperty(property)
        if (result.success && result.id) {
          successful.push({ id: result.id, wixId: property.wix_id })
        } else {
          failed.push({
            wixId: property.wix_id,
            error: result.error || 'Unknown error'
          })
        }
      }
    } else {
      // Batch succeeded
      data.forEach((item: any) => {
        successful.push({ id: item.id, wixId: item.wix_id })
      })
    }

    return { successful, failed }
  }

  async importInBatches(
    properties: SupabaseProperty[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{
    successful: Array<{ id: string; wixId: string }>
    failed: Array<{ wixId: string; error: string }>
  }> {
    const allSuccessful: Array<{ id: string; wixId: string }> = []
    const allFailed: Array<{ wixId: string; error: string }> = []

    const batchSize = MIGRATION_CONFIG.propertyInsertBatch
    const totalBatches = Math.ceil(properties.length / batchSize)

    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1

      this.logger.info(`Processing batch ${batchNum}/${totalBatches} (${batch.length} properties)`)

      const { successful, failed } = await this.importBatch(batch)

      allSuccessful.push(...successful)
      allFailed.push(...failed)

      if (onProgress) {
        onProgress(i + batch.length, properties.length)
      }

      // Rate limiting delay
      if (i + batchSize < properties.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return { successful: allSuccessful, failed: allFailed }
  }

  async updatePropertyImages(
    propertyId: string,
    coverPhotoUrl: string | null,
    galleryUrls: string[] | null
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('properties')
        .update({
          cover_photo_url: coverPhotoUrl,
          media_gallery_urls: galleryUrls,
        })
        .eq('id', propertyId)

      if (error) throw error
      return true
    } catch (error) {
      return false
    }
  }
}
