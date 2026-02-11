'use client'

import { useEffect, useRef, useState, memo } from 'react'
import { loadGoogleMaps } from '@/lib/google-maps'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface StreetViewEmbedProps {
  latitude: number
  longitude: number
  address: string
  className?: string
}

export const StreetViewEmbed = memo(function StreetViewEmbed({
  latitude,
  longitude,
  address,
  className = 'w-full h-96',
}: StreetViewEmbedProps) {
  const streetViewRef = useRef<HTMLDivElement>(null)
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    let cancelled = false

    const initStreetView = async () => {
      try {
        await loadGoogleMaps()

        if (cancelled || !streetViewRef.current) return

        const position = { lat: latitude, lng: longitude }
        const streetViewService = new google.maps.StreetViewService()

        streetViewService.getPanorama(
          { location: position, radius: 100 },
          (data, status) => {
            if (cancelled || !streetViewRef.current) return

            if (status === google.maps.StreetViewStatus.OK && data) {
              panoramaRef.current = new google.maps.StreetViewPanorama(
                streetViewRef.current,
                {
                  position: data.location?.latLng || position,
                  pov: { heading: 0, pitch: 0 },
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
              setIsAvailable(false)
            }
            setIsLoading(false)
          }
        )
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load Street View')
          setIsLoading(false)
        }
      }
    }

    initStreetView()

    return () => {
      cancelled = true
      if (panoramaRef.current) {
        panoramaRef.current.setVisible(false)
        panoramaRef.current = null
      }
    }
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

  if (!isLoading && !isAvailable) {
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

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <LoadingSpinner size="lg" />
        </div>
      )}
      <div
        ref={streetViewRef}
        className={`w-full h-full rounded-lg overflow-hidden ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
})
