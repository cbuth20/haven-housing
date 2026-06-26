'use client'

import { forwardRef } from 'react'

/** Field name the server checks — must match HONEYPOT_FIELD in
 *  netlify/functions/utils/honeypot.ts. */
export const HONEYPOT_NAME = 'company_website'

/**
 * Hidden honeypot input. Invisible to humans (off-screen, no a11y tree, no
 * autofill, not tab-reachable), but bots that auto-fill every field will
 * populate it. Read the ref's value at submit time and include it in the
 * request payload; the server flags any non-empty value as a bot.
 *
 * Usage:
 *   const honeypotRef = useRef<HTMLInputElement>(null)
 *   <Honeypot ref={honeypotRef} />
 *   body: JSON.stringify({ ...payload, [HONEYPOT_NAME]: honeypotRef.current?.value || '' })
 */
export const Honeypot = forwardRef<HTMLInputElement>(function Honeypot(_props, ref) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      <label>
        Company Website
        <input
          ref={ref}
          type="text"
          name={HONEYPOT_NAME}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  )
})
