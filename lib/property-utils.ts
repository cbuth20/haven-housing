import { Property } from '@/types/property'

/**
 * Extract plain text from potentially JSON-formatted fields (Wix migration issue)
 * Some fields may contain {"formatted":"value"} instead of plain strings
 */
export function extractPlainText(value: string | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string' && value.includes('{"formatted"')) {
    try {
      const parsed = JSON.parse(value)
      return parsed.formatted || value
    } catch {
      return value
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
