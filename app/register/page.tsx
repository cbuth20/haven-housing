'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Honeypot } from '@/components/common/Honeypot'
import { Turnstile, TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/common/Turnstile'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const honeypotRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<TurnstileHandle>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Honeypot: a filled hidden field means a bot. Silently stop without
    // creating an account, but show the same neutral screen a human would see.
    if (honeypotRef.current?.value) {
      setConfirmEmail(true)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (TURNSTILE_ENABLED && !captchaToken) {
      setError('Please complete the verification challenge')
      return
    }

    setIsLoading(true)

    try {
      const { needsConfirmation } = await signUp(email, password, fullName, captchaToken || undefined)
      if (needsConfirmation) {
        // Email confirmation is on: no session yet, so don't redirect into a
        // logged-out homepage — tell the user to confirm their email.
        setConfirmEmail(true)
      } else {
        router.push('/')
      }
    } catch (err: any) {
      // Turnstile tokens are single-use; reset the widget so retry gets a fresh
      // challenge (clearing state alone leaves the widget stuck on "solved").
      setCaptchaToken('')
      turnstileRef.current?.reset()
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  if (confirmEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-3xl font-heading font-bold text-navy">Check your email</h2>
          <p className="text-gray-600">
            We sent a confirmation link to <span className="font-medium text-navy">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="inline-block font-medium text-orange hover:text-orange-600">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-heading font-bold text-navy">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-orange hover:text-orange-600">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Honeypot ref={honeypotRef} />
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="John Doe"
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              helperText="Must be at least 6 characters"
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
          </div>

          <Turnstile
            ref={turnstileRef}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
          />

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Create account
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-navy"
            >
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
