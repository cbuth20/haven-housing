/**
 * Honeypot bot detection (shared by public form-submission functions).
 *
 * The form renders a hidden field (see components/common/Honeypot.tsx) that real
 * users never see or fill. Bots that blindly populate every field will fill it,
 * so a non-empty value flags the request as a bot.
 *
 * Field name MUST match HONEYPOT_NAME in components/common/Honeypot.tsx.
 */
export const HONEYPOT_FIELD = 'company_website'

/** True if the submission tripped the honeypot (i.e. looks like a bot). */
export function isBotSubmission(data: Record<string, any> | null | undefined): boolean {
  if (!data || typeof data !== 'object') return false
  const v = (data as Record<string, unknown>)[HONEYPOT_FIELD]
  return typeof v === 'string' && v.trim().length > 0
}
