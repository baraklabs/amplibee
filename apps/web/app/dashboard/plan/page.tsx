'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, ApiError } from '../../../lib/api.ts'
import { notifyAccountChanged } from '../../../lib/auth.ts'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Meter, PageHead } from '../../../components/dashboard/ui.tsx'
import { annualPerMonth, annualTotal, LIMITS, type PlanId, PLANS, planById } from '../../../lib/content/plans.ts'

export default function PlanPage() {
  const { plan, limits, ws, me } = useDash()
  const canSwitch = !!me.can_switch_plan
  const [confirm, setConfirm] = useState<PlanId | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [annual, setAnnual] = useState(false)
  const [want, setWant] = useState<PlanId | null>(null)
  const idx = PLANS.findIndex((p) => p.id === plan)

  useEffect(() => {
    const w = new URLSearchParams(window.location.search).get('want')
    if (PLANS.some((p) => p.id === w)) {
      setWant(w as PlanId)
      setConfirm(w as PlanId)
    }
  }, [])

  async function switchTo(id: PlanId) {
    setBusy(true)
    setMessage(null)
    try {
      await api.switchPlan(id)
      notifyAccountChanged()
      setMessage({ ok: true, text: `You are now on the ${planById(id).name} plan.` })
      setConfirm(null)
      setWant(null)
    } catch (e) {
      setMessage({ ok: false, text: e instanceof ApiError ? e.message : 'Could not change your plan. Try again.' })
    } finally {
      setBusy(false)
    }
  }

  const target = confirm && confirm !== plan ? planById(confirm) : null

  return (
    <>
      <PageHead title="Plan and billing" sub={`You are on the ${planById(plan).name} plan.`} />

      <div className="dash-cols">
        <div className="dash-col wide">
          {message ? <p className={message.ok ? 'nudge' : 'field-error'} role="status">{message.text}</p> : null}
          {target && canSwitch ? (
            <div className="nudge" role="alertdialog" aria-label="Confirm plan change">
              <p>
                {PLANS.findIndex((p) => p.id === target.id) > idx ? 'Upgrade' : 'Switch'} to <strong>{target.name}</strong>
                {target.monthly ? ` at $${annual ? annualPerMonth(target.monthly) : target.monthly} a month` : ''}?
                {PLANS.findIndex((p) => p.id === target.id) < idx ? ' Anything over the new limits is trimmed the next time your dashboard saves.' : ''}
              </p>
              <span className="locked-actions">
                <button type="button" className="btn small" disabled={busy} onClick={() => switchTo(target.id)}>{busy ? 'Changing' : 'Confirm'}</button>
                <button type="button" className="btn small secondary" disabled={busy} onClick={() => setConfirm(null)}>Cancel</button>
              </span>
            </div>
          ) : null}

          <div className="billing" role="group" aria-label="Billing period">
            <button type="button" className={annual ? '' : 'on'} aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
            <button type="button" className={`annual-btn${annual ? ' on' : ''}`} aria-pressed={annual} onClick={() => setAnnual(true)}>Annually <span className="save">2 months free</span></button>
          </div>

          <div className="plan-grid">
            {PLANS.map((p, i) => {
              const current = p.id === plan
              const price = p.monthly === 0 ? '$0' : `$${annual ? annualPerMonth(p.monthly) : p.monthly}`
              return (
                <article key={p.id} className="card plan-tile" data-current={current ? 'true' : undefined} data-want={want === p.id ? 'true' : undefined}>
                  <h3>{p.name} {current ? <span className="plan-badge">Current</span> : null}</h3>
                  <p className="plan-price">{price}<small>{p.monthly === 0 ? 'forever' : 'per month'}</small></p>
                  {annual && p.monthly ? <p className="muted caption">Billed ${annualTotal(p.monthly)} a year</p> : null}
                  <p className="muted">{p.blurb}</p>
                  <ul className="ticks small-list">
                    <li>{LIMITS[p.id].competitors} competitors</li>
                    <li>{LIMITS[p.id].keywords ? `${LIMITS[p.id].keywords} keywords` : 'No keyword tracking'}</li>
                    <li>{LIMITS[p.id].directories ? `${LIMITS[p.id].directories}${p.id === 'authority' ? '+' : ''} directory submissions` : 'No submissions'}</li>
                    <li>{LIMITS[p.id].blogPosts ? `${LIMITS[p.id].blogPosts} blog posts` : 'No blog posts'}</li>
                    {LIMITS[p.id].aiVisibility ? <li>AI visibility</li> : null}
                  </ul>
                  {current ? (
                    <span className="btn secondary" aria-disabled="true">Your plan</span>
                  ) : canSwitch ? (
                    <button type="button" className={`btn${i > idx ? '' : ' secondary'}`} onClick={() => { setMessage(null); setConfirm(p.id) }}>{i > idx ? 'Upgrade' : 'Switch'} to {p.name}</button>
                  ) : (
                    <Link className={`btn${i > idx ? '' : ' secondary'}`} href={`/contact?topic=upgrade&plan=${p.id}`}>{i > idx ? 'Upgrade' : 'Switch'} to {p.name}</Link>
                  )}
                </article>
              )
            })}
          </div>
          <p className="caption muted">{canSwitch ? 'Test mode: plan changes apply straight away and nothing is charged.' : 'We confirm what each paid plan includes by email before anything is charged.'} <Link href="/pricing">Full comparison</Link></p>
        </div>

        <div className="dash-col">
          <section className="card pad">
            <h2>Usage</h2>
            <Meter used={ws.competitors.length} max={limits.competitors} label="Competitors" />
            {limits.keywords ? <Meter used={ws.keywords.length} max={limits.keywords} label="Keywords" /> : null}
            {limits.directories ? <Meter used={Object.keys(ws.directories).length} max={limits.directories} label="Directory submissions" /> : null}
          </section>
        </div>
      </div>
    </>
  )
}
