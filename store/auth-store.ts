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
    if (get().initialized) return

    // Clean up existing listener
    if (authSubscription) {
      authSubscription.data.subscription.unsubscribe()
    }

    // Use onAuthStateChange as the sole initialization mechanism.
    // Supabase fires INITIAL_SESSION immediately when the listener is registered,
    // which is more reliable than getSession() (which throws AbortError in some environments).
    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
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
      } catch (error) {
        // If profile fetch fails, still mark as initialized so app doesn't hang
        set({
          isLoading: false,
          initialized: true,
        })
      }
    })
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

      if (profileError) throw profileError

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
          role: 'client',
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({
        user: null,
        isAuthenticated: false,
      })
    } catch (error) {
      // Still clear local state even if Supabase signout fails
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
