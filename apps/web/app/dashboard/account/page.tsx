'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { PageHead } from '../../../components/dashboard/ui.tsx'
import { AuthError, forgotPassword, signOut, updateName } from '../../../lib/auth.ts'
import { planById } from '../../../lib/content/plans.ts'
import { dateLabel } from '../../../lib/format.ts'

const messageOf = (e: unknown) => (e instanceof AuthError ? e.message : 'Something went wrong. Try again.')

export default function Account() {
  const router = useRouter()
  const { me, plan, ws } = useDash()
  const [name, setName] = useState(me.name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [nameError, setNameError] = useState('')
  const [reset, setReset] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [resetError, setResetError] = useState('')

  useEffect(() => setName(me.name ?? ''), [me.name])

  async function saveName(e: FormEvent) {
    e.preventDefault()
    setNameError('')
    setSaved(false)
    if (!name.trim()) return setNameError('Enter your name.')
    setSaving(true)
    try {
      await updateName(name.trim())
      setSaved(true)
    } catch (err) {
      setNameError(messageOf(err))
    } finally {
      setSaving(false)
    }
  }

  async function sendReset() {
    setReset('sending')
    setResetError('')
    try {
      await forgotPassword(me.email)
      setReset('sent')
    } catch (err) {
      setResetError(messageOf(err))
      setReset('idle')
    }
  }

  async function logout() {
    await signOut()
    router.push('/')
  }

  const current = planById(plan)
  const unchanged = name.trim() === (me.name ?? '')

  return (
    <>
      <PageHead title="Account" sub="Your profile, sign-in and plan." />

      <div className="dash-cols">
        <div className="dash-col">
          <section className="card pad" aria-labelledby="ac-profile">
            <h2 id="ac-profile">Profile</h2>
            <form className="add-row" onSubmit={saveName} noValidate>
              <label className="label" htmlFor="ac-name">Name</label>
              <div className="add-row-fields">
                <input id="ac-name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} maxLength={100} autoComplete="name" />
                <button type="submit" className="btn" disabled={saving || unchanged || !name.trim()}>{saving ? 'Saving' : 'Save'}</button>
              </div>
              {nameError ? <p className="field-error" role="alert">{nameError}</p> : null}
              {saved ? <p className="muted" role="status">Saved.</p> : null}
            </form>
            <dl className="account-list">
              <div><dt className="label">Email</dt><dd>{me.email}</dd></div>
              {me.created_at ? <div><dt className="label">Member since</dt><dd>{dateLabel(me.created_at)}</dd></div> : null}
            </dl>
          </section>

          <section className="card pad" aria-labelledby="ac-security">
            <h2 id="ac-security">Password</h2>
            {me.has_password ? (
              <>
                <p className="muted">To change your password, we email a link to {me.email}.</p>
                {reset === 'sent' ? <p role="status">Check your inbox. The link lets you choose a new password.</p> : (
                  <p><button type="button" className="btn secondary" onClick={sendReset} disabled={reset === 'sending'}>{reset === 'sending' ? 'Sending' : 'Email me a reset link'}</button></p>
                )}
                {resetError ? <p className="field-error" role="alert">{resetError}</p> : null}
              </>
            ) : (
              <p className="muted">You sign in with Google, so there is no Amplibee password to manage.</p>
            )}
          </section>

          <section className="card pad" aria-labelledby="ac-out">
            <h2 id="ac-out">Sign out</h2>
            <p className="muted">This ends your session on this device.</p>
            <p><button type="button" className="btn secondary" onClick={logout}>Sign out</button></p>
          </section>
        </div>

        <div className="dash-col">
          <section className="card pad" aria-labelledby="ac-plan">
            <div className="card-head">
              <h2 id="ac-plan">Your plan</h2>
              <span className="plan-badge">{current.name}</span>
            </div>
            <p className="muted">{current.blurb}</p>
            {me.trial_ends_at ? <p className="trial-left">Free trial ends {dateLabel(me.trial_ends_at)}</p> : null}
            <p className="locked-actions">
              <Link className="btn" href="/pricing">{plan === 'authority' ? 'See plans' : 'Upgrade'}</Link>
              <Link className="btn secondary" href="/dashboard/plan">Plan details</Link>
            </p>
          </section>

          <section className="card pad" aria-labelledby="ac-data">
            <h2 id="ac-data">What you have set up</h2>
            <ul className="auto-summary">
              <li><strong>{ws.domain || '-'}</strong><span className="muted">Website</span></li>
              <li><strong>{ws.competitors.length}</strong><span className="muted">Competitors</span></li>
              <li><strong>{ws.keywords.length}</strong><span className="muted">Keywords</span></li>
              <li><strong>{Object.keys(ws.directories).length}</strong><span className="muted">Directories</span></li>
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
