'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SITE } from '../lib/config.ts'
import { api, ApiError, type CheckView } from '../lib/api.ts'
import { authMessage, getAuth, NOT_CONFIGURED } from '../lib/supabase.ts'

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

/**
 * The gate on the locked report. Signed out: sign in or create an account (Google in one click). Signed in: one
 * button unlocks the report. Signing in returns to this same check.
 */
export function AuthGate({ jobId, onUnlocked }: { jobId: string; onUnlocked: (v: CheckView, emailSent: boolean, url: string) => void }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined) // undefined: still checking
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const back = `${window.location.pathname}?job=${jobId}&phase=final`

  useEffect(() => {
    const auth = getAuth()
    if (!auth) return setEmail(null)
    auth.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null))
    const { data: sub } = auth.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function google() {
    setError('')
    const auth = getAuth()
    if (!auth) return setError(NOT_CONFIGURED)
    setBusy(true)
    const { error: err } = await auth.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${SITE.url}/auth/callback?next=${encodeURIComponent(back)}` } })
    if (err) {
      setError(authMessage(err))
      setBusy(false)
    }
  }

  async function unlock() {
    setError('')
    setBusy(true)
    try {
      const r = await api.unlock(jobId)
      onUnlocked(r.job, r.email_sent, r.report_url)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.')
      setBusy(false)
    }
  }

  if (email === undefined) return null

  return (
    <div className="gate">
      {email ? (
        <>
          <h4>Unlock the full report</h4>
          <p className="muted">You are signed in as <strong>{email}</strong>. Unlocking shows every gap, the competitor comparison and your launch plan, and emails you the report link.</p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="btn gate-primary" type="button" onClick={unlock} disabled={busy}>{busy ? 'Unlocking' : 'Unlock the full report'}</button>
        </>
      ) : (
        <>
          <span className="gate-badge">Free</span>
          <h4>Unlock your full report</h4>
          <ul className="gate-list">
            <li>Every gap, ranked by impact</li>
            <li>Your score against each competitor</li>
            <li>Your full launch plan, fix by fix</li>
          </ul>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="gate-actions">
            <Link className="btn gate-primary" href={`/sign-in?next=${encodeURIComponent(back)}`}>Sign in or create an account</Link>
            <button type="button" className="google-btn" onClick={google} disabled={busy}><GoogleMark /><span>Continue with Google</span></button>
          </div>
        </>
      )}
    </div>
  )
}
