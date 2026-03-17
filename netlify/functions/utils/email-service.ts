import * as postmark from 'postmark'

let client: postmark.ServerClient | null = null

function getPostmarkClient(): postmark.ServerClient | null {
  if (!process.env.POSTMARK_API_KEY) {
    console.warn('POSTMARK_API_KEY is not configured — skipping email')
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

/** Simple HTML entity encoding to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function emailLayout(content: string): string {
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
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 20px 40px; text-align: center; background-color: #1e40af; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">
                Haven Housing Solutions
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Haven Housing Solutions &mdash; Automated Message
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
 * Sends a magic link invitation email to a newly created user
 */
export async function sendInvitationEmail({
  to,
  fullName,
  magicLink,
}: {
  to: string
  fullName: string
  magicLink: string
}): Promise<{ success: boolean; error?: string }> {
  const pmClient = getPostmarkClient()
  if (!pmClient) return { success: true }

  try {
    const safeName = escapeHtml(fullName)
    const html = emailLayout(`
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
        Hello <strong>${safeName}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
        You've been invited to join Haven Housing Solutions. Click the button below to set up your account and create your password.
      </p>
      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background-color: #1e40af; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
              Set Up Your Account
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 20px; color: #6b7280;">
        This link will expire in 24 hours. If you did not expect this invitation, you can safely ignore this email.
      </p>
      <p style="margin: 0; font-size: 16px; line-height: 24px; color: #374151;">
        Best regards,<br>
        <strong>Haven Housing Solutions Team</strong>
      </p>
    `)

    await pmClient.sendEmail({
      From: `Haven Housing Solutions <${getFromEmail()}>`,
      To: to,
      Subject: "You've been invited to Haven Housing Solutions",
      HtmlBody: html,
      MessageStream: 'outbound',
    })

    console.log('Invitation email sent successfully:', { to })
    return { success: true }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Sends a temporary password email to a newly created user
 */
export async function sendTempPasswordEmail({
  to,
  fullName,
  email,
  tempPassword,
}: {
  to: string
  fullName: string
  email: string
  tempPassword: string
}): Promise<{ success: boolean; error?: string }> {
  const pmClient = getPostmarkClient()
  if (!pmClient) return { success: true }

  try {
    const safeName = escapeHtml(fullName)
    const loginUrl = `${getAppUrl()}/login`

    const html = emailLayout(`
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
        Hello <strong>${safeName}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
        Your account has been created for Haven Housing Solutions. Use the credentials below to sign in:
      </p>
      <!-- Credentials Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; margin: 24px 0;">
        <tr>
          <td style="padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 12px;">
                  <span style="display: block; font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 4px;">Email</span>
                  <span style="display: block; font-size: 15px; color: #111827; font-family: monospace;">${escapeHtml(email)}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span style="display: block; font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 4px;">Temporary Password</span>
                  <span style="display: block; font-size: 15px; color: #111827; font-family: monospace;">${escapeHtml(tempPassword)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center">
            <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1e40af; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
              Sign In to Your Account
            </a>
          </td>
        </tr>
      </table>
      <!-- Security Notice -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; margin: 24px 0;">
        <tr>
          <td style="padding: 12px 16px;">
            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #92400e;">
              <strong>Important:</strong> You will be asked to set a new password when you first sign in.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin: 0; font-size: 16px; line-height: 24px; color: #374151;">
        Best regards,<br>
        <strong>Haven Housing Solutions Team</strong>
      </p>
    `)

    await pmClient.sendEmail({
      From: `Haven Housing Solutions <${getFromEmail()}>`,
      To: to,
      Subject: 'Your Haven Housing Solutions Account',
      HtmlBody: html,
      MessageStream: 'outbound',
    })

    console.log('Temp password email sent successfully:', { to })
    return { success: true }
  } catch (error) {
    console.error('Error sending temp password email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
