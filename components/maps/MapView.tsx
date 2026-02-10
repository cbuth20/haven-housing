'use client'

import { useEffect, useRef, useState } from 'react'
import { Property } from '@/types/property'
import { loadGoogleMaps } from '@/lib/google-maps'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { getPropertyDisplayTitle } from '@/lib/property-utils'

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

  // Initialize map (only once)
  useEffect(() => {
    const initMap = async () => {
      try {
        console.log('🗺️ MapView: Starting initialization...')
        setIsLoading(true)
        setError(null)

        console.log('🗺️ MapView: Loading Google Maps API...')
        await loadGoogleMaps()

        console.log('🗺️ MapView: Google Maps loaded, checking mapRef...')
        if (!mapRef.current) {
          console.error('🗺️ MapView: mapRef.current is null!')
          return
        }

        console.log('🗺️ MapView: Creating map with center:', center, 'zoom:', zoom)
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
        console.log('🗺️ MapView: Map created successfully!')

        // Create info window
        infoWindowRef.current = new google.maps.InfoWindow()

        // Trigger resize to ensure map renders properly
        setTimeout(() => {
          google.maps.event.trigger(map, 'resize')
          map.setCenter(center)
          console.log('🗺️ MapView: Triggered resize event')
        }, 100)

        setIsLoading(false)
      } catch (err: any) {
        console.error('🗺️ MapView: Error loading Google Maps:', err)
        setError(err.message || 'Failed to load map')
        setIsLoading(false)
      }
    }

    initMap()
  }, []) // Only run once on mount

  // Update center and zoom when they change (without re-initializing)
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return

    console.log('🗺️ MapView: Updating center to:', center, 'zoom:', zoom)
    mapInstanceRef.current.setCenter(center)
    mapInstanceRef.current.setZoom(zoom)
  }, [center.lat, center.lng, zoom, isLoading])

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return

    console.log('🗺️ MapView: Updating markers for', properties.length, 'properties')

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // If no properties, return early
    if (properties.length === 0) return

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds()
    let hasValidMarkers = false

    // Add new markers
    properties.forEach((property, index) => {
      if (!property.latitude || !property.longitude) return

      const position = {
        lat: Number(property.latitude),
        lng: Number(property.longitude),
      }

      const displayTitle = getPropertyDisplayTitle(property)

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current!,
        title: displayTitle,
        animation: google.maps.Animation.DROP,
      })

      // Add click listener
      marker.addListener('click', (e: google.maps.MapMouseEvent) => {
        // Prevent event bubbling
        if (e) {
          e.stop?.()
        }

        console.log('🗺️ MapView: Marker clicked for', displayTitle)

        // Show info window first
        const content = `
          <div style="padding: 12px; max-width: 280px;">
            ${
              property.cover_photo_url
                ? `<img src="${property.cover_photo_url}" alt="${displayTitle}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; cursor: pointer;" onclick="window.markerImageClick_${index}()" />`
                : ''
            }
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 6px; color: #063665;">${displayTitle}</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 8px;">
              ${property.street_address ? `${property.street_address}<br/>` : ''}
              ${property.city}, ${property.state} ${property.zip_code}
            </p>
            ${
              property.beds || property.baths || property.square_footage
                ? `<p style="color: #666; font-size: 14px; margin-bottom: 8px;">
                ${property.beds ? `${property.beds} bed${property.beds !== 1 ? 's' : ''}` : ''}
                ${property.beds && property.baths ? ' • ' : ''}
                ${property.baths ? `${property.baths} bath${property.baths !== 1 ? 's' : ''}` : ''}
                ${property.square_footage ? ` • ${property.square_footage.toLocaleString()} sq ft` : ''}
              </p>`
                : ''
            }
            ${
              property.monthly_rent
                ? `<p style="color: #063665; font-weight: bold; font-size: 18px; margin-bottom: 8px;">
                ${formatCurrency(property.monthly_rent)}/mo
              </p>`
                : ''
            }
            <button
              onclick="window.markerClick_${index}()"
              style="
                background: #F97316;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                font-size: 14px;
              "
            >
              View Details
            </button>
          </div>
        `

        infoWindowRef.current?.setContent(content)
        infoWindowRef.current?.open(mapInstanceRef.current!, marker)

        // Set up click handler for the button
        ;(window as any)[`markerClick_${index}`] = () => {
          if (onMarkerClick) {
            onMarkerClick(property)
          }
        }

        // Set up click handler for the image
        ;(window as any)[`markerImageClick_${index}`] = () => {
          if (onMarkerClick) {
            onMarkerClick(property)
          }
        }
      })

      markersRef.current.push(marker)
      bounds.extend(position)
      hasValidMarkers = true
    })

    // Fit map to show all markers
    if (hasValidMarkers) {
      console.log('🗺️ MapView: Fitting bounds for', properties.length, 'properties')
      mapInstanceRef.current.fitBounds(bounds)

      // Don't zoom in too much for a single marker
      const listener = google.maps.event.addListenerOnce(
        mapInstanceRef.current,
        'idle',
        () => {
          const currentZoom = mapInstanceRef.current!.getZoom()!
          console.log('🗺️ MapView: Map idle, zoom level:', currentZoom)
          if (properties.length === 1 && currentZoom > 15) {
            mapInstanceRef.current!.setZoom(15)
          }
          // For multiple properties, ensure reasonable max zoom
          if (properties.length > 1 && currentZoom > 12) {
            mapInstanceRef.current!.setZoom(12)
          }
        }
      )
    }
  }, [properties, onMarkerClick, isLoading])

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
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
      <div
        ref={mapRef}
        className={`w-full h-full rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
}
