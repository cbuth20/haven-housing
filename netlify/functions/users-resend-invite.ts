import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import { sendInvitationEmail } from './utils/email-service'

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const { userId } = JSON.parse(event.body || '{}')

    if (!userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'userId is required' }),
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'User not found' }),
      }
    }

    // Generate a new magic link
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: profile.email,
      })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('Failed to generate magic link:', linkError)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Failed to generate invitation link' }),
      }
    }

    const appUrl =
      process.env.URL || process.env.NEXT_PUBLIC_APP_URL || 'https://havenhousingsolutions.com'
    const magicLink = `${appUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`

    const emailResult = await sendInvitationEmail({
      to: profile.email,
      fullName: profile.full_name || profile.email,
      magicLink,
    })

    if (!emailResult.success) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Failed to send invitation email' }),
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Invitation resent successfully' }),
    }
  } catch (error: any) {
    console.error('Error resending invite:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
