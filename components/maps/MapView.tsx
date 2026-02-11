'use client'

import { useEffect, useRef, useState, memo, useCallback } from 'react'
import { Property } from '@/types/property'
import { loadGoogleMaps } from '@/lib/google-maps'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { getPropertyDisplayTitle } from '@/lib/property-utils'
import { MAP_THEMES, THEME_ORDER, MapThemeKey } from './map-themes'

interface MapViewProps {
  properties: Property[]
  center?: { lat: number; lng: number }
  zoom?: number
  onMarkerClick?: (property: Property) => void
  className?: string
}

export const MapView = memo(function MapView({
  properties,
  center = { lat: 39.8283, lng: -98.5795 },
  zoom = 4,
  onMarkerClick,
  className = 'w-full h-96',
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const onMarkerClickRef = useRef(onMarkerClick)
  onMarkerClickRef.current = onMarkerClick

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTheme, setActiveTheme] = useState<MapThemeKey>('aubergine')

  // Initialize map once
  useEffect(() => {
    let cancelled = false

    const initMap = async () => {
      try {
        await loadGoogleMaps()
        if (cancelled || !mapRef.current) return

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: MAP_THEMES[activeTheme].styles,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        mapInstanceRef.current = map
        infoWindowRef.current = new google.maps.InfoWindow()

        setTimeout(() => {
          if (!cancelled && mapInstanceRef.current) {
            google.maps.event.trigger(map, 'resize')
            map.setCenter(center)
          }
        }, 100)

        if (!cancelled) setIsLoading(false)
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load map')
          setIsLoading(false)
        }
      }
    }

    initMap()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update center and zoom
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return
    mapInstanceRef.current.setCenter(center)
    mapInstanceRef.current.setZoom(zoom)
  }, [center.lat, center.lng, zoom, isLoading])

  // Apply theme
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return
    mapInstanceRef.current.setOptions({ styles: MAP_THEMES[activeTheme].styles })
  }, [activeTheme, isLoading])

  // Update markers — uses ref for onMarkerClick so this doesn't re-fire on parent renders
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return

    // Clear existing
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    if (properties.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    let hasValidMarkers = false

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

      marker.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e) e.stop?.()

        const content = `
          <div style="padding: 12px; max-width: 280px;">
            ${
              property.cover_photo_url
                ? `<img src="${property.cover_photo_url}" alt="${displayTitle}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; cursor: pointer;" onclick="window.__mapMarkerClick_${index}()" />`
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
                ${property.beds && property.baths ? ' &bull; ' : ''}
                ${property.baths ? `${property.baths} bath${Number(property.baths) !== 1 ? 's' : ''}` : ''}
                ${property.square_footage ? ` &bull; ${property.square_footage.toLocaleString()} sq ft` : ''}
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
              onclick="window.__mapMarkerClick_${index}()"
              style="background: #F97316; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; font-size: 14px;"
            >
              View Details
            </button>
          </div>
        `

        infoWindowRef.current?.setContent(content)
        infoWindowRef.current?.open(mapInstanceRef.current!, marker)

        ;(window as any)[`__mapMarkerClick_${index}`] = () => {
          onMarkerClickRef.current?.(property)
        }
      })

      markersRef.current.push(marker)
      bounds.extend(position)
      hasValidMarkers = true
    })

    if (hasValidMarkers) {
      mapInstanceRef.current.fitBounds(bounds)

      google.maps.event.addListenerOnce(
        mapInstanceRef.current,
        'idle',
        () => {
          const currentZoom = mapInstanceRef.current?.getZoom()
          if (currentZoom == null) return
          if (properties.length === 1 && currentZoom > 15) {
            mapInstanceRef.current!.setZoom(15)
          } else if (properties.length > 1 && currentZoom > 12) {
            mapInstanceRef.current!.setZoom(12)
          }
        }
      )
    }
  }, [properties, isLoading])

  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveTheme(e.target.value as MapThemeKey)
  }, [])

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
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <LoadingSpinner size="lg" />
        </div>
      )}
      <div
        ref={mapRef}
        className={`w-full h-full rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
      {!isLoading && (
        <div className="absolute top-3 right-3 z-10">
          <select
            value={activeTheme}
            onChange={handleThemeChange}
            className="bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 shadow-md cursor-pointer hover:bg-white focus:outline-none focus:ring-2 focus:ring-navy"
          >
            {THEME_ORDER.map((key) => (
              <option key={key} value={key}>
                {MAP_THEMES[key].label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
})
