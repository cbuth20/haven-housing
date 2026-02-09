// API client for Netlify Functions

const API_BASE = '/.netlify/functions'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}/${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new ApiError(
      error.message || 'API request failed',
      response.status,
      error
    )
  }

  return response.json()
}

export const api = {
  // Property endpoints
  properties: {
    create: (data: any) => fetchApi('properties-create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi(`properties-update`, {
      method: 'POST',
      body: JSON.stringify({ id, ...data }),
    }),
    delete: (id: string) => fetchApi('properties-delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
    search: (filters: any) => fetchApi('properties-search', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),
  },

  // Property submission endpoints
  submissions: {
    approve: (id: string, notes?: string) => fetchApi('property-submissions-approve', {
      method: 'POST',
      body: JSON.stringify({ id, notes }),
    }),
    reject: (id: string, notes?: string) => fetchApi('property-submissions-reject', {
      method: 'POST',
      body: JSON.stringify({ id, notes }),
    }),
  },

  // Form submission endpoints
  forms: {
    submitInsurance: (data: any) => fetchApi('form-submit-insurance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    submitCorporate: (data: any) => fetchApi('form-submit-corporate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    submitGovernment: (data: any) => fetchApi('form-submit-government', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    submitContact: (data: any) => fetchApi('form-submit-contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Photo upload
  uploadPhotos: async (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('photos', file))

    const response = await fetch(`${API_BASE}/upload-photos`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new ApiError('Photo upload failed', response.status)
    }

    return response.json()
  },
}
