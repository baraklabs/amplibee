'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { type Feature, hasFeature, planFor, type Plan } from '../../lib/content/plans.ts'
import { useDash } from './DashboardContext.tsx'

/** Every upgrade button ends up on the pricing page. With a plan, its confirm popup opens there straight away. */
export const upgradeHref = (plan?: Plan | null) => (plan ? `/pricing?plan=${plan.id}` : '/pricing')

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <header className="dash-head">
      <div>
        <h1>{title}</h1>
        {sub ? <p className="muted">{sub}</p> : null}
      </div>
      {action ? <div className="dash-head-action">{action}</div> : null}
    </header>
  )
}

/** A used / allowed bar. Turns amber near the limit. */
export function Meter({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 100
  return (
    <div className="meter" data-near={pct >= 80 ? 'true' : undefined}>
      <div className="meter-row"><span>{label}</span><span className="mono">{used} / {max}</span></div>
      <div className="meter-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={used}><span style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

/** A short upgrade prompt. `plan` is the plan to push; renders nothing when there is none. */
export function UpgradeNudge({ plan, children }: { plan: Plan | null; children: ReactNode }) {
  if (!plan) return null
  return (
    <div className="nudge">
      <p>{children}</p>
      <Link className="btn small" href={upgradeHref(plan)}>Upgrade to {plan.name}</Link>
    </div>
  )
}

/**
 * Replaces a page the current plan does not include: a blurred sketch of what it holds, and what the cheapest
 * plan that unlocks it costs. The sketch is decoration, never real data.
 */
export function LockedPage({ feature, title, text, bullets, children }: { feature: Feature; title: string; text: string; bullets: string[]; children?: ReactNode }) {
  const plan = planFor(feature)
  return (
    <div className="locked-page">
      <div className="locked-preview" aria-hidden="true">{children}</div>
      <div className="locked-card card">
        <span className="lock-chip">{plan.name} plan</span>
        <h2>{title}</h2>
        <p className="muted">{text}</p>
        <ul className="ticks">{bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        <p className="locked-actions">
          <Link className="btn" href={upgradeHref(plan)}>Upgrade to {plan.name}: ${plan.monthly}/mo</Link>
          <Link className="btn secondary" href="/pricing">Compare plans</Link>
        </p>
      </div>
    </div>
  )
}

/** Shows the locked view when the plan lacks the feature, the page otherwise. */
export function Gate({ feature, locked, children }: { feature: Feature; locked: ReactNode; children: ReactNode }) {
  const { plan } = useDash()
  return hasFeature(plan, feature) ? <>{children}</> : <>{locked}</>
}

export function ScoreRing({ score, size = 96 }: { score: number | null; size?: number }) {
  const r = 40
  const c = 2 * Math.PI * r
  const v = score ?? 0
  return (
    <svg className="ring" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={score === null ? 'No score yet' : `Visibility score ${score} out of 100`}>
      <circle cx="50" cy="50" r={r} className="ring-track" />
      <circle cx="50" cy="50" r={r} className="ring-fill" strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
      <text x="50" y="56" textAnchor="middle" className="ring-num">{score === null ? '-' : score}</text>
    </svg>
  )
}

/** A fake-looking grey table used behind locked pages. */
export function Sketch({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="sketch">
      {Array.from({ length: rows }, (_, r) => (
        <div className="sketch-row" key={r}>
          {Array.from({ length: cols }, (_, c) => <span key={c} style={{ width: `${40 + ((r * 7 + c * 13) % 45)}%` }} />)}
        </div>
      ))}
    </div>
  )
}
