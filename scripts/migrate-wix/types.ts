// TypeScript interfaces for Wix migration

export interface WixCSVRow {
  // Property details
  Title: string
  'Street Address': string
  City: string | any  // Can be JSON object
  State: string | any  // Can be JSON object
  'Zip Code': string
  Country: string
  Latitude: string | number
  Longitude: string | number
  Description: string

  // Property specs
  'Square Footage': string  // "888 SF"
  'Unit Type': string | any  // JSON array ["Single Family"]
  Beds: string | number
  Baths: string | number

  // Amenities
  Laundry: string | any  // JSON array ["Yes"]
  'Pet Policy': string | any  // JSON array ["Pets Allowed"]
  Parking: string
  'Furnish Level': string | any  // JSON array ["Furnished"]
  'Other Amenities': string  // Comma-separated

  // Landlord info
  Landlord: string
  'Landlord Phone': string
  'Landlord Email': string
  'Listing Link': string

  // Media
  'Cover Photo': string  // wix:image://...
  'Media Gallery': string  // JSON array

  // Metadata
  Featured: string | boolean
  'Created Date': string
  'Updated Date': string
  ID: string  // Wix ID (UUID)

  // Additional fields
  'Monthly Rent': string | number
  [key: string]: any
}

export interface SupabaseProperty {
  title: string
  street_address: string
  city: string
  state: string
  zip_code: string
  country: string
  latitude: number | null
  longitude: number | null
  description: string | null
  square_footage: number | null
  unit_type: string | null
  beds: number | null
  baths: number | null
  laundry: string | null
  pet_policy: string | null
  parking: string | null
  furnish_level: string | null
  other_amenities: string[] | null
  landlord_name: string | null
  landlord_email: string | null
  landlord_phone: string | null
  monthly_rent: number | null
  cover_photo_url: string | null
  media_gallery_urls: string[] | null
  listing_link: string | null
  featured: boolean
  status: 'draft' | 'published' | 'archived'
  wix_id: string
}

export interface MigrationCheckpoint {
  phase: 'parsing' | 'importing' | 'images' | 'complete'
  lastProcessedRow: number
  totalRows: number
  successfulProperties: string[]  // Supabase UUIDs
  failedProperties: FailedProperty[]
  startedAt: string
  lastUpdatedAt: string
}

export interface FailedProperty {
  wixId: string
  row: number
  error: string
  phase: 'import' | 'cover_photo' | 'gallery'
  data?: any
}

export interface ValidationResult {
  valid: boolean
  row: number
  wixId: string
  errors: string[]
  warnings: string[]
}

export interface MigrationStats {
  totalRows: number
  validRows: number
  invalidRows: number
  duplicates: number
  imported: number
  failed: number
  coverPhotosDownloaded: number
  coverPhotosFailed: number
  galleryImagesDownloaded: number
  galleryImagesFailed: number
  duration: number
}

export interface ImageMigrationResult {
  success: boolean
  originalUrl: string
  newUrl?: string
  error?: string
}

export type MigrationMode = 'validate' | 'test' | 'images' | 'full' | 'resume' | 'verify'
