/**
 * Builds the field set to write when a bulk CSV import updates an EXISTING
 * property. Kept as a pure function so the safety rules below are unit-testable.
 *
 * Rules:
 * - Only fields the CSV actually supplied (the `provided` keys) are written, so
 *   schema-default fields the parser injects (e.g. country='USA') don't clobber
 *   existing values.
 * - status / featured / created_by / owner_id are never written — an import must
 *   refresh data/photos without unpublishing, un-featuring, or re-owning a live
 *   listing. (transformRow always injects status:'draft'/featured:false and the
 *   schema re-defaults them, so they must be filtered out here.)
 * - Blank cells (null/undefined) are skipped, so an empty column never wipes an
 *   existing value to null.
 */

export const PROTECTED_ON_UPDATE = new Set(['status', 'featured', 'created_by', 'owner_id'])

export function buildPropertyUpdate(
  provided: Record<string, any>,
  parsed: Record<string, any>
): Record<string, any> {
  const updateData: Record<string, any> = {}
  for (const key of Object.keys(provided)) {
    if (PROTECTED_ON_UPDATE.has(key)) continue
    if (!(key in parsed)) continue
    const value = parsed[key]
    if (value === null || value === undefined) continue
    updateData[key] = value
  }
  return updateData
}
