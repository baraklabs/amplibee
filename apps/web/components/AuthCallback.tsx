'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { authMessage, getAuth, NOT_CONFIGURED } from '../lib/supabase.ts'

/** Finishes a Google sign-in or an email confirmation: exchanges the one-time code for a session. */
export function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    ;(async () => {
      const auth = getAuth()
      if (!auth) return setError(NOT_CONFIGURED)
      const q = new URLSearchParams(window.location.search)
      const problem = q.get('error_description') ?? q.get('error')
      if (problem) return setError(problem.replace(/\+/g, ' '))
      const n = q.get('next')
      const target = n && n.startsWith('/') && !n.startsWith('//') ? n : '/account'
      const code = q.get('code')
      if (!code) {
        // Nothing to exchange. If a session already exists, carry on.
        const { data } = await auth.auth.getSession()
        return data.session ? router.replace(target) : setError('This sign-in link is not valid. Start again from the sign-in page.')
      }
      const { error: err } = await auth.auth.exchangeCodeForSession(code)
      if (err) return setError(authMessage(err))
      router.replace(target)
    })()
  }, [router])

  return (
    <div className="auth-card card" style={{ textAlign: 'center' }}>
      {error ? (
        <>
          <h1 className="auth-title">We could not sign you in</h1>
          <p className="form-error" role="alert">{error}</p>
          <p><Link className="btn" href="/sign-in">Back to sign in</Link></p>
        </>
      ) : (
        <>
          <h1 className="auth-title">Signing you in</h1>
          <p className="muted" role="status">One moment.</p>
        </>
      )}
    </div>
  )
}

/** Lets someone who followed a reset link choose a new password. */
export function ResetPassword() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    ;(async () => {
      const auth = getAuth()
      if (!auth) return setError(NOT_CONFIGURED)
      const q = new URLSearchParams(window.location.search)
      const problem = q.get('error_description') ?? q.get('error')
      if (problem) return setError(problem.replace(/\+/g, ' '))
      const code = q.get('code')
      if (code) {
        const { error: err } = await auth.auth.exchangeCodeForSession(code)
        if (err) return setError('This reset link has expired or was already used. Ask for a new one from the sign-in page.')
      }
      const { data } = await auth.auth.getSession()
      if (!data.session) return setError('This reset link is not valid. Ask for a new one from the sign-in page.')
      setReady(true)
    })()
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Your password must be at least 8 characters.')
    const auth = getAuth()
    if (!auth) return setError(NOT_CONFIGURED)
    setBusy(true)
    const { error: err } = await auth.auth.updateUser({ password })
    setBusy(false)
    if (err) return setError(authMessage(err))
    setDone(true)
    setTimeout(() => router.push('/account'), 1200)
  }

  return (
    <div className="auth-card card">
      <h1 className="auth-title">Choose a new password</h1>
      {done ? (
        <p className="locked-note" role="status">Your password is updated. Taking you to your account.</p>
      ) : ready ? (
        <form className="stack" onSubmit={submit} noValidate>
          <div className="field">
            <label className="label" htmlFor="new-password">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="btn auth-submit" type="submit" disabled={busy}>{busy ? 'Saving' : 'Update password'}</button>
        </form>
      ) : error ? (
        <>
          <p className="form-error" role="alert">{error}</p>
          <p style={{ textAlign: 'center' }}><Link className="btn" href="/sign-in">Back to sign in</Link></p>
        </>
      ) : (
        <p className="muted" role="status">Checking your link.</p>
      )}
    </div>
  )
}
