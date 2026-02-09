import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function useAuth() {
  const { user, isLoading, isAuthenticated, initialize, signIn, signUp, signOut } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    signIn,
    signUp,
    signOut,
  }
}
