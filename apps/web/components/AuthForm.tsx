'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { SITE } from '../lib/config.ts'
import { authMessage, getAuth, NOT_CONFIGURED } from '../lib/supabase.ts'

type Mode = 'signin' | 'signup' | 'forgot'

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

const TITLE: Record<Mode, string> = { signin: 'Sign in', signup: 'Create your account', forgot: 'Reset your password' }
const SUB: Record<Mode, string> = {
  signin: 'Welcome back. Sign in to see your reports.',
  signup: '',
  forgot: 'Enter your email and we will send you a link to choose a new password.',
}

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [next, setNext] = useState('/account')

  // /sign-in?mode=signup opens the form on "Create your account".
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('mode') === 'signup') setMode('signup')
    const n = q.get('next')
    // only paths on this site, never an address on another one
    if (n && n.startsWith('/') && !n.startsWith('//')) setNext(n)
  }, [])

  function switchTo(m: Mode) {
    setMode(m)
    setError('')
    setNotice('')
  }

  async function google() {
    setError('')
    const auth = getAuth()
    if (!auth) return setError(NOT_CONFIGURED)
    setBusy(true)
    const { error: err } = await auth.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${SITE.url}/auth/callback?next=${encodeURIComponent(next)}` } })
    if (err) {
      setError(authMessage(err))
      setBusy(false)
    }
    // on success the browser is already on its way to Google
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    const addr = email.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) return setError('Enter a valid email address.')
    if (mode !== 'forgot' && password.length < 8) return setError('Your password must be at least 8 characters.')
    const auth = getAuth()
    if (!auth) return setError(NOT_CONFIGURED)
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error: err } = await auth.auth.signInWithPassword({ email: addr, password })
        if (err) return setError(authMessage(err))
        router.push(next)
      } else if (mode === 'signup') {
        const { data, error: err } = await auth.auth.signUp({ email: addr, password, options: { emailRedirectTo: `${SITE.url}/auth/callback?next=${encodeURIComponent(next)}` } })
        if (err) return setError(authMessage(err))
        if (data.session) router.push(next)
        else setNotice(`We sent a confirmation link to ${addr}. Open it to finish creating your account.`)
      } else {
        const { error: err } = await auth.auth.resetPasswordForEmail(addr, { redirectTo: `${SITE.url}/reset-password` })
        if (err) return setError(authMessage(err))
        setNotice(`If an account exists for ${addr}, a reset link is on its way. It can take a minute to arrive.`)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card card">
      <h1 className="auth-title">{TITLE[mode]}</h1>
      {SUB[mode] ? <p className="muted auth-sub">{SUB[mode]}</p> : null}

      {mode !== 'forgot' ? (
        <>
          <button type="button" className="google-btn" onClick={google} disabled={busy}>
            <GoogleMark />
            <span>Continue with Google</span>
          </button>
          <div className="auth-or" role="separator"><span>or</span></div>
        </>
      ) : null}

      <form className="stack" onSubmit={submit} noValidate>
        <div className="field">
          <label className="label" htmlFor="auth-email">Email</label>
          <input id="auth-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>

        {mode !== 'forgot' ? (
          <div className="field">
            <div className="auth-pass-head">
              <label className="label" htmlFor="auth-password">Password</label>
              {mode === 'signin' ? (
                <button type="button" className="auth-link" onClick={() => switchTo('forgot')}>Forgot password?</button>
              ) : null}
            </div>
            <div className="pass-wrap">
              <input
                id="auth-password"
                type={show ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
              />
              <button type="button" className="pass-toggle" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Hide' : 'Show'}</button>
            </div>
          </div>
        ) : null}

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {notice ? <p className="locked-note" role="status">{notice}</p> : null}

        <button className="btn auth-submit" type="submit" disabled={busy}>
          {busy ? 'One moment' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
        </button>
      </form>

      <p className="auth-switch">
        {mode === 'signin' ? (
          <>New to Amplibee? <button type="button" className="auth-link" onClick={() => switchTo('signup')}>Create an account</button></>
        ) : mode === 'signup' ? (
          <>Already have an account? <button type="button" className="auth-link" onClick={() => switchTo('signin')}>Sign in</button></>
        ) : (
          <button type="button" className="auth-link" onClick={() => switchTo('signin')}>Back to sign in</button>
        )}
      </p>
    </div>
  )
}
