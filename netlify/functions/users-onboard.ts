import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAuth } from './utils/auth-middleware'

const handler: Handler = requireAuth(async (event) => {
  // Handle CORS preflight
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
    const body = JSON.parse(event.body || '{}')
    const { password, full_name } = body

    // Validate password
    if (!password || typeof password !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Password is required' }),
      }
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Password must be at least 8 characters' }),
      }
    }

    if (!/[A-Z]/.test(password)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Password must contain an uppercase letter' }),
      }
    }

    if (!/[a-z]/.test(password)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Password must contain a lowercase letter' }),
      }
    }

    if (!/[0-9]/.test(password)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Password must contain a number' }),
      }
    }

    // Set password via admin API (service role authority)
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      event.userId,
      { password }
    )

    if (passwordError) {
      console.error('Failed to set password:', passwordError)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Failed to set password' }),
      }
    }

    // Update profile: set is_onboarded = true, optionally update full_name
    const updateData: Record<string, any> = { is_onboarded: true }
    if (full_name && typeof full_name === 'string' && full_name.trim()) {
      updateData.full_name = full_name.trim()
    }

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', event.userId)

    if (profileError) {
      console.error('Failed to update profile:', profileError)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Failed to update profile' }),
      }
    }

    // Verify the update persisted
    const { data: profile, error: verifyError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', event.userId)
      .single()

    if (verifyError || !profile?.is_onboarded) {
      console.error('Onboarding verification failed:', verifyError)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Onboarding update could not be verified' }),
      }
    }

    console.log('User onboarding completed:', event.userId)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Onboarding completed',
        profile: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          is_onboarded: profile.is_onboarded,
        },
      }),
    }
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
