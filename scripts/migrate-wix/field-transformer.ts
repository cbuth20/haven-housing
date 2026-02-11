// Transforms Wix CSV fields to Supabase schema
import { WixCSVRow, SupabaseProperty } from './types'
import { MIGRATION_CONFIG } from './config'

export class FieldTransformer {
  transform(row: WixCSVRow): SupabaseProperty {
    return {
      title: this.extractTitle(row),
      street_address: this.extractStreetAddress(row),
      city: this.extractCity(row),
      state: this.extractState(row),
      zip_code: this.extractZipCode(row),
      country: this.extractCountry(row),
      latitude: this.extractLatitude(row),
      longitude: this.extractLongitude(row),
      description: this.extractDescription(row),
      square_footage: this.extractSquareFootage(row),
      unit_type: this.extractUnitType(row),
      beds: this.extractBeds(row),
      baths: this.extractBaths(row),
      laundry: this.extractLaundry(row),
      pet_policy: this.extractPetPolicy(row),
      parking: this.extractParking(row),
      furnish_level: this.extractFurnishLevel(row),
      other_amenities: this.extractOtherAmenities(row),
      landlord_name: this.extractLandlordName(row),
      landlord_email: this.extractLandlordEmail(row),
      landlord_phone: this.extractLandlordPhone(row),
      monthly_rent: this.extractMonthlyRent(row),
      cover_photo_url: null,  // Will be populated during image migration
      media_gallery_urls: null,  // Will be populated during image migration
      listing_link: this.extractListingLink(row),
      featured: this.extractFeatured(row),
      status: MIGRATION_CONFIG.defaultStatus,
      wix_id: this.extractWixId(row),
    }
  }

  private parseJSON(value: any): any {
    if (typeof value !== 'string') return value

    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  private extractFromArray(value: any): string | null {
    const parsed = this.parseJSON(value)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return String(parsed[0])
    }
    return typeof value === 'string' ? value : null
  }

  // Get parsed location data, falling back to Street Address when Location column is empty
  private getLocationData(row: WixCSVRow): any {
    const locationCol = row['City, State Zipcode, Country']
    if (locationCol) {
      const parsed = this.parseJSON(locationCol)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
    // Fallback: some rows have the location JSON in Street Address instead
    const streetAddr = row['Street Address']
    if (streetAddr) {
      const parsed = this.parseJSON(streetAddr)
      if (typeof parsed === 'object' && parsed !== null && (parsed.city || parsed.subdivisions || parsed.postalCode)) {
        return parsed
      }
    }
    return null
  }

  private extractTitle(row: WixCSVRow): string {
    return row.Title || 'Untitled Property'
  }

  private extractStreetAddress(row: WixCSVRow): string {
    const addr = row['Street Address']

    // Handle JSON format: {"formatted": "123 Main St"}
    if (typeof addr === 'object' && addr?.formatted) {
      return addr.formatted
    }

    const parsed = this.parseJSON(addr)
    if (typeof parsed === 'object') {
      // Prefer streetAddress.formattedAddressLine for the actual street
      if (parsed.streetAddress?.formattedAddressLine) {
        return parsed.streetAddress.formattedAddressLine
      }
      if (parsed.formatted) {
        return parsed.formatted
      }
    }

    return String(addr || '')
  }

  private extractCity(row: WixCSVRow): string {
    const parsed = this.getLocationData(row)
    if (parsed) {
      if (parsed.city) return parsed.city
      if (parsed.formatted) {
        const parts = parsed.formatted.split(',')
        return parts[0]?.trim() || ''
      }
    }
    return String(row.City || '')
  }

  private extractState(row: WixCSVRow): string {
    const parsed = this.getLocationData(row)
    if (parsed) {
      if (parsed.subdivisions?.[0]?.code) return parsed.subdivisions[0].code
      if (parsed.subdivision) return parsed.subdivision
      if (parsed.state) return parsed.state
    }
    return String(row.State || '')
  }

  private extractZipCode(row: WixCSVRow): string {
    const parsed = this.getLocationData(row)
    if (parsed?.postalCode) {
      return parsed.postalCode.split('-')[0]
    }
    return String(row['Zip Code'] || '')
  }

  private extractCountry(row: WixCSVRow): string {
    const parsed = this.getLocationData(row)
    if (parsed?.country) return parsed.country
    return String(row.Country || MIGRATION_CONFIG.defaultCountry)
  }

  private extractLatitude(row: WixCSVRow): number | null {
    const parsed = this.getLocationData(row)
    if (parsed?.location?.latitude) return Number(parsed.location.latitude)
    const num = Number(row.Latitude)
    return isNaN(num) ? null : num
  }

  private extractLongitude(row: WixCSVRow): number | null {
    const parsed = this.getLocationData(row)
    if (parsed?.location?.longitude) return Number(parsed.location.longitude)
    const num = Number(row.Longitude)
    return isNaN(num) ? null : num
  }

  private extractDescription(row: WixCSVRow): string | null {
    return row.Description || null
  }

  private extractSquareFootage(row: WixCSVRow): number | null {
    const sqft = row['Square Footage']
    if (!sqft) return null

    // Extract the first number from the string (handles "888 SF", multi-unit "1x1: 750 sq ft\n2x2: 1050", etc.)
    const match = String(sqft).match(/(\d[\d,]*)\s*(?:sf|sq|$)/i)
    if (match) {
      const num = parseInt(match[1].replace(/,/g, ''), 10)
      return isNaN(num) || num > 100000 ? null : num
    }
    // Fallback: just grab the first number
    const fallback = String(sqft).match(/(\d+)/)
    if (fallback) {
      const num = parseInt(fallback[1], 10)
      return isNaN(num) || num > 100000 ? null : num
    }
    return null
  }

  private extractUnitType(row: WixCSVRow): string | null {
    return this.extractFromArray(row['Unit Type'])
  }

  private extractBeds(row: WixCSVRow): number | null {
    const beds = Number(row.Beds)
    return isNaN(beds) ? null : beds
  }

  private extractBaths(row: WixCSVRow): number | null {
    const baths = Number(row.Baths)
    return isNaN(baths) ? null : baths
  }

  private extractLaundry(row: WixCSVRow): string | null {
    return this.extractFromArray(row.Laundry)
  }

  private extractPetPolicy(row: WixCSVRow): string | null {
    return this.extractFromArray(row['Pet Policy'])
  }

  private extractParking(row: WixCSVRow): string | null {
    return row.Parking || null
  }

  private extractFurnishLevel(row: WixCSVRow): string | null {
    return this.extractFromArray(row['Furnish Level'])
  }

  private extractOtherAmenities(row: WixCSVRow): string[] | null {
    // Note: CSV has "Other Ammenities" (misspelled with double m)
    const amenities = row['Other Ammenities'] || row['Other Amenities']
    if (!amenities) return null

    // Split comma-separated string
    if (typeof amenities === 'string') {
      return amenities.split(',').map(s => s.trim()).filter(Boolean)
    }

    // Handle array
    if (Array.isArray(amenities)) {
      return amenities.map(a => String(a).trim()).filter(Boolean)
    }

    return null
  }

  private extractLandlordName(row: WixCSVRow): string | null {
    return row.Landlord || null
  }

  private extractLandlordEmail(row: WixCSVRow): string | null {
    const email = row['Landlord Email']
    if (email && typeof email === 'string') {
      // Clean up common CSV artifacts: trim whitespace, newlines, pipes
      const cleaned = email.replace(/[\s|]+/g, ' ').trim()
      if (cleaned.includes('@')) {
        return cleaned
      }
    }
    return null
  }

  private extractLandlordPhone(row: WixCSVRow): string | null {
    // Note: CSV has "Landlord Phone Number" not "Landlord Phone"
    return row['Landlord Phone Number'] || row['Landlord Phone'] || null
  }

  private extractMonthlyRent(row: WixCSVRow): number | null {
    const rent = Number(row['Monthly Rent'])
    return isNaN(rent) ? null : rent
  }

  private extractListingLink(row: WixCSVRow): string | null {
    const link = row['Listing Link']
    // Basic URL validation
    if (link && typeof link === 'string' && (link.startsWith('http://') || link.startsWith('https://'))) {
      return link
    }
    return null
  }

  private extractFeatured(row: WixCSVRow): boolean {
    const featured = row.Featured
    if (typeof featured === 'boolean') return featured
    if (typeof featured === 'string') {
      return featured.toLowerCase() === 'true' || featured === '1'
    }
    return false
  }

  private extractWixId(row: WixCSVRow): string {
    return row.ID || ''
  }

  // Helper to extract Wix image URLs for later processing
  extractCoverPhotoWixUrl(row: WixCSVRow): string | null {
    return row['Cover Photo'] || null
  }

  extractMediaGalleryWixUrls(row: WixCSVRow): string[] {
    const gallery = row['Media Gallery']
    if (!gallery) return []

    try {
      const parsed = this.parseJSON(gallery)
      if (Array.isArray(parsed)) {
        return parsed
          .map(item => {
            // Handle different gallery formats
            if (typeof item === 'string') return item
            if (item.url) return item.url
            if (item.src) return item.src
            return null
          })
          .filter(Boolean) as string[]
      }
    } catch {
      // Ignore parsing errors
    }

    return []
  }
}
