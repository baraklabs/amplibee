'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { annualPerMonth, annualTotal, PLANS, TRIAL_DAYS } from '../lib/content/plans.ts'
import { PlanConfirm } from './PlanConfirm.tsx'
import { useAccount } from './useAccount.ts'

const usd = (n: number) => `$${n.toLocaleString('en-US')}`

/** The plans with a Monthly / Annually switch. Every paid plan starts with a 7-day free trial. Annual billing is twelve months for the price of ten. */
export function PricingPlans() {
  const [annual, setAnnual] = useState(false)
  const me = useAccount()
  const [target, setTarget] = useState<number | null>(null) // index of the plan the popup asks about
  const canSwitch = !!me?.can_switch_plan
  const trialFor = (monthly: number) => monthly > 0 && !!me?.trial_available && !me.trial_ends_at
  const current = me ? PLANS.findIndex((p) => p.id === (me.plan ?? 'free')) : -1 // -1 when signed out
  // /pricing?plan=plus (from an Upgrade button) opens the popup for that plan once, then drops the parameter so a reload does not reopen it.
  useEffect(() => {
    if (!me || !me.can_switch_plan) return
    const url = new URL(window.location.href)
    const id = url.searchParams.get('plan')
    if (!id) return
    const i = PLANS.findIndex((p) => p.id === id)
    if (i >= 0 && i !== current) setTarget(i)
    url.searchParams.delete('plan')
    window.history.replaceState(null, '', url)
  }, [me, current])

  return (
    <section className="section" aria-label="Plans">
      <div className="wrap">

        <div className="billing" role="group" aria-label="Billing period">
          <button type="button" className={annual ? '' : 'on'} aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
          <button type="button" className={`annual-btn${annual ? ' on' : ''}`} aria-pressed={annual} onClick={() => setAnnual(true)}>
            Annually <span className="save">2 months free</span>
          </button>
        </div>

        <div className="plans">
          {PLANS.map((p, i) => (
            <div className={`card plan${(p.id === 'growth' && current < 0) || i === current ? ' pick' : ''}`} key={p.id}>
              {i === current ? <span className="popular">Your current plan</span> : p.id === 'growth' && current < 0 ? <span className="popular">Most popular</span> : null}
              <h3>{p.name}</h3>
              {p.monthly > 0 ? <p className="trial-tag">{TRIAL_DAYS}-day free trial</p> : null}
              <p className="plan-price">
                {p.monthly === 0 ? (
                  <>$0<small>forever</small></>
                ) : annual ? (
                  <>{usd(annualPerMonth(p.monthly))}<small>per month</small></>
                ) : (
                  <>{usd(p.monthly)}<small>per month</small></>
                )}
              </p>
              <p className="plan-bill muted">
                {p.monthly === 0 ? 'No card, no account needed to start' : annual ? `Billed ${usd(annualTotal(p.monthly))} a year after ${TRIAL_DAYS} free days. You save ${usd(p.monthly * 12 - annualTotal(p.monthly))}.` : `Then billed monthly after ${TRIAL_DAYS} free days. Cancel any time.`}
              </p>
              <p className="plan-blurb">{p.blurb}</p>
              {p.includes ? <p className="plan-inc">{p.includes}</p> : null}
              <ul>
                {p.features.map((f) => <li key={f} className={i > 1 && !PLANS[i - 1].features.includes(f) ? 'up' : undefined}>{f}</li>)}
              </ul>
              {current < 0 ? (
                <Link className={`btn${p.monthly === 0 ? ' secondary' : ''}`} href="/sign-in?mode=signup">{p.monthly === 0 ? 'Start free' : `Start ${TRIAL_DAYS}-day free trial`}</Link>
              ) : i === current ? (
                <Link className="btn secondary" href="/dashboard">Go to your dashboard</Link>
              ) : canSwitch ? (
                <button type="button" className={`btn${i > current ? '' : ' secondary'}`} onClick={() => setTarget(i)}>{trialFor(p.monthly) ? 'Start free trial' : `${i > current ? 'Upgrade' : 'Switch'} to ${p.name}`}</button>
              ) : (
                <Link className={`btn${i > current ? '' : ' secondary'}`} href={`/contact?topic=upgrade&plan=${p.id}`}>{i > current ? 'Upgrade' : 'Switch'} to {p.name}</Link>
              )}
            </div>
          ))}
        </div>

        {target !== null && current >= 0 ? <PlanConfirm from={PLANS[current]} to={PLANS[target]} annual={annual} trial={trialFor(PLANS[target].monthly)} onClose={() => setTarget(null)} /> : null}

        <p className="caption" style={{ textAlign: 'center', marginTop: 18 }}>
          Annual billing is twelve months for the price of ten. We confirm what each paid plan includes by email before anything is charged.
        </p>
      </div>
    </section>
  )
}
