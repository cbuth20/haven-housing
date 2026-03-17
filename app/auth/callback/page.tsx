'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Suspense } from 'react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      if (!tokenHash) {
        router.push('/login?error=invalid_link')
        return
      }

      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type === 'recovery' ? 'recovery' : 'magiclink',
        })

        if (verifyError) {
          console.error('OTP verification failed:', verifyError)
          router.push('/login?error=invalid_link')
          return
        }

        // Check if user needs onboarding
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('is_onboarded')
            .eq('id', user.id)
            .single()

          if (profile && !profile.is_onboarded) {
            router.push('/onboard')
            return
          }
        }

        router.push('/admin')
      } catch (err) {
        console.error('Callback error:', err)
        router.push('/login?error=invalid_link')
      }
    }

    handleCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">Verifying your sign-in link...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
