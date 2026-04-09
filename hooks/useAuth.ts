import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const store = useAuthStore()
  const { session, user, isLoading, isAuthenticated, initialized, initialize, setUser, signIn, signUp, signOut } = store
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current && !initialized) {
      hasInitialized.current = true
      initialize()
    }
  }, [initialize, initialized])

  // Fetch profile from user_profiles when authenticated but profile not yet loaded.
  // This is separate from the auth listener to avoid race conditions.
  useEffect(() => {
    if (isAuthenticated && session?.user && !user) {
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile }) => {
          setUser(profile)
        })
    }
  }, [isAuthenticated, session, user, setUser])

  const isAdmin = user?.role === 'admin'

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn,
    signUp,
    signOut,
  }
}
