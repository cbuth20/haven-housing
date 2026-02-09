import { Handler, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface AuthenticatedEvent extends HandlerEvent {
  userId: string
  userRole: string
}

export function requireAuth(handler: (event: AuthenticatedEvent) => Promise<any>): Handler {
  return async (event) => {
    try {
      // Get authorization header
      const authHeader = event.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Unauthorized - No token provided' }),
        }
      }

      const token = authHeader.replace('Bearer ', '')

      // Create Supabase client
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Verify the JWT token
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Unauthorized - Invalid token' }),
        }
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Unauthorized - No user profile' }),
        }
      }

      // Add user info to event
      const authenticatedEvent = {
        ...event,
        userId: user.id,
        userRole: profile.role,
      } as AuthenticatedEvent

      // Call the actual handler
      return await handler(authenticatedEvent)
    } catch (error: any) {
      console.error('Auth middleware error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' }),
      }
    }
  }
}

export function requireAdmin(handler: (event: AuthenticatedEvent) => Promise<any>): Handler {
  return requireAuth(async (event) => {
    if (event.userRole !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Forbidden - Admin access required' }),
      }
    }

    return await handler(event)
  })
}
