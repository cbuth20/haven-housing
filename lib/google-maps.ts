import { Loader } from '@googlemaps/js-api-loader'

let loader: Loader | null = null

export function getGoogleMapsLoader(): Loader {
  if (!loader) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error(
        'Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.'
      )
    }

    loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'marker'],
    })
  }

  return loader
}

export async function loadGoogleMaps() {
  const loader = getGoogleMapsLoader()
  // @ts-ignore - Loader type definition is incomplete
  return await loader.load()
}

// Geocode an address to get coordinates
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    await loadGoogleMaps()

    const geocoder = new google.maps.Geocoder()
    const result = await geocoder.geocode({ address })

    if (result.results && result.results.length > 0) {
      const location = result.results[0].geometry.location
      return {
        lat: location.lat(),
        lng: location.lng(),
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Get user's current location
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      }
    )
  })
}
