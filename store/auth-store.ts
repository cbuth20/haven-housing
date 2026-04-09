import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/user'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean
  initialize: () => void
  setUser: (user: UserProfile | null) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

let authSubscription: { data: { subscription: any } } | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  initialized: false,

  initialize: () => {
    if (get().initialized) return

    if (authSubscription) {
      authSubscription.data.subscription.unsubscribe()
    }

    // Match working pattern from other projects:
    // onAuthStateChange only — no getSession(), no async DB queries in callback
    authSubscription = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        isAuthenticated: !!session?.user,
        // If no session, we're done loading. If session exists,
        // keep loading until profile is fetched (useAuth handles this).
        isLoading: !!session?.user,
        initialized: true,
      })
    })

    // Safety net: if listener never fires, stop loading after 5s
    setTimeout(() => {
      if (get().isLoading) {
        set({ isLoading: false, initialized: true })
      }
    }, 5000)
  },

  setUser: (user) => set({ user, isLoading: false }),

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // onAuthStateChange handles the rest
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) throw error

    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'client',
        })

      if (profileError) throw profileError
    }
    // onAuthStateChange handles setting session state
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      // Still clear local state
      set({ session: null, user: null, isAuthenticated: false })
      throw error
    }
    // onAuthStateChange handles clearing state
  },

  refreshUser: async () => {
    const session = get().session
    if (session?.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        set({ user: profile })
      }
    }
  },
}))
