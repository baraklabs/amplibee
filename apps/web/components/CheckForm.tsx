'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api.ts'
import { NoWebsiteModal } from './NoWebsiteModal.tsx'
import { Turnstile } from './Turnstile.tsx'

export function utmFromLocation(): Record<string, string> {
  const out: Record<string, string> = {}
  new URLSearchParams(window.location.search).forEach((v, k) => {
    if (k.startsWith('utm_') && Object.keys(out).length < 8) out[k] = v.slice(0, 100)
  })
  return out
}

const PREFIX = 'Paste your website, e.g., '
const DEMO_DOMAINS = ['linear.app', 'plausible.io', 'resend.com', 'posthog.com']

/** Types example domains into the placeholder, deletes them and moves on. Only runs while the field is empty and unfocused. */
function useTypingPlaceholder(active: boolean) {
  const [text, setText] = useState(DEMO_DOMAINS[0])
  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(DEMO_DOMAINS[0])
      return
    }
    let n = 0
    let len = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>
    const step = () => {
      const word = DEMO_DOMAINS[n % DEMO_DOMAINS.length]
      if (!deleting) {
        len++
        setText(word.slice(0, len))
        if (len === word.length) {
          deleting = true
          timer = setTimeout(step, 1700)
          return
        }
        timer = setTimeout(step, 85)
      } else {
        len--
        setText(word.slice(0, len))
        if (len === 0) {
          deleting = false
          n++
          timer = setTimeout(step, 350)
          return
        }
        timer = setTimeout(step, 40)
      }
    }
    len = 0
    timer = setTimeout(step, 6000)
    return () => clearTimeout(timer)
  }, [active])
  return text
}

export function CheckForm() {
  const router = useRouter()
  const [domain, setDomain] = useState('')
  const [focused, setFocused] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reset, setReset] = useState(0)
  const typed = useTypingPlaceholder(!focused && domain === '')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!domain.trim()) return setError('Enter your website address, for example example.com.')
    if (!token) return setError('The bot check is still loading. Wait a moment and try again.')
    setBusy(true)
    try {
      const r = await api.createCheck({ domain: domain.trim(), turnstile_token: token, utm: utmFromLocation() })
      router.push(`/company/${encodeURIComponent(r.domain ?? domain.trim())}/explore?job=${r.job_id}&phase=running`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
      setReset((n) => n + 1)
      setBusy(false)
    }
  }

  return (
    <>
    <form className="check-form" onSubmit={submit} noValidate>
      <label className="label" htmlFor="domain">Your website</label>
      <div className="check-row">
        <input
          id="domain"
          name="domain"
          type="text"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={`${PREFIX}${typed}`}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {domain.trim() ? (
          <button className="btn" type="submit" disabled={busy}>{busy ? <><span className="btn-spin" aria-hidden="true" />Starting</> : 'Check my site'}</button>
        ) : null}
      </div>
      {domain.trim() ? (
        <button className="check-suggest" type="submit" disabled={busy}>
          <span className="domain">{domain.trim()}</span>
          <span className="hint">{busy ? 'Starting…' : 'Run AI research'}</span>
          <span aria-hidden="true">→</span>
        </button>
      ) : null}
      <Turnstile onToken={setToken} resetKey={reset} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
    {/* Outside the form: a form nested in a form would also fire this form's submit handler. */}
    <NoWebsiteModal />
    </>
  )
}
