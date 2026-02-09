'use client'

import { useEffect, useRef, useState } from 'react'
import { Property } from '@/types/property'
import { loadGoogleMaps } from '@/lib/google-maps'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'

interface MapViewProps {
  properties: Property[]
  center?: { lat: number; lng: number }
  zoom?: number
  onMarkerClick?: (property: Property) => void
  className?: string
}

export function MapView({
  properties,
  center = { lat: 39.8283, lng: -98.5795 }, // Center of USA
  zoom = 4,
  onMarkerClick,
  className = 'w-full h-96',
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        await loadGoogleMaps()

        if (!mapRef.current) return

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        mapInstanceRef.current = map

        // Create info window
        infoWindowRef.current = new google.maps.InfoWindow()

        setIsLoading(false)
      } catch (err: any) {
        console.error('Error loading Google Maps:', err)
        setError(err.message || 'Failed to load map')
        setIsLoading(false)
      }
    }

    initMap()
  }, [center.lat, center.lng, zoom])

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current || !properties.length) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds()

    // Add new markers
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return

      const position = {
        lat: Number(property.latitude),
        lng: Number(property.longitude),
      }

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current!,
        title: property.title,
        animation: google.maps.Animation.DROP,
      })

      // Add click listener
      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(property)
        }

        // Show info window
        const content = `
          <div style="padding: 8px; max-width: 250px;">
            ${
              property.cover_photo_url
                ? `<img src="${property.cover_photo_url}" alt="${property.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
                : ''
            }
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${property.title}</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 8px;">
              ${property.city}, ${property.state}
            </p>
            ${
              property.beds || property.baths
                ? `<p style="color: #666; font-size: 14px; margin-bottom: 8px;">
                ${property.beds ? `${property.beds} bed${property.beds > 1 ? 's' : ''}` : ''}
                ${property.beds && property.baths ? '•' : ''}
                ${property.baths ? `${property.baths} bath${property.baths > 1 ? 's' : ''}` : ''}
              </p>`
                : ''
            }
            ${
              property.monthly_rent
                ? `<p style="color: #063665; font-weight: bold; font-size: 16px;">
                ${formatCurrency(property.monthly_rent)}/mo
              </p>`
                : ''
            }
          </div>
        `

        infoWindowRef.current?.setContent(content)
        infoWindowRef.current?.open(mapInstanceRef.current!, marker)
      })

      markersRef.current.push(marker)
      bounds.extend(position)
    })

    // Fit map to show all markers
    if (properties.length > 0) {
      mapInstanceRef.current.fitBounds(bounds)

      // Don't zoom in too much for a single marker
      const listener = google.maps.event.addListener(
        mapInstanceRef.current,
        'idle',
        () => {
          if (properties.length === 1 && mapInstanceRef.current!.getZoom()! > 15) {
            mapInstanceRef.current!.setZoom(15)
          }
          google.maps.event.removeListener(listener)
        }
      )
    }
  }, [properties, onMarkerClick])

  if (error) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold mb-2">Failed to load map</p>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-4">
            Make sure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
          <LoadingSpinner size="lg" />
        </div>
      )}
      <div ref={mapRef} className={`${className} rounded-lg ${isLoading ? 'hidden' : ''}`} />
    </div>
  )
}
