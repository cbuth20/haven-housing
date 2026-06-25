'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthOnlyProps {
  children: ReactNode
}

/**
 * Renders its children only for authenticated users. Used to gate
 * sensitive listing details (e.g. monthly rent) from logged-out visitors.
 *
 * Convention: use <AuthOnly> when the surrounding component is a server
 * component (or otherwise doesn't already read auth). In client components
 * that already call useAuth() to gate other fields, gate inline with
 * `isAuthenticated && ...` instead of nesting another hook subscription.
 */
export function AuthOnly({ children }: AuthOnlyProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return <>{children}</>
}
