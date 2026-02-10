import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { Property } from '@/types/property'

export function useProperties() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const createProperty = async (propertyData: Partial<Property>) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/.netlify/functions/properties-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create property'
        try {
          const text = await response.text()
          try {
            const error = JSON.parse(text)
            errorMessage = error.message || errorMessage
          } catch {
            errorMessage = text || errorMessage
          }
        } catch (readError) {
          console.error('Error reading response:', readError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/.netlify/functions/properties-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...propertyData }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to update property'
        try {
          const text = await response.text()
          try {
            const error = JSON.parse(text)
            errorMessage = error.message || errorMessage
          } catch {
            errorMessage = text || errorMessage
          }
        } catch (readError) {
          console.error('Error reading response:', readError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProperty = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/.netlify/functions/properties-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to delete property'
        try {
          // Read as text first, then try to parse as JSON
          const text = await response.text()
          try {
            const error = JSON.parse(text)
            errorMessage = error.message || errorMessage
          } catch {
            // If not JSON, use the text directly
            errorMessage = text || errorMessage
          }
        } catch (readError) {
          console.error('Error reading response:', readError)
        }
        throw new Error(errorMessage)
      }

      return true
    } catch (err: any) {
      console.error('Delete property error:', err)
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const uploadPhotos = async (files: File[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const formData = new FormData()
      files.forEach(file => formData.append('photos', file))

      const response = await fetch('/.netlify/functions/upload-photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Failed to upload photos'
        try {
          const text = await response.text()
          try {
            const error = JSON.parse(text)
            errorMessage = error.message || errorMessage
          } catch {
            errorMessage = text || errorMessage
          }
        } catch (readError) {
          console.error('Error reading response:', readError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data.urls
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    uploadPhotos,
  }
}
