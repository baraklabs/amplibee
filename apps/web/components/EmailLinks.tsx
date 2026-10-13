'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { AuthError, resetPassword, verifyLink } from '../lib/auth.ts'

const messageOf = (e: unknown) => (e instanceof AuthError ? e.message : 'Something went wrong. Try again.')

/** Opened from the confirmation email: spends the one-click link and signs the person in. */
export function VerifyEmail() {
  const router = useRouter()
  const [error, setError] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) return setError('This confirmation link is not valid. Sign in to get a new one.')
    verifyLink(token).then(
      () => router.replace('/account'),
      (e) => setError(messageOf(e)),
    )
  }, [router])

  return (
    <div className="auth-card card" style={{ textAlign: 'center' }}>
      {error ? (
        <>
          <h1 className="auth-title">We could not confirm your email</h1>
          <p className="form-error" role="alert">{error}</p>
          <p><Link className="btn" href="/sign-in">Back to sign in</Link></p>
        </>
      ) : (
        <>
          <h1 className="auth-title">Confirming your email</h1>
          <p className="muted" role="status">One moment.</p>
        </>
      )}
    </div>
  )
}

/** Opened from the reset email (with ?token=), or by hand with the email address and the 6-digit code. */
export function ResetPassword() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token'))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Your password must be at least 8 characters.')
    if (!token && (!email.trim() || !/^\d{6}$/.test(code.trim()))) return setError('Enter your email and the 6-digit code from the email.')
    setBusy(true)
    try {
      await resetPassword(token ? { token, password } : { email: email.trim(), code: code.trim(), password })
      setDone(true)
      setTimeout(() => router.push('/sign-in'), 1500)
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card card">
      <h1 className="auth-title">Choose a new password</h1>
      {done ? (
        <p className="locked-note" role="status">Your password is updated. Sign in with it now.</p>
      ) : (
        <form className="stack" onSubmit={submit} noValidate>
          {!token ? (
            <>
              <div className="field">
                <label className="label" htmlFor="reset-email">Email</label>
                <input id="reset-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div className="field">
                <label className="label" htmlFor="reset-code">Code from the email</label>
                <input id="reset-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" />
              </div>
            </>
          ) : null}
          <div className="field">
            <label className="label" htmlFor="new-password">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="btn auth-submit" type="submit" disabled={busy}>{busy ? 'Saving' : 'Update password'}</button>
          <p className="auth-switch"><Link className="auth-link" href="/sign-in">Back to sign in</Link></p>
        </form>
      )}
    </div>
  )
}
