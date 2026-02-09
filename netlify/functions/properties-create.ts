import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import { PropertySchema } from './utils/validation'

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')

    // Validate the property data
    const validatedData = PropertySchema.parse(body)

    // Insert the property
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert({
        ...validatedData,
        created_by: event.userId,
        owner_id: event.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to create property', error: error.message }),
      }
    }

    return {
      statusCode: 201,
      body: JSON.stringify(data),
    }
  } catch (error: any) {
    console.error('Error creating property:', error)

    if (error.name === 'ZodError') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation error',
          errors: error.errors,
        }),
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
