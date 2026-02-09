// Google Maps API using the new functional API (not deprecated Loader class)

let isLoaded = false
let loadPromise: Promise<void> | null = null

export async function loadGoogleMaps() {
  // If already loaded, return immediately
  if (isLoaded) return

  // If currently loading, wait for that promise
  if (loadPromise) return loadPromise

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey || apiKey === 'placeholder-google-maps-key') {
    throw new Error(
      'Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.'
    )
  }

  // Create the load promise
  loadPromise = new Promise<void>((resolve, reject) => {
    // Check if script is already in the DOM
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api"]`
    )

    if (existingScript) {
      isLoaded = true
      resolve()
      return
    }

    // Create script tag
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly`
    script.async = true
    script.defer = true

    script.onload = () => {
      isLoaded = true
      resolve()
    }

    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load Google Maps script'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

// Geocode an address to get coordinates
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
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
