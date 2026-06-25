'use client'

import { Property } from '@/types/property'
import { MapView } from '@/components/maps/MapView'
import { useAuth } from '@/hooks/useAuth'

interface PropertyLocationMapProps {
  property: Property
}

/**
 * Client wrapper around MapView for the (server-rendered) property detail page.
 * Forwards the viewer's auth state so the map info window can show rent to
 * authenticated users while hiding it from logged-out visitors.
 */
export function PropertyLocationMap({ property }: PropertyLocationMapProps) {
  const { isAuthenticated } = useAuth()

  return (
    <MapView
      properties={[property]}
      center={{
        lat: Number(property.latitude),
        lng: Number(property.longitude),
      }}
      zoom={15}
      className="w-full h-96"
      isAuthenticated={isAuthenticated}
    />
  )
}
