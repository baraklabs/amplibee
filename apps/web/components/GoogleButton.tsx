'use client'

import { useEffect, useRef, useState } from 'react'
import { AuthError, signInWithGoogle } from '../lib/auth.ts'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
const SRC = 'https://accounts.google.com/gsi/client'

let script: Promise<void> | null = null
function loadScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  script ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      script = null
      reject(new Error('Could not load Google sign-in.'))
    }
    document.head.appendChild(s)
  })
  return script
}

/** Google's own "Continue with Google" button. It hands back a signed credential, which the server checks. */
export function GoogleButton({ onDone, onError, onStart, disabled = false }: { onDone: () => void; onError: (message: string) => void; onStart?: () => void; disabled?: boolean }) {
  const holder = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  // Google keeps the callback it was given at initialize(), so route through a ref to always reach the latest props.
  const latest = useRef({ onDone, onError, onStart })
  latest.current = { onDone, onError, onStart }

  useEffect(() => {
    if (!CLIENT_ID) return
    let gone = false
    loadScript()
      .then(() => {
        if (gone || !holder.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            setBusy(true)
            latest.current.onStart?.()
            try {
              await signInWithGoogle(credential)
              // stays busy: the page is about to change
              latest.current.onDone()
            } catch (e) {
              latest.current.onError(e instanceof AuthError ? e.message : 'Google sign-in did not work. Try again.')
              setBusy(false)
            }
          },
        })
        window.google.accounts.id.renderButton(holder.current, { theme: 'outline', size: 'large', text: 'continue_with', width: Math.min(360, holder.current.clientWidth || 320) })
      })
      .catch((e: Error) => latest.current.onError(e.message))
    return () => {
      gone = true
    }
  }, [])

  if (!CLIENT_ID) return null
  return (
    <div className="google-slot" style={{ opacity: busy || disabled ? 0.5 : 1, pointerEvents: busy || disabled ? 'none' : 'auto', display: 'flex', justifyContent: 'center', minHeight: 44 }}>
      <div ref={holder} />
    </div>
  )
}
