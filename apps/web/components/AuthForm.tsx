'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { AuthError, forgotPassword, getPending, resendCode, signIn, signOut, signUp, verifyCode, type Outcome } from '../lib/auth.ts'
import { GoogleButton } from './GoogleButton.tsx'
import { useAccount } from './useAccount.ts'
import { OtpInput } from './OtpInput.tsx'

type Mode = 'signin' | 'signup'
type Errors = { name?: string; email?: string; password?: string; form?: string }

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const COPY: Record<Mode, { heading: string; submit: string; submitting: string; hint: string; cta: string }> = {
  signin: { heading: 'Sign in to Amplibee', submit: 'Sign in', submitting: 'Signing in', hint: 'New to Amplibee?', cta: 'Create an account' },
  signup: { heading: 'Create your account', submit: 'Create account', submitting: 'Creating account', hint: 'Already have an account?', cta: 'Sign in' },
}

const messageOf = (e: unknown) => (e instanceof AuthError ? e.message : 'Something went wrong. Try again.')

/**
 * Sign in and sign up are the two faces of a card that turns over; "forgot password" and "check your email" take its place.
 * With onSuccess (the sign-in popup) nothing redirects: the caller decides what happens once the person is signed in.
 */
export function AuthForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [showForgot, setShowForgot] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [next, setNext] = useState('/dashboard')
  const me = useAccount()
  const finish = () => (onSuccess ? onSuccess() : router.push(next))

  // Someone who is already signed in has no use for this page.
  useEffect(() => {
    if (me && !onSuccess) router.replace(next)
  }, [me, next, router, onSuccess])

  // /sign-in?mode=signup opens the card on "Create your account"; ?next= is where to go afterwards.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (!onSuccess && q.get('mode') === 'signup') setMode('signup')
    const n = q.get('next')
    // only paths on this site, never an address on another one
    if (n && n.startsWith('/') && !n.startsWith('//')) setNext(n)
    // came back to finish confirming an address in this tab
    const p = getPending()
    if (p) {
      setEmail(p.email)
      setVerifying(true)
    }
  }, [])

  function flipTo(m: Mode) {
    setErrors({})
    setShowForgot(false)
    setMode(m)
  }

  function done(o: Outcome) {
    if (o.kind === 'signed_in') finish()
    else setVerifying(true)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const addr = email.trim()
    if (mode === 'signup' && !name.trim()) return setErrors({ name: 'Enter your name.' })
    if (!EMAIL.test(addr)) return setErrors({ email: 'Enter a valid email address.' })
    if (mode === 'signin' && !password) return setErrors({ password: 'Enter your password.' })
    if (mode === 'signup' && password.length < 8) return setErrors({ password: 'Your password must be at least 8 characters.' })
    setBusy(true)
    setErrors({})
    try {
      const outcome = mode === 'signin' ? await signIn(addr, password) : await signUp(name.trim(), addr, password)
      done(outcome)
      // Stay frozen while the browser moves on to the next page; only the code step hands control back.
      if (outcome.kind !== 'signed_in') setBusy(false)
    } catch (err) {
      setErrors({ form: messageOf(err) })
      setBusy(false)
    }
  }

  if (me && onSuccess) return null
  if (me) return <p className="muted" role="status">You are signed in. Taking you to your dashboard.</p>

  if (verifying) {
    return (
      <VerifyFace
        email={email}
        onDone={finish}
        onBack={() => {
          void signOut()
          setVerifying(false)
        }}
      />
    )
  }

  const flipped = mode === 'signup' || showForgot
  const face = (m: Mode) => (
    <Face
      mode={m}
      active={mode === m && !showForgot}
      name={name}
      setName={setName}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      show={show}
      setShow={setShow}
      errors={errors}
      setError={(form) => {
        setErrors({ form })
        setBusy(false)
      }}
      onStart={() => {
        setErrors({})
        setBusy(true)
      }}
      busy={busy}
      onSubmit={onSubmit}
      onSignedIn={finish}
      onToggle={() => flipTo(m === 'signin' ? 'signup' : 'signin')}
      onForgot={() => {
        setErrors({})
        setShowForgot(true)
      }}
    />
  )

  return (
    <div className="auth-flip">
      <div className="auth-flip-inner" data-flipped={flipped ? 'true' : 'false'}>
        <div className="auth-face auth-face-front" {...(flipped ? { inert: true } : {})}>{face('signin')}</div>
        <div className="auth-face auth-face-back" {...(!flipped ? { inert: true } : {})}>
          {showForgot ? <ForgotFace initialEmail={email} onBack={() => setShowForgot(false)} /> : face('signup')}
        </div>
      </div>
    </div>
  )
}

function Face(p: {
  mode: Mode
  active: boolean
  name: string
  setName: (v: string) => void
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  show: boolean
  setShow: (fn: (v: boolean) => boolean) => void
  errors: Errors
  setError: (message: string) => void
  busy: boolean
  onSubmit: (e: FormEvent) => void
  onSignedIn: () => void
  onStart: () => void
  onToggle: () => void
  onForgot: () => void
}) {
  const c = COPY[p.mode]
  const id = (f: string) => `${p.mode}-${f}`
  return (
    <div className="auth-card card" aria-busy={p.busy}>
      <h1 className="auth-title">{c.heading}</h1>

      <form className="stack" onSubmit={p.onSubmit} noValidate>
        {p.mode === 'signup' ? (
          <div className="field">
            <label className="label" htmlFor={id('name')}>Full name</label>
            <input id={id("name")} type="text" autoComplete="name" value={p.name} onChange={(e) => p.setName(e.target.value)} disabled={p.busy} />
            {p.active && p.errors.name ? <p className="form-error">{p.errors.name}</p> : null}
          </div>
        ) : null}

        <div className="field">
          <label className="label" htmlFor={id('email')}>Email</label>
          <input id={id('email')} type="email" autoComplete="email" inputMode="email" value={p.email} onChange={(e) => p.setEmail(e.target.value)} placeholder="you@company.com" disabled={p.busy} />
          {p.active && p.errors.email ? <p className="form-error">{p.errors.email}</p> : null}
        </div>

        <div className="field">
          <div className="auth-pass-head">
            <label className="label" htmlFor={id('password')}>Password</label>
            {p.mode === 'signin' ? <button type="button" className="auth-link" onClick={p.onForgot} disabled={p.busy}>Forgot password?</button> : null}
          </div>
          <div className="pass-wrap">
            <input
              id={id('password')}
              type={p.show ? 'text' : 'password'}
              autoComplete={p.mode === 'signin' ? 'current-password' : 'new-password'}
              value={p.password}
              onChange={(e) => p.setPassword(e.target.value)}
              placeholder={p.mode === 'signup' ? 'At least 8 characters' : 'Your password'}
              disabled={p.busy}
            />
            <button type="button" className="pass-toggle" onClick={() => p.setShow((v) => !v)} aria-pressed={p.show} disabled={p.busy}>{p.show ? 'Hide' : 'Show'}</button>
          </div>
          {p.active && p.errors.password ? <p className="form-error">{p.errors.password}</p> : null}
        </div>

        <button className="btn auth-submit" type="submit" disabled={p.busy}>{p.active && p.busy ? c.submitting : c.submit}</button>
        {p.active && p.errors.form ? <p className="form-error" role="alert">{p.errors.form}</p> : null}
      </form>

      <div className="auth-or" role="separator"><span>or</span></div>
      {p.active ? <GoogleButton onStart={p.onStart} onDone={p.onSignedIn} onError={p.setError} disabled={p.busy} /> : <div style={{ minHeight: 44 }} />}

      <p className="auth-switch">
        {c.hint} <button type="button" className="auth-link" onClick={p.onToggle} disabled={p.busy}>{c.cta}</button>
      </p>
    </div>
  )
}

function ForgotFace({ initialEmail, onBack }: { initialEmail: string; onBack: () => void }) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) return setError('Enter a valid email address.')
    setBusy(true)
    setError('')
    try {
      await forgotPassword(email.trim())
      // The same message whether or not an account exists, so this cannot be used to look up who has one.
      setSent(true)
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card card">
      <h1 className="auth-title">Reset your password</h1>
      {sent ? (
        <>
          <p className="muted">If an account exists for <strong>{email.trim()}</strong>, we have emailed a reset link and a 6-digit code. It can take a minute to arrive.</p>
          <p style={{ marginTop: 20 }}><button type="button" className="btn secondary" onClick={onBack}>Back to sign in</button></p>
        </>
      ) : (
        <form className="stack" onSubmit={onSubmit} noValidate>
          <p className="muted" style={{ marginTop: 0 }}>Enter the email on your account and we will send you a link to choose a new password.</p>
          <div className="field">
            <label className="label" htmlFor="forgot-email">Email</label>
            <input id="forgot-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="btn auth-submit" type="submit" disabled={busy}>{busy ? 'Sending' : 'Send reset link'}</button>
          <p className="auth-switch"><button type="button" className="auth-link" onClick={onBack}>Back to sign in</button></p>
        </form>
      )}
    </div>
  )
}

function VerifyFace({ email, onDone, onBack }: { email: string; onDone: () => void; onBack: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resent, setResent] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code from your email.')
    setBusy(true)
    setError('')
    try {
      await verifyCode(code.trim())
      onDone()
    } catch (err) {
      setError(messageOf(err))
      setBusy(false)
    }
  }

  async function onResend() {
    setError('')
    setResent(false)
    try {
      await resendCode()
      setResent(true)
    } catch (err) {
      setError(messageOf(err))
    }
  }

  return (
    <div className="auth-card card">
      <h1 className="auth-title">Check your email</h1>
      <p className="muted auth-sub">We sent a 6-digit code{email ? <> to <strong>{email}</strong></> : null}. Enter it below, or open the link in the email.</p>
      <form className="stack" onSubmit={onSubmit} noValidate>
        <div className="field">
          <span className="label">Verification code</span>
          <OtpInput value={code} onChange={setCode} disabled={busy} />
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {resent && !error ? <p className="locked-note" role="status">A new code is on its way.</p> : null}
        <button className="btn auth-submit" type="submit" disabled={busy || code.length < 6}>{busy ? 'Verifying' : 'Verify'}</button>
      </form>
      <p className="auth-switch" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" className="auth-link" onClick={onBack}>Back</button>
        <button type="button" className="auth-link" onClick={onResend}>Resend code</button>
      </p>
    </div>
  )
}
