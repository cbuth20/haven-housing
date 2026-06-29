import { supabase } from './supabase'

const BUCKET = 'property-photos'

/**
 * Upload photos directly to Supabase Storage, bypassing Netlify Function size limits.
 * @param files - Array of File objects to upload
 * @param pathPrefix - Storage path prefix ('admin' for admin uploads, 'submissions' for public)
 * @returns Array of public URLs for the uploaded photos
 */
export async function uploadPhotosToStorage(
  files: File[],
  pathPrefix: 'admin' | 'submissions' = 'admin'
): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (const file of files) {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${pathPrefix}/${timestamp}-${randomStr}-${safeName}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
      })

    if (error) {
      console.error(`Upload failed for ${file.name}:`, error)
      throw new Error(`Failed to upload ${file.name}: ${error.message}`)
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path)

    uploadedUrls.push(urlData.publicUrl)
  }

  return uploadedUrls
}

export interface PhotoUploadResult {
  urls: string[]
  failures: { name: string; message: string }[]
}

/**
 * Like uploadPhotosToStorage but resilient: a per-file failure is collected
 * rather than aborting the whole batch, so a single bad image doesn't lose the
 * others. Returns the successfully-uploaded URLs alongside the failures.
 */
export async function uploadPhotosWithResults(
  files: File[],
  pathPrefix: 'admin' | 'submissions' = 'admin'
): Promise<PhotoUploadResult> {
  const urls: string[] = []
  const failures: { name: string; message: string }[] = []

  for (const file of files) {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${pathPrefix}/${timestamp}-${randomStr}-${safeName}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
      })

    if (error || !data) {
      failures.push({ name: file.name, message: error?.message || 'Upload failed' })
      continue
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    urls.push(urlData.publicUrl)
  }

  return { urls, failures }
}
