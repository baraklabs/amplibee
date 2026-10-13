'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { api, ApiError } from '../lib/api.ts'
import { utmFromLocation } from './CheckForm.tsx'
import { Turnstile } from './Turnstile.tsx'

export function NoWebsiteForm() {
  const router = useRouter()
  const [f, setF] = useState({ sells: '', customer: '', markets: '' })
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reset, setReset] = useState(0)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (f.sells.trim().length < 3) return setError('Tell us what you sell, in a few words.')
    if (f.customer.trim() && f.customer.trim().length < 3) return setError('Add a few more words about your ideal customer, or leave it empty.')
    if (f.markets.trim() && f.markets.trim().length < 2) return setError('Add a few more words about your markets, or leave it empty.')
    if (!token) return setError('The bot check is still loading. Wait a moment and try again.')
    setBusy(true)
    try {
      const r = await api.createCheck({ no_website: { sells: f.sells.trim(), ...(f.customer.trim() ? { customer: f.customer.trim() } : {}), ...(f.markets.trim() ? { markets: f.markets.trim() } : {}) }, turnstile_token: token, utm: utmFromLocation() })
      router.push(`/company/explore?job=${r.job_id}&phase=running`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
      setReset((n) => n + 1)
      setBusy(false)
    }
  }

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  return (
    <form className="check-form stack" onSubmit={submit} noValidate>
      <div className="field">
        <label className="label" htmlFor="sells">What do you sell?</label>
        <input id="sells" type="text" maxLength={200} value={f.sells} onChange={set('sells')} placeholder="Invoicing software for freelance designers" />
      </div>
      <div className="field">
        <label className="label" htmlFor="customer">Who is your ideal customer? <span className="muted">(optional)</span></label>
        <input id="customer" type="text" maxLength={200} value={f.customer} onChange={set('customer')} placeholder="Solo designers who bill 5 to 20 clients a month" />
      </div>
      <div className="field">
        <label className="label" htmlFor="markets">Which markets do you want to sell in? <span className="muted">(optional)</span></label>
        <input id="markets" type="text" maxLength={200} value={f.markets} onChange={set('markets')} placeholder="United States, United Kingdom, India" />
      </div>
      <Turnstile onToken={setToken} resetKey={reset} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div style={{ textAlign: 'center' }}>
        <button className="btn" type="submit" disabled={busy}>{busy ? <><span className="btn-spin" aria-hidden="true" />Starting</> : 'Build my launch plan'}</button>
      </div>
    </form>
  )
}
