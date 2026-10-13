'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { AuthError, forgotPassword, getPending, resendCode, signIn, signUp, verifyCode, type Outcome } from '../lib/auth.ts'
import { GoogleButton } from './GoogleButton.tsx'

type Mode = 'signin' | 'signup' | 'forgot' | 'verify'

const TITLE: Record<Mode, string> = { signin: 'Sign in', signup: 'Create your account', forgot: 'Reset your password', verify: 'Check your email' }
const SUB: Record<Mode, string> = {
  signin: 'Welcome back. Sign in to see your reports.',
  signup: '',
  forgot: 'Enter your email and we will send you a link to choose a new password.',
  verify: '',
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
  const [code, setCode] = useState('')
  const [sentTo, setSentTo] = useState('')

  // /sign-in?mode=signup opens the form on "Create your account".
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('mode') === 'signup') setMode('signup')
    const n = q.get('next')
    // only paths on this site, never an address on another one
    if (n && n.startsWith('/') && !n.startsWith('//')) setNext(n)
    // came back to finish confirming an address in this tab
    const p = getPending()
    if (p) {
      setSentTo(p.email)
      setMode('verify')
    }
  }, [])

  function switchTo(m: Mode) {
    setMode(m)
    setError('')
    setNotice('')
  }

  const fail = (e: unknown) => setError(e instanceof AuthError ? e.message : 'Something went wrong. Try again.')

  function after(o: Outcome, addr: string) {
    if (o.kind === 'signed_in') return router.push(next)
    setSentTo(addr)
    setCode('')
    switchTo('verify')
    setNotice(`We sent a 6-digit code to ${addr}. Type it below, or open the link in the email.`)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    const addr = email.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) return setError('Enter a valid email address.')
    if (mode !== 'forgot' && password.length < 8) return setError('Your password must be at least 8 characters.')
    setBusy(true)
    try {
      if (mode === 'signin') after(await signIn(addr, password), addr)
      else if (mode === 'signup') after(await signUp('', addr, password), addr)
      else {
        await forgotPassword(addr)
        setNotice(`If an account exists for ${addr}, a reset link is on its way. It can take a minute to arrive.`)
      }
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code from your email.')
    setBusy(true)
    try {
      await verifyCode(code.trim())
      router.push(next)
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await resendCode()
      setNotice(`A new code is on its way to ${sentTo}.`)
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card card">
      <h1 className="auth-title">{TITLE[mode]}</h1>
      {SUB[mode] ? <p className="muted auth-sub">{SUB[mode]}</p> : null}

      {mode === 'signin' || mode === 'signup' ? (
        <>
          <GoogleButton onDone={() => router.push(next)} onError={setError} />
          <div className="auth-or" role="separator"><span>or</span></div>
        </>
      ) : null}

      {mode === 'verify' ? (
        <form className="stack" onSubmit={submitCode} noValidate>
          <div className="field">
            <label className="label" htmlFor="auth-code">Confirmation code</label>
            <input id="auth-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" />
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {notice ? <p className="locked-note" role="status">{notice}</p> : null}
          <button className="btn auth-submit" type="submit" disabled={busy}>{busy ? 'One moment' : 'Confirm email'}</button>
          <p className="auth-switch"><button type="button" className="auth-link" onClick={resend} disabled={busy}>Send a new code</button></p>
        </form>
      ) : (
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
      )}

      <p className="auth-switch">
        {mode === 'verify' ? (
          <button type="button" className="auth-link" onClick={() => switchTo('signin')}>Back to sign in</button>
        ) : mode === 'signin' ? (
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
