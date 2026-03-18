'use client'

import { useAuth } from '@/hooks/useAuth'

interface PropertyAddressProps {
  streetAddress: string
  city: string
  state: string
  zipCode: string
}

export function PropertyAddressHeading({ streetAddress, city, state, zipCode }: PropertyAddressProps) {
  const { isAuthenticated } = useAuth()

  return (
    <h1 className="text-3xl font-heading font-bold text-navy mb-2">
      {isAuthenticated ? `${streetAddress}, ${city}, ${state} ${zipCode}` : `${city}, ${state} ${zipCode}`}
    </h1>
  )
}

export function PropertyAddressSubtext({ streetAddress, city, state, zipCode }: PropertyAddressProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return <span>{streetAddress}, {city}, {state} {zipCode}</span>
}
