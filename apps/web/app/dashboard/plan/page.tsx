'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Meter, PageHead } from '../../../components/dashboard/ui.tsx'
import { annualPerMonth, annualTotal, LIMITS, type PlanId, PLANS, planById } from '../../../lib/content/plans.ts'

export default function PlanPage() {
  const { plan, limits, ws } = useDash()
  const [annual, setAnnual] = useState(false)
  const [want, setWant] = useState<PlanId | null>(null)
  const idx = PLANS.findIndex((p) => p.id === plan)

  useEffect(() => {
    const w = new URLSearchParams(window.location.search).get('want')
    if (PLANS.some((p) => p.id === w)) setWant(w as PlanId)
  }, [])

  return (
    <>
      <PageHead title="Plan and billing" sub={`You are on the ${planById(plan).name} plan.`} />

      <div className="dash-cols">
        <div className="dash-col wide">
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
                  ) : i > idx ? (
                    <Link className="btn" href={`/contact?topic=upgrade&plan=${p.id}`}>Upgrade to {p.name}</Link>
                  ) : (
                    <Link className="btn secondary" href={`/contact?topic=upgrade&plan=${p.id}`}>Switch to {p.name}</Link>
                  )}
                </article>
              )
            })}
          </div>
          <p className="caption muted">We confirm what each paid plan includes by email before anything is charged. <Link href="/pricing">Full comparison</Link></p>
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
