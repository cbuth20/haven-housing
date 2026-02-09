import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { id } = body

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Property ID is required' }),
      }
    }

    // Delete the property
    const { error } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to delete property', error: error.message }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Property deleted successfully' }),
    }
  } catch (error: any) {
    console.error('Error deleting property:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
