import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Detect server vs browser — SSR has no navigator.locks, localStorage, etc.
const isServer = typeof window === 'undefined'

// Client-side Supabase client (for use in client components)
// On the server, disable auth features that require browser APIs (navigator.locks, localStorage)
// to prevent AbortError during Next.js SSR.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isServer,
    autoRefreshToken: !isServer,
    detectSessionInUrl: !isServer,
    flowType: 'implicit',
  }
})

// Server-side Supabase client (for use in server components and API routes)
// This bypasses RLS and should only be used server-side
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

// Helper function to get current user profile
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Helper function to check if user is admin
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'admin'
}
