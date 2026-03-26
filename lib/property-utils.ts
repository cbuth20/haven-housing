import { Property } from '@/types/property'

/**
 * Extract plain text from potentially JSON-formatted fields (Wix migration issue)
 * Some fields may contain {"formatted":"value"} instead of plain strings
 */
export function extractPlainText(value: string | null | undefined): string {
  if (!value) return ''

  // Handle JSON-formatted fields from Wix migration
  // Some fields contain {"formatted":"value"} or other JSON structures
  if (typeof value === 'string') {
    // Try to extract "formatted" field from JSON
    if (value.includes('{"formatted"')) {
      try {
        const parsed = JSON.parse(value)
        return parsed.formatted || value
      } catch {
        // Fall through to other cleanup
      }
    }

    // Strip any JSON object/array content that got appended to address fields
    // e.g. "Millsboro, DE {"subdivisions":[...],"city":"Millsboro",...}"
    const jsonStart = value.search(/\s*[{[]/)
    if (jsonStart > 0) {
      const before = value.substring(0, jsonStart).trim()
      // Only use the pre-JSON portion if it looks like meaningful text
      if (before.length > 0) {
        // Try to parse the JSON portion to extract useful fields like city
        try {
          const jsonPart = value.substring(jsonStart)
          const parsed = JSON.parse(jsonPart)
          // If the JSON has a "city" or "formatted" field, prefer that
          if (parsed.formatted) return parsed.formatted
        } catch {
          // JSON didn't parse cleanly, just use the text before it
        }
        return before
      }
    }

    // Handle values that are entirely JSON objects/arrays
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        const parsed = JSON.parse(value)
        // Try common field names for plain text values
        if (parsed.formatted) return parsed.formatted
        if (parsed.city) return parsed.city
        if (parsed.name) return parsed.name
        if (parsed.value) return parsed.value
        // If it's an array, return empty - it's not displayable text
        if (Array.isArray(parsed)) return ''
        return ''
      } catch {
        // Not valid JSON, return as-is
        return value
      }
    }
  }

  return value
}

/**
 * Get a display-friendly title for a property
 * If title is missing or "Untitled Property", use the address instead
 */
export function getPropertyDisplayTitle(property: Property): string {
  if (property.title &&
      property.title.trim() !== '' &&
      property.title !== 'Untitled Property') {
    return property.title
  }

  // Fallback to address (handle JSON-formatted fields from Wix migration)
  const streetAddress = extractPlainText(property.street_address)
  if (streetAddress) {
    return streetAddress
  }

  // Fallback to city/state
  const city = extractPlainText(property.city)
  const state = extractPlainText(property.state)
  if (city && state) {
    return `${city}, ${state}`
  }

  // Last resort
  return 'Property'
}

/**
 * Get a short display title (for cards, truncated)
 */
export function getPropertyShortTitle(property: Property, maxLength: number = 50): string {
  const title = getPropertyDisplayTitle(property)
  if (title.length <= maxLength) {
    return title
  }
  return title.substring(0, maxLength) + '...'
}
