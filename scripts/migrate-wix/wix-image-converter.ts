// Converts Wix image URLs to Supabase Storage URLs
import { createClient } from '@supabase/supabase-js'
import pLimit from 'p-limit'
import { WIX_IMAGE_PATTERN, WIX_STATIC_URL, MIGRATION_CONFIG } from './config'
import { ImageMigrationResult } from './types'

export class WixImageConverter {
  private supabase: ReturnType<typeof createClient>
  private limit: any

  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase
    this.limit = pLimit(MIGRATION_CONFIG.imageConcurrency)
  }

  async migrateImage(
    wixUrl: string,
    propertyId: string,
    imageType: 'cover' | 'gallery',
    index: number = 0
  ): Promise<ImageMigrationResult> {
    try {
      // Extract Wix image ID
      const imageId = this.extractWixImageId(wixUrl)
      if (!imageId) {
        return {
          success: false,
          originalUrl: wixUrl,
          error: 'Invalid Wix image URL format'
        }
      }

      // Convert to public Wix URL
      const publicWixUrl = this.convertToPublicUrl(imageId)

      // Download image with retries
      const imageBuffer = await this.downloadWithRetry(publicWixUrl)

      // Detect file extension and content type from media ID
      const ext = this.getExtension(imageId)
      const contentType = this.getContentType(ext)

      // Generate unique filename
      const fileName = this.generateFileName(propertyId, imageType, index, ext)

      // Upload to Supabase Storage
      const { data, error } = await this.supabase
        .storage
        .from(MIGRATION_CONFIG.storageBucket)
        .upload(fileName, imageBuffer, {
          contentType,
          cacheControl: '3600',
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase
        .storage
        .from(MIGRATION_CONFIG.storageBucket)
        .getPublicUrl(data.path)

      return {
        success: true,
        originalUrl: wixUrl,
        newUrl: publicUrl,
      }
    } catch (error: any) {
      return {
        success: false,
        originalUrl: wixUrl,
        error: error.message || 'Unknown error',
      }
    }
  }

  async migrateImagesForProperty(
    propertyId: string,
    coverPhotoWixUrl: string | null,
    galleryWixUrls: string[]
  ): Promise<{
    coverPhotoUrl: string | null
    galleryUrls: string[]
    errors: string[]
  }> {
    const errors: string[] = []
    let coverPhotoUrl: string | null = null
    const galleryUrls: string[] = []

    // Migrate cover photo
    if (coverPhotoWixUrl) {
      const result = await this.migrateImage(coverPhotoWixUrl, propertyId, 'cover', 0)
      if (result.success && result.newUrl) {
        coverPhotoUrl = result.newUrl
      } else {
        errors.push(`Cover photo failed: ${result.error}`)
      }
    }

    // Migrate gallery images (with concurrency limit)
    const galleryResults = await Promise.all(
      galleryWixUrls.map((url, index) =>
        this.limit(() => this.migrateImage(url, propertyId, 'gallery', index))
      )
    )

    galleryResults.forEach((result, index) => {
      if (result.success && result.newUrl) {
        galleryUrls.push(result.newUrl)
      } else {
        errors.push(`Gallery image ${index} failed: ${result.error}`)
      }
    })

    return { coverPhotoUrl, galleryUrls, errors }
  }

  private extractWixImageId(wixUrl: string): string | null {
    // Handle wix:image://v1/d56adb_abc123~mv2.jpg/filename.jpg#...
    // match[1] is the Wix media ID (e.g. d56adb_abc123~mv2.jpg)
    // match[2] is just the display filename - NOT the media ID
    const match = wixUrl.match(WIX_IMAGE_PATTERN)
    if (match && match[1]) {
      return match[1]
    }

    // Try alternative format
    if (wixUrl.includes('wix:image://')) {
      const parts = wixUrl.replace('wix:image://', '').split('/')
      if (parts.length >= 2) {
        return parts[1].split('#')[0].split('/')[0]
      }
    }

    return null
  }

  private convertToPublicUrl(imageId: string): string {
    return `${WIX_STATIC_URL}${imageId}`
  }

  private generateFileName(
    propertyId: string,
    imageType: 'cover' | 'gallery',
    index: number,
    ext: string = 'jpg'
  ): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    return `${propertyId}-${imageType}-${index}-${timestamp}-${randomString}.${ext}`
  }

  private getExtension(imageId: string): string {
    const match = imageId.match(/\.(\w+)$/)
    return match ? match[1].toLowerCase() : 'jpg'
  }

  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    }
    return types[ext] || 'image/jpeg'
  }

  private async downloadWithRetry(url: string, attempts: number = 0): Promise<Buffer> {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      if (attempts < MIGRATION_CONFIG.maxRetries) {
        // Exponential backoff
        const delay = MIGRATION_CONFIG.retryDelay * Math.pow(2, attempts)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.downloadWithRetry(url, attempts + 1)
      }
      throw error
    }
  }

  // Helper to check if URL is a Wix image
  isWixImageUrl(url: string): boolean {
    return url?.includes('wix:image://') || false
  }
}
