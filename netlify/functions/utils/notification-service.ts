import * as postmark from 'postmark'

// Per-form-type recipient mappings
const FORM_RECIPIENTS: Record<string, string[]> = {
  'housing-request': ['merrick@havenhousingsolutions.com'],
  'claims': ['merrick@havenhousingsolutions.com'],
  'property': ['merrick@havenhousingsolutions.com'],
  'contact': ['merrick@havenhousingsolutions.com'],
  'insurance': ['merrick@havenhousingsolutions.com'],
  'corporate': ['merrick@havenhousingsolutions.com'],
  'government': ['merrick@havenhousingsolutions.com'],
}

// Header color per form type for visual distinction
const FORM_COLORS: Record<string, string> = {
  'housing-request': '#1e40af',  // blue
  'claims': '#b45309',           // amber
  'property': '#047857',         // green
  'contact': '#6d28d9',          // purple
  'insurance': '#1e40af',        // blue
  'corporate': '#0e7490',        // cyan
  'government': '#4338ca',       // indigo
}

// Badge labels per form type
const FORM_BADGES: Record<string, string> = {
  'housing-request': 'HOUSING REQUEST',
  'claims': 'INSURANCE CLAIM',
  'property': 'PROPERTY SUBMISSION',
  'contact': 'CONTACT INQUIRY',
  'insurance': 'INSURANCE RELOCATION',
  'corporate': 'CORPORATE RELOCATION',
  'government': 'GOVERNMENT LODGING',
}

let client: postmark.ServerClient | null = null

function getPostmarkClient(): postmark.ServerClient | null {
  if (!process.env.POSTMARK_API_KEY) {
    console.warn('POSTMARK_API_KEY is not configured — skipping email notification')
    return null
  }
  if (!client) {
    client = new postmark.ServerClient(process.env.POSTMARK_API_KEY)
  }
  return client
}

function getFromEmail(): string {
  return process.env.POSTMARK_FROM_EMAIL || 'noreply@havenhousingsolutions.com'
}

function getAppUrl(): string {
  return process.env.URL || process.env.NEXT_PUBLIC_APP_URL || 'https://havenhousingsolutions.com'
}

/**
 * Formats a key-value data object into readable HTML rows
 */
function formatDataRows(data: Record<string, any>, exclude: string[] = []): string {
  return Object.entries(data)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, value]) => {
      if (value === null || value === undefined || value === '') return ''
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim()
      return `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; white-space: nowrap; vertical-align: top;">${label}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${String(value)}</td>
        </tr>`
    })
    .filter(Boolean)
    .join('')
}

/**
 * Generates the notification email HTML with form-type-specific styling
 */
function generateNotificationHtml(
  formCategory: string,
  formType: string,
  data: Record<string, any>,
  adminPath: string,
  exclude: string[] = []
): string {
  const dataRows = formatDataRows(data, exclude)
  const headerColor = FORM_COLORS[formCategory] || '#1e40af'
  const badge = FORM_BADGES[formCategory] || 'FORM SUBMISSION'
  const adminUrl = `${getAppUrl()}${adminPath}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background-color: ${headerColor}; border-radius: 8px 8px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(255,255,255,0.2); border-radius: 4px; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">
                      ${badge}
                    </span>
                    <h1 style="margin: 8px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 600;">
                      New ${formType}
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                      ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver', dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 24px 40px 16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                ${dataRows}
              </table>
            </td>
          </tr>
          <!-- Admin Link -->
          <tr>
            <td style="padding: 8px 40px 32px 40px;" align="center">
              <a href="${adminUrl}" style="display: inline-block; padding: 12px 28px; background-color: ${headerColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                View in Admin Dashboard
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Haven Housing Solutions — Automated Notification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

/**
 * Sends a notification email for a form submission.
 * Non-blocking — logs errors but never throws.
 *
 * @param formCategory - Key into FORM_RECIPIENTS (e.g. 'contact', 'property', 'claims')
 * @param formType - Human-readable form name for the email heading
 * @param subject - Email subject line
 * @param data - Key-value pairs to display in the email body
 * @param adminPath - Path to the relevant admin page (e.g. '/admin/submissions')
 * @param exclude - Keys to omit from the data table
 */
export async function sendFormNotification(
  formCategory: string,
  formType: string,
  subject: string,
  data: Record<string, any>,
  adminPath: string = '/admin',
  exclude: string[] = []
): Promise<void> {
  const pmClient = getPostmarkClient()
  if (!pmClient) return

  const recipients = FORM_RECIPIENTS[formCategory] || ['merrick@havenhousingsolutions.com']

  try {
    const html = generateNotificationHtml(formCategory, formType, data, adminPath, exclude)

    await pmClient.sendEmail({
      From: getFromEmail(),
      To: recipients.join(','),
      Subject: subject,
      HtmlBody: html,
      MessageStream: 'outbound',
    })

    console.log(`Notification email sent for ${formType} to ${recipients.join(', ')}`)
  } catch (error) {
    console.error('Failed to send notification email:', error)
  }
}
