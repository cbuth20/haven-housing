import { create } from 'zustand'
import { Property, PropertyFilters } from '@/types/property'
import { supabase } from '@/lib/supabase'

interface PropertyState {
  properties: Property[]
  isLoading: boolean
  error: string | null
  filters: PropertyFilters
  selectedProperty: Property | null

  // Actions
  fetchProperties: () => Promise<void>
  setFilters: (filters: PropertyFilters) => void
  setSelectedProperty: (property: Property | null) => void
  clearError: () => void
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  isLoading: false,
  error: null,
  filters: {},
  selectedProperty: null,

  fetchProperties: async () => {
    set({ isLoading: true, error: null })

    try {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      set({ properties: data || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  setFilters: (filters: PropertyFilters) => {
    set({ filters })
  },

  setSelectedProperty: (property: Property | null) => {
    set({ selectedProperty: property })
  },

  clearError: () => {
    set({ error: null })
  },
}))
