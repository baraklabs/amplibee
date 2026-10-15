'use client'

import Link from 'next/link'
import { type FormEvent, useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api.ts'
import { Turnstile } from './Turnstile.tsx'
import { useAccount } from './useAccount.ts'

const CATEGORIES = [
  'AI', 'AI Agents', 'Analytics', 'Business software', 'Chrome Extensions', 'Customer support', 'Design', 'Developer tools', 'E-commerce',
  'Education', 'Email', 'Finance', 'Health', 'Hiring', 'Mac utilities', 'Marketing', 'Mobile Apps', 'Productivity', 'Project Management',
  'SaaS', 'SEO', 'Security', 'Social Media', 'Other',
]
const PRICING = ['Free', 'Freemium', 'Paid', 'Lifetime deal']

const empty = {
  name: '',
  url: '',
  tagline: '',
  category: '',
  pricing: '',
  description: '',
  audience: '',
  problem: '',
  unique: '',
  logo: '',
  x: '',
  github: '',
  founder: '',
  email: '',
}

function normalizeUrl(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`)
    return u.hostname.includes('.') ? u.toString() : null
  } catch {
    return null
  }
}

/** Product submission form. It sends one structured message through the contact endpoint, so a person reviews each product before it is listed. */
export function SubmitForm() {
  const me = useAccount() // undefined while checking, null when signed out
  const [f, setF] = useState(empty)
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [reset, setReset] = useState(0)

  // Fill the contact details from the account once, without overwriting what was typed.
  useEffect(() => {
    if (me) setF((x) => ({ ...x, founder: x.founder || me.name || '', email: x.email || me.email }))
  }, [me])

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const host = (() => {
    const u = normalizeUrl(f.url)
    return u ? new URL(u).hostname.replace(/^www\./, '') : 'yourproduct.com'
  })()

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!me) return setError('Sign in to submit your product.')
    const url = f.url.trim() ? normalizeUrl(f.url) : null
    if (!f.name.trim()) return setError('Enter the product name.')
    if (f.url.trim() && !url) return setError('The website address is not valid. Use something like example.com, or leave it empty.')
    if (f.tagline.trim().length < 10) return setError('Write a one-line tagline of at least 10 characters.')
    if (!f.category) return setError('Choose a category.')
    if (!f.pricing) return setError('Choose a pricing model.')
    if (!f.founder.trim()) return setError('Enter your name.')
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.')
    if (!token) return setError('The bot check is still loading. Wait a moment and try again.')
    const logo = f.logo.trim() ? normalizeUrl(f.logo) : null
    if (f.logo.trim() && !logo) return setError('The logo link is not a valid address.')

    setBusy(true)
    try {
      await api.submitLaunch({
        name: f.name.trim(),
        url: url ?? '',
        tagline: f.tagline.trim(),
        category: f.category,
        pricing: f.pricing,
        description: f.description.trim(),
        audience: f.audience.trim(),
        problem: f.problem.trim(),
        unique: f.unique.trim(),
        logo: logo ?? '',
        x: f.x.trim(),
        github: f.github.trim(),
        founder: f.founder.trim(),
        email: f.email.trim(),
        turnstile_token: token,
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again, or email hello@amplibee.com.')
      setReset((n) => n + 1)
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="contact-done" role="status">
        <h2 style={{ borderTop: 0, marginTop: 0 }}>Submission received</h2>
        <p>Thanks, {f.founder.trim().split(' ')[0]}. We review every product by hand and will email {f.email.trim()} when {f.name.trim()} is live or if we need anything more.</p>
      </div>
    )
  }

  return (
    <div className="submit-grid">
      <form className="contact-form stack" onSubmit={submit} noValidate>
        {me === null ? <SignInNote /> : null}
        <div className="submit-sec">
        <div className="two">
          <div className="field">
            <label className="label" htmlFor="s-name">Product name *</label>
            <input id="s-name" type="text" maxLength={30} value={f.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label className="label" htmlFor="s-url">Website <span className="muted">(optional)</span></label>
            <input id="s-url" type="text" inputMode="url" autoComplete="url" maxLength={200} placeholder="example.com" value={f.url} onChange={set('url')} />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="s-tag">Tagline * <span className="muted">({f.tagline.length}/140)</span></label>
          <input id="s-tag" type="text" maxLength={140} placeholder="One line on what it does" value={f.tagline} onChange={set('tagline')} />
        </div>
        <div className="two">
          <div className="field">
            <label className="label" htmlFor="s-cat">Category *</label>
            <select id="s-cat" value={f.category} onChange={set('category')}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="s-price">Pricing *</label>
            <select id="s-price" value={f.pricing} onChange={set('pricing')}>
              <option value="">Choose pricing</option>
              {PRICING.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        </div>

        <div className="submit-sec">
        <div className="field">
          <label className="label" htmlFor="s-desc">Description</label>
          <textarea id="s-desc" rows={4} maxLength={900} placeholder="What it is, how it works and what you get." value={f.description} onChange={set('description')} />
        </div>
        <div className="two">
          <div className="field">
            <label className="label" htmlFor="s-aud">Who it is for</label>
            <input id="s-aud" type="text" maxLength={160} placeholder="Founders, developers, retailers…" value={f.audience} onChange={set('audience')} />
          </div>
          <div className="field">
            <label className="label" htmlFor="s-prob">Problem it solves</label>
            <input id="s-prob" type="text" maxLength={200} value={f.problem} onChange={set('problem')} />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="s-uniq">What makes it different</label>
          <input id="s-uniq" type="text" maxLength={240} value={f.unique} onChange={set('unique')} />
        </div>

        </div>

        <div className="submit-sec">
        <div className="field">
          <label className="label" htmlFor="s-logo">Logo link</label>
          <input id="s-logo" type="text" inputMode="url" maxLength={300} placeholder="https://example.com/logo.png (square image)" value={f.logo} onChange={set('logo')} />
        </div>
        <div className="two">
          <div className="field">
            <label className="label" htmlFor="s-x">X (Twitter)</label>
            <input id="s-x" type="text" maxLength={120} placeholder="@handle or link" value={f.x} onChange={set('x')} />
          </div>
          <div className="field">
            <label className="label" htmlFor="s-gh">GitHub</label>
            <input id="s-gh" type="text" maxLength={160} placeholder="Repository or organisation link" value={f.github} onChange={set('github')} />
          </div>
        </div>

        </div>

        <div className="submit-sec">
        <div className="two">
          <div className="field">
            <label className="label" htmlFor="s-founder">Your name *</label>
            <input id="s-founder" type="text" autoComplete="name" maxLength={120} value={f.founder} onChange={set('founder')} />
          </div>
          <div className="field">
            <label className="label" htmlFor="s-email">Email *</label>
            <input id="s-email" type="email" autoComplete="email" maxLength={254} value={f.email} onChange={set('email')} />
          </div>
        </div>
        </div>

        <Turnstile onToken={setToken} resetKey={reset} />
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {me === null ? (
          <SignInNote bottom />
        ) : (
          <div className="submit-actions">
            <p className="muted submit-note">Free to submit. We review each product by hand before it is listed.</p>
            <button className="btn" type="submit" disabled={busy || me === undefined}>{busy ? 'Sending' : 'Submit for review'}</button>
          </div>
        )}
      </form>

      <aside className="submit-preview" aria-label="Preview">
        <span className="label">Live preview</span>
        <div className="su-card">
          <div className="su-top">
            <span className="submit-mark" aria-hidden="true">{(f.name.trim()[0] ?? 'P').toUpperCase()}</span>
            <div className="su-id">
              <strong>{f.name.trim() || 'Product name'}</strong>
              <span className="muted">{host}</span>
            </div>
          </div>
          <p className="su-tag">{f.tagline.trim() || 'A short line about what it does.'}</p>
          <div className="su-foot">
            <span className="tag">{f.category || 'Category'}</span>
            <span className="muted">{f.pricing || 'Pricing'}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

/** Shown above and below the form to visitors who are signed out. */
function SignInNote({ bottom = false }: { bottom?: boolean }) {
  const next = encodeURIComponent('/launch-your-product')
  return (
    <div className={`submit-signin${bottom ? ' bottom' : ''}`} role="note">
      <p><strong>Sign in to submit your product for free.</strong></p>
      <Link className="btn small" href={`/sign-in?next=${next}`}>Sign in to submit</Link>
    </div>
  )
}
