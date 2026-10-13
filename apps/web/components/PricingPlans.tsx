'use client'

import Link from 'next/link'
import { useState } from 'react'
import { annualPerMonth, annualTotal, PLANS } from '../lib/content/plans.ts'

const usd = (n: number) => `$${n.toLocaleString('en-US')}`

/** The plans with a Monthly / Annually switch. Annual billing is twelve months for the price of ten. */
export function PricingPlans() {
  const [annual, setAnnual] = useState(false)

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
            <div className={`card plan${p.id === 'growth' ? ' pick' : ''}`} key={p.id}>
              {p.id === 'growth' ? <span className="popular">Most popular</span> : null}
              <h3>{p.name}</h3>
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
                {p.monthly === 0 ? 'No card, no account needed to start' : annual ? `Billed ${usd(annualTotal(p.monthly))} a year. You save ${usd(p.monthly * 12 - annualTotal(p.monthly))}.` : 'Billed monthly. Cancel any time.'}
              </p>
              <p className="plan-blurb">{p.blurb}</p>
              {p.includes ? <p className="plan-inc">{p.includes}</p> : null}
              <ul>
                {p.features.map((f) => <li key={f} className={i > 1 && !PLANS[i - 1].features.includes(f) ? 'up' : undefined}>{f}</li>)}
              </ul>
              <Link className={`btn${p.monthly === 0 ? ' secondary' : ''}`} href="/sign-in?mode=signup">{p.monthly === 0 ? 'Start free' : 'Get started'}</Link>
            </div>
          ))}
        </div>

        <p className="caption" style={{ textAlign: 'center', marginTop: 18 }}>
          Annual billing is twelve months for the price of ten. We confirm what each paid plan includes by email before anything is charged.
        </p>
      </div>
    </section>
  )
}
