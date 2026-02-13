import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'client'
  created_at: string
  updated_at: string
}

export interface CreateUserInput {
  email: string
  full_name: string
  role: 'admin' | 'client'
  temporary_password: string
}

export function useUsers() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const fetchUsers = async (): Promise<UserProfile[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/.netlify/functions/users-list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        let errorMessage = 'Failed to fetch users'
        try {
          const error = await response.json()
          errorMessage = error.message || errorMessage
        } catch {
          // If not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data.users
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async (userData: CreateUserInput): Promise<UserProfile> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Getting auth token...')
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      console.log('Sending create user request...')
      const response = await fetch('/.netlify/functions/users-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Failed to create user'
        try {
          const error = await response.json()
          console.error('API error response:', error)
          errorMessage = error.message || errorMessage
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          const text = await response.text()
          console.error('Response text:', text)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('User created response:', data)

      // Show warning if email failed
      if (data.warning) {
        console.warn(data.warning)
      }

      return data.user
    } catch (err: any) {
      console.error('Create user error:', err)
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fetchUsers,
    createUser,
    isLoading,
    error,
  }
}
