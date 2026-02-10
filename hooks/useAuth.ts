import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function useAuth() {
  const { user, isLoading, isAuthenticated, initialized, initialize, signIn, signUp, signOut } = useAuthStore()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current && !initialized) {
      hasInitialized.current = true
      initialize()
    }
  }, [initialize, initialized])

  const isAdmin = user?.role === 'admin'

  console.log('🔐 useAuth:', { user, isLoading, isAuthenticated, isAdmin, userRole: user?.role })

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
