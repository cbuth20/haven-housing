import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'DELETE') {
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

    // Prevent self-deletion
    if (userId === (event as any).userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'You cannot delete your own account' }),
      }
    }

    // Delete from Supabase Auth (this will cascade to user_profiles via trigger)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Failed to delete user:', deleteError)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Failed to delete user' }),
      }
    }

    // Also explicitly delete the profile in case there's no cascade
    await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'User deleted successfully' }),
    }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
