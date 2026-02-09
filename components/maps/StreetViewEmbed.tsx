'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '@/lib/google-maps'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface StreetViewEmbedProps {
  latitude: number
  longitude: number
  address: string
  className?: string
}

export function StreetViewEmbed({
  latitude,
  longitude,
  address,
  className = 'w-full h-96',
}: StreetViewEmbedProps) {
  const streetViewRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    const initStreetView = async () => {
      try {
        setIsLoading(true)
        setError(null)

        await loadGoogleMaps()

        if (!streetViewRef.current) return

        const position = { lat: latitude, lng: longitude }

        // Check if Street View is available at this location
        const streetViewService = new google.maps.StreetViewService()
        const STREETVIEW_MAX_DISTANCE = 100 // meters

        streetViewService.getPanorama(
          {
            location: position,
            radius: STREETVIEW_MAX_DISTANCE,
          },
          (data, status) => {
            if (status === google.maps.StreetViewStatus.OK && data) {
              // Street View is available
              const panorama = new google.maps.StreetViewPanorama(
                streetViewRef.current!,
                {
                  position: data.location?.latLng || position,
                  pov: {
                    heading: 0,
                    pitch: 0,
                  },
                  zoom: 1,
                  addressControl: true,
                  linksControl: true,
                  panControl: true,
                  enableCloseButton: false,
                  fullscreenControl: true,
                }
              )
              setIsAvailable(true)
            } else {
              // Street View not available
              setIsAvailable(false)
            }
            setIsLoading(false)
          }
        )
      } catch (err: any) {
        console.error('Error loading Street View:', err)
        setError(err.message || 'Failed to load Street View')
        setIsLoading(false)
      }
    }

    initStreetView()
  }, [latitude, longitude])

  if (error) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold mb-2">Failed to load Street View</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAvailable) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center p-8">
          <p className="text-gray-600 font-semibold mb-2">Street View Not Available</p>
          <p className="text-sm text-gray-500">
            Street View imagery is not available for this location
          </p>
          <p className="text-xs text-gray-400 mt-2">{address}</p>
        </div>
      </div>
    )
  }

  return <div ref={streetViewRef} className={`${className} rounded-lg overflow-hidden`} />
}
