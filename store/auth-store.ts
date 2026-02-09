import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/user'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({
            user: profile,
            isAuthenticated: true,
          })
        } else {
          set({
            user: null,
            isAuthenticated: false,
          })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      set({
        user: profile,
        isAuthenticated: true,
      })
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'client', // Default role
        })

      if (profileError) throw profileError

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      set({
        user: profile,
        isAuthenticated: true,
      })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({
      user: null,
      isAuthenticated: false,
    })
  },

  refreshUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      set({ user: profile })
    }
  },
}))
