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
  signUp: (email: string, password: string, fullName: string, captchaToken?: string) => Promise<{ needsConfirmation: boolean }>
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
      const currentUser = get().user
      set({
        session,
        isAuthenticated: !!session?.user,
        // Only keep loading if session exists AND profile hasn't been fetched yet.
        // If user is already loaded (e.g. TOKEN_REFRESHED on tab focus), don't
        // reset to loading state — that causes an infinite spinner.
        isLoading: !!session?.user && !currentUser,
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

  signUp: async (email: string, password: string, fullName: string, captchaToken?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, captchaToken },
    })

    if (error) throw error

    // The user_profiles row is created automatically by the on_auth_user_created
    // DB trigger (handle_new_user), which runs SECURITY DEFINER and reads full_name
    // from raw_user_meta_data. A client-side insert here is redundant and fails RLS
    // when email confirmation is on (no session → auth.uid() is null).
    //
    // If a session came back, the user is logged in immediately (confirmation off);
    // otherwise they must confirm their email before signing in. onAuthStateChange
    // handles session state.
    return { needsConfirmation: !data.session }
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
