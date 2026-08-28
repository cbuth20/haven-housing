/**
 * Public property page URL helpers, shared by the admin details modal and the
 * CSV export so both produce identical links.
 */
export function getPropertyPath(id: string): string {
  return `/properties/${id}`
}

export function getPropertyUrl(id: string, origin: string): string {
  return `${origin}${getPropertyPath(id)}`
}
