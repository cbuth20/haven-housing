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
    const { id, ...updateData } = body

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Property ID is required' }),
      }
    }

    // Validate the property data (partial update allowed)
    const validatedData = PropertySchema.partial().parse(updateData)

    // Update the property
    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to update property', error: error.message }),
      }
    }

    if (!data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Property not found' }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (error: any) {
    console.error('Error updating property:', error)

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
