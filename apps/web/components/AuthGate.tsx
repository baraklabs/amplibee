'use client'

import Link from 'next/link'
import { useState } from 'react'
import { api, ApiError, type CheckView } from '../lib/api.ts'
import { GoogleButton } from './GoogleButton.tsx'
import { useAccount } from './useAccount.ts'

/**
 * The gate on the locked report. Signed out: sign in or create an account (Google in one click). Signed in: one
 * button unlocks the report. Signing in returns to this same check.
 */
export function AuthGate({ jobId, onUnlocked }: { jobId: string; onUnlocked: (v: CheckView, emailSent: boolean, url: string) => void }) {
  const me = useAccount() // undefined: still checking
  const email = me === undefined ? undefined : (me?.email ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const back = `${window.location.pathname}?job=${jobId}&phase=final`

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
            <GoogleButton onDone={() => setError('')} onError={setError} />
          </div>
        </>
      )}
    </div>
  )
}
