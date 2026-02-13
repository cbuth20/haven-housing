import { Handler, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface AuthenticatedEvent extends HandlerEvent {
  userId: string
  userRole: string
}

export interface OptionalAuthEvent extends HandlerEvent {
  userId: string | null
  userRole: string | null
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

      // Get user profile to check role (using service role to bypass RLS)
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
      const { data: profile, error: profileError } = await supabaseAdmin
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

export function optionalAuth(handler: (event: OptionalAuthEvent) => Promise<any>): Handler {
  return async (event) => {
    try {
      const authHeader = event.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const optionalEvent = {
          ...event,
          userId: null,
          userRole: null,
        } as OptionalAuthEvent
        return await handler(optionalEvent)
      }

      const token = authHeader.replace('Bearer ', '')
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        const optionalEvent = {
          ...event,
          userId: null,
          userRole: null,
        } as OptionalAuthEvent
        return await handler(optionalEvent)
      }

      // Get user profile using service role to bypass RLS
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const optionalEvent = {
        ...event,
        userId: user.id,
        userRole: profile?.role || null,
      } as OptionalAuthEvent
      return await handler(optionalEvent)
    } catch (error: any) {
      console.error('Optional auth middleware error:', error)
      const optionalEvent = {
        ...event,
        userId: null,
        userRole: null,
      } as OptionalAuthEvent
      return await handler(optionalEvent)
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
