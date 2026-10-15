'use client'

import { useState } from 'react'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Gate, LockedPage, PageHead, Sketch, UpgradeNudge } from '../../../components/dashboard/ui.tsx'
import { PLANS, LIMITS } from '../../../lib/content/plans.ts'
import { CATEGORY_LABEL } from '../../../lib/format.ts'
import type { Report } from '../../../lib/shared/types.ts'

const CATS: (keyof Report['sub_scores'])[] = ['discoverability', 'buzz', 'trust', 'technical']

function Trend({ points }: { points: { date: string; score: number }[] }) {
  const W = 560
  const H = 160
  const pad = 24
  const xs = (i: number) => pad + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - pad * 2))
  const ys = (v: number) => H - pad - (v / 100) * (H - pad * 2)
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)} ${ys(p.score).toFixed(1)}`).join(' ')
  return (
    <svg className="trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Visibility score over time, latest ${points.at(-1)?.score}`}>
      {[0, 50, 100].map((g) => <g key={g}><line x1={pad} x2={W - pad} y1={ys(g)} y2={ys(g)} className="trend-grid" /><text x={0} y={ys(g) + 4} className="trend-axis">{g}</text></g>)}
      <path d={path} className="trend-line" fill="none" />
      {points.map((p, i) => <circle key={p.date} cx={xs(i)} cy={ys(p.score)} r="3.5" className="trend-dot"><title>{`${p.date}: ${p.score}`}</title></circle>)}
    </svg>
  )
}

export default function Analytics() {
  const { ws, limits, plan, report } = useDash()
  const [range, setRange] = useState<7 | 30>(7)
  const days = Math.min(range, limits.analyticsDays)
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
  const points = ws.history.filter((h) => h.date >= cutoff)
  const month = PLANS.find((p) => LIMITS[p.id].analyticsDays >= 30) ?? null

  return (
    <>
      <PageHead title="Analytics" sub="How your visibility changes over time." />
      <Gate
        feature="analytics"
        locked={
          <LockedPage feature="analytics" title="Watch your visibility move" text="See your score and its four parts change after every fix you make." bullets={['7 days of history on every paid plan', '1 month of analytics and tracking on Authority', 'Spot which fix moved the number']}>
            <Sketch rows={5} cols={5} />
          </LockedPage>
        }
      >
        <div className="range" role="group" aria-label="Time range">
          <button type="button" className={`chip-btn${range === 7 ? ' on' : ''}`} aria-pressed={range === 7} onClick={() => setRange(7)}>Last 7 days</button>
          <button type="button" className={`chip-btn${range === 30 ? ' on' : ''}`} aria-pressed={range === 30} onClick={() => setRange(30)} disabled={limits.analyticsDays < 30}>Last 30 days{limits.analyticsDays < 30 ? ' (Authority)' : ''}</button>
        </div>

        <section className="card pad">
          <h2>Visibility score</h2>
          {points.length >= 2 ? <Trend points={points} /> : <p className="muted">{points.length === 1 ? `One reading so far: ${points[0].score}. ` : ''}A line appears once there are readings from two different days. We record one each day you open the dashboard.</p>}
          <p className="caption muted">Readings are kept in this browser.</p>
        </section>

        {report ? (
          <section className="card pad">
            <h2>Right now</h2>
            <ul className="bars">
              {CATS.map((c) => <li key={c}><span>{CATEGORY_LABEL[c]}</span><span className="meter-bar"><span style={{ width: `${report.sub_scores[c] ?? 0}%` }} /></span><span className="mono">{report.sub_scores[c] ?? '-'}</span></li>)}
            </ul>
          </section>
        ) : null}

        {limits.analyticsDays < 30 ? <UpgradeNudge plan={month}>Want a full month and tracking? That comes with {month?.name}.</UpgradeNudge> : null}
        {plan === 'free' ? null : null}
      </Gate>
    </>
  )
}
