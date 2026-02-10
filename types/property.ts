export type PropertyStatus = 'draft' | 'published' | 'archived'

export interface Property {
  id: string

  // Basic Information
  title: string
  street_address: string
  city: string
  state: string
  zip_code: string
  country: string

  // Geolocation
  latitude: number | null
  longitude: number | null

  // Property Details
  description: string | null
  square_footage: number | null
  unit_type: string | null
  beds: number | null
  baths: number | null

  // Amenities
  laundry: string | null
  pet_policy: string | null
  parking: string | null
  furnish_level: string | null
  other_amenities: string[] | null

  // Landlord Information
  landlord_name: string | null
  landlord_email: string | null
  landlord_phone: string | null

  // Financial
  monthly_rent: number | null

  // Media
  cover_photo_url: string | null
  media_gallery_urls: string[] | null
  listing_link: string | null

  // Classification
  property_level: string | null
  featured: boolean
  status: PropertyStatus

  // Salesforce Integration
  salesforce_id: string | null
  last_synced_at: string | null

  // Wix Migration
  wix_id: string | null

  // Ownership & Tracking
  owner_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string

  // Computed field (from search)
  distance?: number
}

export interface PropertyFilters {
  lat?: number
  lon?: number
  radius?: number
  minBeds?: number
  minBaths?: number
  allowsPets?: boolean
  maxRent?: number
}

export interface PropertySearchResult extends Property {
  distance: number
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface PropertySubmission {
  id: string
  submission_data: Record<string, any>
  submitter_name: string | null
  submitter_email: string | null
  submitter_phone: string | null
  status: SubmissionStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  property_id: string | null
  created_at: string
  updated_at: string
}
