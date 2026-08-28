/**
 * CSV Import Utility Library
 *
 * Core logic for the bulk CSV import feature:
 * - Column alias matching (autoMapColumns)
 * - Data normalization (normalizeValue)
 * - Row transformation (transformRow)
 * - Validation (validateRow)
 *
 * All pure functions — no React or DOM dependencies.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TransformedRow {
  [field: string]: any
  status: 'draft' | 'published' | 'archived'
  featured: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ---------------------------------------------------------------------------
// Column Alias Dictionary
// ---------------------------------------------------------------------------

export const COLUMN_ALIASES: Record<string, string[]> = {
  title: ['title', 'property name', 'name'],
  street_address: ['street address', 'address', 'property address', 'add'],
  city: ['city', 'city name'],
  state: ['state', 'state code'],
  zip_code: ['zip code', 'zipcode', 'postal code', 'zip'],
  description: ['description', 'property description'],
  square_footage: ['square footage', 'sq ft', 'sqft', 'square feet'],
  unit_type: ['unit type', 'unit type final', 'property type', 'type'],
  beds: ['beds', 'bedrooms', 'bed count'],
  baths: ['baths', 'bathrooms', 'bath count'],
  monthly_rent: ['monthly rent', 'rent', 'price'],
  landlord_name: ['landlord', 'landlord name', 'owner name'],
  landlord_email: ['landlord email', 'owner email', 'email'],
  landlord_phone: ['landlord phone number', 'landlord phone', 'phone'],
  laundry: ['laundry', 'laundry type'],
  pet_policy: ['pet policy', 'pets', 'pet friendly'],
  parking: ['parking', 'parking type'],
  furnish_level: ['furnish level', 'furnished', 'furnishing'],
  other_amenities: ['other amenities', 'other ammenities', 'amenities'],
  listing_link: ['listing link', 'listing url', 'url'],
  cover_photo_url: ['cover photo', 'cover photo url', 'photo', 'photo url', "photo's link", 'photos link'],
  photo_folder: ['photo folder', 'photos folder', 'image folder', 'photo dir'],
  featured: ['featured'],
  latitude: ['latitude', 'lat'],
  longitude: ['longitude', 'lng', 'long'],
}

// Build a reverse lookup: normalized alias → field name (computed once at module load)
const _aliasToField: Map<string, string> = new Map()
for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
  for (const alias of aliases) {
    _aliasToField.set(alias.toLowerCase(), field)
  }
}

// ---------------------------------------------------------------------------
// autoMapColumns
// ---------------------------------------------------------------------------

/**
 * Given an array of CSV header strings, returns a mapping of
 * original header → property field name for any recognized aliases.
 * Unrecognized headers are omitted from the result.
 */
export function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const header of headers) {
    const normalized = header.trim().toLowerCase()
    // Accept snake_case field keys (as produced by the export) as well as
    // human aliases: "street_address" -> "street address".
    const field =
      _aliasToField.get(normalized) ?? _aliasToField.get(normalized.replace(/_/g, ' '))
    if (field !== undefined) {
      mapping[header] = field
    }
  }
  return mapping
}

// ---------------------------------------------------------------------------
// getPropertyFields
// ---------------------------------------------------------------------------

/** Human-readable labels for property fields, for use in dropdown menus. */
const FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  street_address: 'Street Address',
  city: 'City',
  state: 'State',
  zip_code: 'Zip Code',
  description: 'Description',
  square_footage: 'Square Footage',
  unit_type: 'Unit Type',
  beds: 'Beds',
  baths: 'Baths',
  monthly_rent: 'Monthly Rent',
  landlord_name: 'Landlord Name',
  landlord_email: 'Landlord Email',
  landlord_phone: 'Landlord Phone',
  laundry: 'Laundry',
  pet_policy: 'Pet Policy',
  parking: 'Parking',
  furnish_level: 'Furnish Level',
  other_amenities: 'Other Amenities',
  listing_link: 'Listing Link',
  cover_photo_url: 'Cover Photo URL',
  photo_folder: 'Photo Folder (ZIP)',
  featured: 'Featured',
  latitude: 'Latitude',
  longitude: 'Longitude',
}

/**
 * Returns all property field options as { value, label } objects,
 * suitable for use in dropdown / select menus.
 */
export function getPropertyFields(): { value: string; label: string }[] {
  return Object.keys(COLUMN_ALIASES).map((field) => ({
    value: field,
    label: FIELD_LABELS[field] ?? field,
  }))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NUMERIC_FIELDS = new Set(['beds', 'baths', 'monthly_rent', 'latitude', 'longitude'])

/**
 * Fields that are used only during import (e.g. as a join key) and must NOT be
 * persisted to the properties table. ReviewStep strips these before sending rows
 * to the server.
 */
export const TRANSIENT_FIELDS = new Set(['photo_folder'])

/**
 * Attempt to parse a JSON array string.
 * Returns the parsed array on success, null otherwise.
 */
function tryParseJsonArray(raw: string): string[] | null {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('[')) return null
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed.map((v: unknown) => String(v).trim())
    }
  } catch {
    // not valid JSON
  }
  return null
}

/**
 * Unwrap a single-element Wix-style array like ["Single Family"] → "Single Family".
 * Only unwraps when there is exactly one element.
 * Returns null if the string doesn't look like an array.
 */
function unwrapSingleArray(raw: string): string | null {
  const arr = tryParseJsonArray(raw)
  if (arr && arr.length === 1) {
    return arr[0]
  }
  return null
}

// ---------------------------------------------------------------------------
// normalizeValue
// ---------------------------------------------------------------------------

/**
 * Normalizes a raw CSV cell string value for a given property field.
 */
export function normalizeValue(raw: string, field: string): any {
  // --- featured: always returns boolean, never null ---
  if (field === 'featured') {
    const lower = raw.trim().toLowerCase()
    if (!lower) return false
    return lower === 'true' || lower === 'yes' || lower === '1'
  }

  // --- empty check (after featured special-case) ---
  if (!raw || raw.trim() === '') return null

  const trimmed = raw.trim()

  // --- other_amenities: array handling ---
  if (field === 'other_amenities') {
    // Try JSON array first
    const jsonArr = tryParseJsonArray(trimmed)
    if (jsonArr) return jsonArr
    // Fall back to comma-split
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
  }

  // --- photo_folder: transient ZIP-matching key, keep as the plain folder name ---
  if (field === 'photo_folder') {
    return trimmed
  }

  // --- Try to unwrap single-element Wix array wrapper for non-amenity fields ---
  if (trimmed.startsWith('[')) {
    const unwrapped = unwrapSingleArray(trimmed)
    if (unwrapped !== null) {
      // Re-normalize the unwrapped value for the same field
      return normalizeValue(unwrapped, field)
    }
  }

  // --- square_footage: strip unit suffixes, handle commas ---
  if (field === 'square_footage') {
    // Remove known unit suffixes (case-insensitive), then strip commas, then parse
    const stripped = trimmed
      .replace(/\s*square\s*feet/i, '')
      .replace(/\s*sq\.?\s*ft\.?/i, '')
      .replace(/\s*sqft/i, '')
      .replace(/\s*SF$/i, '')
      .replace(/,/g, '')
      .trim()
    const num = parseFloat(stripped)
    return isNaN(num) ? null : num
  }

  // --- numeric fields ---
  if (NUMERIC_FIELDS.has(field)) {
    // Strip commas (thousands separator), then parse
    const stripped = trimmed.replace(/,/g, '')
    const num = parseFloat(stripped)
    return isNaN(num) ? null : num
  }

  // --- landlord_email: trim + validate @ ---
  if (field === 'landlord_email') {
    const email = trimmed
    if (!email.includes('@')) return null
    return email
  }

  // --- URL fields: must start with http:// or https:// ---
  if (field === 'listing_link' || field === 'cover_photo_url') {
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return null
  }

  // --- default: return trimmed string ---
  return trimmed
}

// ---------------------------------------------------------------------------
// transformRow
// ---------------------------------------------------------------------------

/**
 * Transforms a raw CSV row using the provided column mapping and normalizes values.
 * Sets defaults: status = 'draft', featured = false.
 * Auto-generates a title from the address when no title column is mapped.
 */
export function transformRow(
  row: Record<string, string>,
  mapping: Record<string, string>
): TransformedRow {
  const result: TransformedRow = {
    status: 'draft',
    featured: false,
  }

  for (const [header, field] of Object.entries(mapping)) {
    const raw = row[header] ?? ''
    const normalized = normalizeValue(raw, field)
    result[field] = normalized
  }

  // Ensure featured is always a boolean
  if (typeof result.featured !== 'boolean') {
    result.featured = false
  }

  // Auto-generate title from address if not mapped or came out null
  if (!result.title) {
    const parts: string[] = []
    if (result.street_address) parts.push(String(result.street_address))
    if (result.city) parts.push(String(result.city))
    if (result.state) parts.push(String(result.state))
    if (parts.length > 0) {
      result.title = parts.join(', ')
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// validateRow
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS: { field: string; label: string }[] = [
  { field: 'street_address', label: 'Street address' },
  { field: 'city', label: 'City' },
  { field: 'state', label: 'State' },
  { field: 'zip_code', label: 'Zip code' },
]

/**
 * Validates that a transformed row has all required fields present.
 * Returns { valid: boolean, errors: string[] }.
 */
export function validateRow(row: Record<string, any>): ValidationResult {
  const errors: string[] = []

  for (const { field, label } of REQUIRED_FIELDS) {
    const value = row[field]
    if (value === null || value === undefined || value === '') {
      errors.push(`${label} is required`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
