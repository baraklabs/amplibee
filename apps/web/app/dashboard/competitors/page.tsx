'use client'

import { AddRow } from '../../../components/dashboard/AddRow.tsx'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Meter, PageHead, UpgradeNudge } from '../../../components/dashboard/ui.tsx'
import { upgradeFor } from '../../../lib/content/plans.ts'
import { num } from '../../../lib/format.ts'
import type { CompetitorRow } from '../../../lib/shared/types.ts'
import { cleanDomain } from '../../../lib/workspace.ts'

const val = (v: number | null | undefined) => (v === null || v === undefined ? '-' : num(v))

export default function Competitors() {
  const { ws, update, limits, plan, report } = useDash()
  const full = ws.competitors.length >= limits.competitors
  const rows: CompetitorRow[] = report && 'competitors' in report ? report.competitors : []
  const self: CompetitorRow | null = report && 'self' in report ? report.self : null
  const byDomain = new Map(rows.map((r) => [r.domain, r]))

  const add = (v: string) => {
    const dom = cleanDomain(v)
    if (!dom) return 'Enter a website like competitor.com.'
    if (dom === ws.domain) return 'That is your own site.'
    if (ws.competitors.includes(dom)) return 'Already added.'
    if (full) return `Your plan includes ${limits.competitors} competitors.`
    update({ competitors: [...ws.competitors, dom] })
    return null
  }

  return (
    <>
      <PageHead title="Competitors" sub="Who you are measured against." />
      <div className="dash-cols">
        <div className="dash-col">
          <section className="card pad">
            <AddRow label="Add a competitor" placeholder="competitor.com" disabled={full} onAdd={add} />
            {full ? <UpgradeNudge plan={upgradeFor(plan, 'competitors')}>You are comparing against all {limits.competitors} competitors your plan includes.</UpgradeNudge> : null}
          </section>

          <section className="card pad">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Site</th><th className="num">Domain rank</th><th className="num">Page checks</th><th className="num">Indexed</th><th className="num">Web mentions</th><th><span className="sr-only">Remove</span></th></tr></thead>
                <tbody>
                  {self ? (
                    <tr className="me-row">
                      <td>{self.domain} <span className="muted">(you)</span></td>
                      <td className="num">{val(self.rank)}</td>
                      <td className="num">{self.tech_passed ?? '-'}/{self.tech_total ?? '-'}</td>
                      <td className="num">{val(self.indexed)}</td>
                      <td className="num">{val(self.web)}</td>
                      <td />
                    </tr>
                  ) : null}
                  {ws.competitors.length === 0 ? (
                    <tr><td colSpan={6} className="muted">No competitors yet. Add the products your buyers compare you with.</td></tr>
                  ) : (
                    ws.competitors.map((c) => {
                      const r = byDomain.get(c)
                      return (
                        <tr key={c}>
                          <td>{c}</td>
                          <td className="num">{r ? val(r.rank) : '-'}</td>
                          <td className="num">{r ? `${r.tech_passed ?? '-'}/${r.tech_total ?? '-'}` : '-'}</td>
                          <td className="num">{r ? val(r.indexed) : '-'}</td>
                          <td className="num">{r ? val(r.web) : '-'}</td>
                          <td className="num"><button type="button" className="link-btn" onClick={() => update({ competitors: ws.competitors.filter((x) => x !== c) })} aria-label={`Remove ${c}`}>Remove</button></td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <p className="caption muted">Figures come from your latest check. A competitor added after it shows a dash until you run a new check.</p>
          </section>
        </div>
        <div className="dash-col">
          <section className="card pad"><Meter used={ws.competitors.length} max={limits.competitors} label="Competitors used" /></section>
        </div>
      </div>
    </>
  )
}
