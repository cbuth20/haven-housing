import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import { CreateUserSchema } from './utils/validation'
import { sendInvitationEmail, sendTempPasswordEmail } from './utils/email-service'
import { randomUUID } from 'crypto'

const handler: Handler = requireAdmin(async (event) => {
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
    console.log('=== Users Create Endpoint Called ===')
    const body = JSON.parse(event.body || '{}')
    console.log('Request body:', { ...body, temp_password: '[REDACTED]' })

    // Validate the user data
    const validatedData = CreateUserSchema.parse(body)
    const useTempPassword = validatedData.use_temp_password === true
    console.log('Validation passed, mode:', useTempPassword ? 'temp_password' : 'magic_link')

    // Check for duplicate email in user_profiles
    const { data: existingUser } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'User with this email already exists' }),
      }
    }

    // Create user in Supabase Auth
    const password = useTempPassword ? validatedData.temp_password! : randomUUID()
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: validatedData.full_name,
        role: validatedData.role,
      },
    })

    if (authError || !authUser.user) {
      console.error('Auth error:', authError)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Failed to create user in authentication system',
          error: authError?.message,
        }),
      }
    }

    // Wait for trigger to create profile, then update it
    let profileData = null
    let lastError = null

    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          full_name: validatedData.full_name,
          role: validatedData.role,
        })
        .eq('id', authUser.user.id)
        .select()
        .single()

      if (data) {
        profileData = data
        break
      }

      lastError = error
      console.log(`Profile update attempt ${attempt + 1} failed:`, error?.message)
    }

    if (!profileData) {
      console.error('Profile update failed after retries:', lastError)
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Failed to update user profile after multiple attempts',
          error: lastError?.message || 'Profile not found',
        }),
      }
    }

    console.log('Profile updated successfully:', profileData.id)

    // Send email based on mode
    let emailWarning: string | undefined

    if (useTempPassword) {
      // Temp password mode — send credentials email
      try {
        const emailResult = await sendTempPasswordEmail({
          to: validatedData.email,
          fullName: validatedData.full_name,
          email: validatedData.email,
          tempPassword: validatedData.temp_password!,
        })
        if (!emailResult.success) {
          console.error('Email sending failed:', emailResult.error)
          emailWarning = 'User created but welcome email failed to send'
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        emailWarning = 'User created but welcome email failed to send'
      }
    } else {
      // Magic link mode — generate link and send invitation
      try {
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: validatedData.email,
          })

        if (linkError || !linkData?.properties?.hashed_token) {
          console.error('Failed to generate magic link:', linkError)
          // Rollback: delete the auth user since they can't sign in
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
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
          to: validatedData.email,
          fullName: validatedData.full_name,
          magicLink,
        })

        if (!emailResult.success) {
          console.error('Email sending failed:', emailResult.error)
          emailWarning = 'User created but invitation email failed to send'
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        emailWarning = 'User created but invitation email failed to send'
      }
    }

    console.log('User created successfully, returning response')
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          role: profileData.role,
          created_at: profileData.created_at,
        },
        warning: emailWarning,
      }),
    }
  } catch (error: any) {
    console.error('Error creating user:', error)

    if (error.name === 'ZodError') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Validation error',
          errors: error.errors,
        }),
      }
    }

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
