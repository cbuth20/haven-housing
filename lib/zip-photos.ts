/**
 * ZIP photo archive parsing for bulk property import.
 *
 * Reads a ZIP of per-property folders in the browser and groups image entries by
 * their immediate parent folder. Entries are kept LAZY (not decompressed) until
 * import time, so a large archive — or folders that never match a CSV row — never
 * materializes into memory. The matching helpers are pure and unit-testable.
 */

import JSZip from 'jszip'

export interface PhotoEntry {
  name: string
  entry: JSZip.JSZipObject
}

export interface PhotoArchive {
  fileName: string
  /** normalized folder name → image entries (sorted by filename, not yet decompressed) */
  folders: Map<string, PhotoEntry[]>
  totalImages: number
  /** count of image-like files dropped because the format isn't supported by Storage */
  skippedCount: number
  /** distinct unsupported extensions encountered, e.g. ['heic', 'tif'] */
  skippedExtensions: string[]
}

export interface MatchSummary {
  matchedRows: number
  matchedImages: number
  /** raw photo_folder values that matched no folder in the ZIP */
  unmatchedRows: string[]
  /** folder names present in the ZIP that no row referenced */
  unusedFolders: string[]
}

// Must stay in sync with the property-photos bucket's allowed_mime_types
// (supabase/migrations/20260409_storage_policies.sql): png, jpeg, webp only.
const SUPPORTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])
// Image formats people commonly include but Storage will reject — track to warn.
const UNSUPPORTED_IMAGE_EXTENSIONS = new Set(['heic', 'heif', 'tif', 'tiff', 'bmp', 'gif', 'avif'])

/** Safety cap so a runaway archive can't lock up the browser. */
const MAX_IMAGES = 3000

/** Normalize a folder name / CSV value for matching: lowercase, trimmed, single-spaced. */
export function normalizeFolderKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

function contentTypeOf(name: string): string {
  switch (extensionOf(name)) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Parse a ZIP File into per-folder image entry groups (lazy — no decompression yet).
 * Images are matched to a property by their immediate parent directory name, so
 * `Anything/123 Main St/a.jpg` → folder "123 main st" (tolerates a wrapping
 * top-level folder from OneDrive zips). Root-level files, dotfiles, and
 * unsupported formats are excluded; unsupported image formats are counted so the
 * UI can warn that real photos were dropped.
 */
export async function parsePhotoArchive(file: File): Promise<PhotoArchive> {
  const zip = await JSZip.loadAsync(file)

  const folders = new Map<string, PhotoEntry[]>()
  const skipped = new Set<string>()
  let skippedCount = 0
  let totalImages = 0

  zip.forEach((relativePath, entry) => {
    if (entry.dir) return
    const segments = relativePath.replace(/\\/g, '/').split('/').filter(Boolean)
    if (segments.length < 2) return // root-level file — no folder to match on
    const fileName = segments[segments.length - 1]
    if (fileName.startsWith('.')) return // .DS_Store, ._thumbs, etc.

    const ext = extensionOf(fileName)
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      if (UNSUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
        skipped.add(ext)
        skippedCount++
      }
      return
    }

    const key = normalizeFolderKey(segments[segments.length - 2])
    if (!folders.has(key)) folders.set(key, [])
    folders.get(key)!.push({ name: fileName, entry })
    totalImages++
  })

  if (totalImages > MAX_IMAGES) {
    throw new Error(
      `This ZIP contains ${totalImages} images, over the ${MAX_IMAGES}-image limit. Split it into smaller batches.`
    )
  }

  for (const items of folders.values()) {
    items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }

  return {
    fileName: file.name,
    folders,
    totalImages,
    skippedCount,
    skippedExtensions: [...skipped].sort(),
  }
}

/** Decompress a folder's entries into uploadable File objects (called at import time). */
export async function materializeFolder(entries: PhotoEntry[]): Promise<File[]> {
  const files: File[] = []
  for (const { name, entry } of entries) {
    const blob = await entry.async('blob')
    files.push(new File([blob], name, { type: contentTypeOf(name) }))
  }
  return files
}

/**
 * Summarize how a set of CSV photo_folder values line up with the archive's folders,
 * for the pre-import preview banner. Surfaces mismatches in both directions.
 */
export function summarizeMatches(photoFolderValues: string[], archive: PhotoArchive): MatchSummary {
  const referenced = new Set<string>()
  let matchedRows = 0
  let matchedImages = 0
  const unmatchedRows: string[] = []

  for (const raw of photoFolderValues) {
    if (!raw) continue
    const key = normalizeFolderKey(raw)
    const entries = archive.folders.get(key)
    if (entries) {
      matchedRows++
      matchedImages += entries.length
      referenced.add(key)
    } else {
      unmatchedRows.push(raw)
    }
  }

  const unusedFolders: string[] = []
  for (const key of archive.folders.keys()) {
    if (!referenced.has(key)) unusedFolders.push(key)
  }

  return { matchedRows, matchedImages, unmatchedRows, unusedFolders }
}
