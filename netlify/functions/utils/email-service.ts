import { Resend } from 'resend'

// Initialize Resend client lazily to avoid errors if API key is not set
let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return resend
}

/**
 * Generates HTML content for welcome email
 */
function generateWelcomeEmailHtml(
  fullName: string,
  email: string,
  temporaryPassword: string
): string {
  const loginUrl = `${process.env.URL || 'http://localhost:3000'}/login`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Haven Housing Solutions</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #1e40af; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Welcome to Haven Housing Solutions
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                Hello <strong>${fullName}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                Your account has been created for Haven Housing Solutions. You can now access the platform using the credentials below:
              </p>

              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <span style="display: block; font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 4px;">Email</span>
                          <span style="display: block; font-size: 16px; color: #111827; font-family: monospace;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="display: block; font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 4px;">Temporary Password</span>
                          <span style="display: block; font-size: 16px; color: #111827; font-family: monospace;">${temporaryPassword}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1e40af; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Login to Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; margin: 30px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #92400e;">
                      <strong>⚠️ Important:</strong> For security reasons, please change your password immediately after your first login.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #374151;">
                Best regards,<br>
                <strong>Haven Housing Solutions Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Sends a welcome email to a newly created user with login credentials
 */
export async function sendWelcomeEmail(
  to: string,
  fullName: string,
  email: string,
  temporaryPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error('RESEND_FROM_EMAIL environment variable is not set')
    }

    const htmlContent = generateWelcomeEmailHtml(fullName, email, temporaryPassword)

    // Send email via Resend
    const resendClient = getResendClient()
    const { data, error } = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: to,
      subject: 'Welcome to Haven Housing Solutions - Your Account Credentials',
      html: htmlContent,
    })

    if (error) {
      console.error('Resend API error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }

    console.log('Welcome email sent successfully:', { to, emailId: data?.id })
    return { success: true }

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
