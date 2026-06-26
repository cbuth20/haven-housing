'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/** True when a Turnstile site key is configured. Use to require a token before submit. */
export const TURNSTILE_ENABLED = !!SITE_KEY

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
  }
}

interface TurnstileProps {
  /** Called with the verification token once the challenge is solved. */
  onVerify: (token: string) => void
  /** Called when the token expires or the widget errors (clears the stored token). */
  onExpire?: () => void
}

/** Imperative handle: lets a parent re-run the challenge after a failed submit. */
export interface TurnstileHandle {
  reset: () => void
}

/**
 * Cloudflare Turnstile CAPTCHA widget. Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, so local/dev builds are unaffected.
 */
export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(
  { onVerify, onExpire },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)

  onVerifyRef.current = onVerify
  onExpireRef.current = onExpire

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) {
        // Discards the spent token and re-renders a fresh challenge.
        window.turnstile.reset(widgetId.current)
      }
    },
  }), [])

  const render = useCallback(() => {
    if (!SITE_KEY || !window.turnstile || !containerRef.current || widgetId.current) {
      return
    }
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => onVerifyRef.current(token),
      'expired-callback': () => onExpireRef.current?.(),
      'error-callback': () => onExpireRef.current?.(),
    })
  }, [])

  useEffect(() => {
    if (!SITE_KEY) return

    if (window.turnstile) {
      render()
      return
    }

    if (!document.querySelector('script[data-turnstile]')) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.setAttribute('data-turnstile', 'true')
      document.head.appendChild(script)
    }

    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval)
        render()
      }
    }, 200)

    return () => clearInterval(interval)
  }, [render])

  if (!SITE_KEY) return null

  return <div ref={containerRef} className="flex justify-center" />
})
