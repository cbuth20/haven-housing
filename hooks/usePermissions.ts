import { useAuth } from './useAuth'

export function usePermissions() {
  const { user, isAuthenticated } = useAuth()

  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'client'

  return {
    isAdmin,
    isClient,
    isAuthenticated,
    canCreateProperty: isAdmin,
    canEditProperty: isAdmin,
    canDeleteProperty: isAdmin,
    canViewSubmissions: isAdmin,
    canApproveSubmissions: isAdmin,
    canManageUsers: isAdmin,
    canViewAllProperties: isAuthenticated,
    canViewPublishedProperties: true,
  }
}
