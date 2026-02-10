import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/user'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Store auth listener subscription to prevent duplicates
let authSubscription: { data: { subscription: any } } | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  initialized: false,

  initialize: async () => {
    // Prevent multiple initializations
    if (get().initialized) {
      console.log('🔐 Auth already initialized, skipping')
      return
    }

    console.log('🔐 Initializing auth...')

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
          initialized: true,
        })
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
        })
      }

      // Clean up existing listener
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe()
      }

      // Listen for auth changes
      authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state changed:', event)

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
        initialized: true,
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
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      console.log('🔐 SignIn: Profile fetched:', { profile, profileError })

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
    try {
      console.log('🔓 Auth store: Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('🔓 Auth store: Sign out error:', error)
        throw error
      }
      console.log('🔓 Auth store: Sign out successful')
      set({
        user: null,
        isAuthenticated: false,
      })
    } catch (error) {
      console.error('🔓 Auth store: Sign out failed:', error)
      // Still clear the local state even if Supabase signout fails
      set({
        user: null,
        isAuthenticated: false,
      })
      throw error
    }
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
