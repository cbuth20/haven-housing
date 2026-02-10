import { Property } from '@/types/property'

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

  // Fallback to address
  if (property.street_address) {
    return property.street_address
  }

  // Fallback to city/state
  if (property.city && property.state) {
    return `${property.city}, ${property.state}`
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
