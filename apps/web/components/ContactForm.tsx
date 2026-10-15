'use client'

import { type FormEvent, useState } from 'react'
import { api, ApiError } from '../lib/api.ts'
import { Turnstile } from './Turnstile.tsx'

const TOPICS: { value: string; label: string }[] = [
  { value: 'general', label: 'A general question' },
  { value: 'upgrade', label: 'Upgrading my plan' },
  { value: 'custom_plan', label: 'A custom plan' },
  { value: 'directory_submission', label: 'Directory submissions' },
  { value: 'content', label: 'Blog posts and content' },
  { value: 'press', label: 'Press or partnerships' },
]

export function ContactForm({ initialTopic = 'general' }: { initialTopic?: string }) {
  const [f, setF] = useState({
    name: '',
    email: '',
    company: '',
    topic: TOPICS.some((t) => t.value === initialTopic) ? initialTopic : 'general',
    message: '',
  })
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [reset, setReset] = useState(0)

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!f.name.trim()) return setError('Tell us your name.')
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.')
    if (f.message.trim().length < 10) return setError('Write a few words so we know how to help.')
    if (!token) return setError('The bot check is still loading. Wait a moment and try again.')
    setBusy(true)
    try {
      await api.sendContact({
        name: f.name.trim(),
        email: f.email.trim(),
        company: f.company.trim() || undefined,
        topic: f.topic,
        message: f.message.trim(),
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
        <h2 style={{ borderTop: 0, marginTop: 0 }}>Message sent</h2>
        <p>Thanks, {f.name.trim().split(' ')[0]}. We will reply to {f.email.trim()} within one working day.</p>
      </div>
    )
  }

  return (
    <form className="contact-form stack" onSubmit={submit} noValidate>
      <div className="two">
        <div className="field">
          <label className="label" htmlFor="c-name">Name</label>
          <input id="c-name" type="text" autoComplete="name" maxLength={120} value={f.name} onChange={set('name')} />
        </div>
        <div className="field">
          <label className="label" htmlFor="c-email">Email</label>
          <input id="c-email" type="email" autoComplete="email" maxLength={254} value={f.email} onChange={set('email')} />
        </div>
      </div>
      <div className="two">
        <div className="field">
          <label className="label" htmlFor="c-company">Company or product (optional)</label>
          <input id="c-company" type="text" autoComplete="organization" maxLength={160} value={f.company} onChange={set('company')} />
        </div>
        <div className="field">
          <label className="label" htmlFor="c-topic">What is it about?</label>
          <select id="c-topic" value={f.topic} onChange={set('topic')}>
            {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="c-message">Message</label>
        <textarea id="c-message" rows={6} maxLength={3000} value={f.message} onChange={set('message')} placeholder="Tell us about your product and what you would like help with." />
      </div>
      <Turnstile onToken={setToken} resetKey={reset} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div>
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Sending' : 'Send message'}</button>
      </div>
    </form>
  )
}
