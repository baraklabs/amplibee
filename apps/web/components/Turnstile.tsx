'use client'

import { useEffect, useRef } from 'react'
import { TURNSTILE_SITE_KEY } from '../lib/config.ts'

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string
  reset(id?: string): void
  remove(id?: string): void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let loader: Promise<void> | null = null
function loadScript(): Promise<void> {
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loader = null
      reject(new Error('Could not load the bot check.'))
    }
    document.head.appendChild(s)
  })
  return loader
}

/** Cloudflare Turnstile. The token is single use: bump resetKey after every submit attempt. */
export function Turnstile({ onToken, resetKey = 0 }: { onToken: (token: string | null) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | undefined>(undefined)
  const cb = useRef(onToken)
  cb.current = onToken

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    let gone = false
    loadScript()
      .then(() => {
        if (gone || !box.current || !window.turnstile) return
        widget.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: 'interaction-only',
          callback: (t: string) => cb.current(t),
          'expired-callback': () => cb.current(null),
          'error-callback': () => cb.current(null),
        })
      })
      .catch(() => cb.current(null))
    return () => {
      gone = true
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
    }
  }, [])

  useEffect(() => {
    if (resetKey > 0 && widget.current && window.turnstile) {
      cb.current(null)
      window.turnstile.reset(widget.current)
    }
  }, [resetKey])

  // Without a site key nothing renders. Submitting then fails with the API's own message.
  if (!TURNSTILE_SITE_KEY) return null
  return <div ref={box} className="turnstile" aria-label="Bot check" />
}
