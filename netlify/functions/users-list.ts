import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    // Fetch all users from user_profiles, ordered by created_at DESC
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to fetch users', error: error.message }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ users }),
    }
  } catch (error: any) {
    console.error('Error fetching users:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
