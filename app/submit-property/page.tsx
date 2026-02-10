'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PropertySubmissionForm } from '@/components/forms/PropertySubmissionForm'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function SubmitPropertyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login?redirect=/submit-property')
      return
    }

    setUser(session.user)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Submit a Property
          </h1>
          <p className="text-xl text-gray-200">
            Add your property to our network and reach qualified tenants
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-navy mb-4">
              Property Submission Guidelines
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm text-blue-800">
              <p>✓ All submissions are reviewed by our team within 48 hours</p>
              <p>✓ Properties must be available for rent to corporate or insurance clients</p>
              <p>✓ Accurate property information helps us serve clients better</p>
              <p>✓ You'll be notified via email once your property is approved</p>
            </div>
          </div>

          <PropertySubmissionForm />
        </div>
      </div>
    </div>
  )
}
