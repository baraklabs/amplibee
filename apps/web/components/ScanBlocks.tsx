'use client'

import Link from 'next/link'
import type { CheckView } from '../lib/api.ts'
import { num } from '../lib/format.ts'
import type { CompetitorRow } from '../lib/shared/types.ts'
import { Logo } from './CompetitorList.tsx'

const dash = '-'
const val = (v: number | null | undefined) => (v === null || v === undefined ? dash : num(v))
const yn = (v: boolean | null | undefined) => (v === null || v === undefined ? dash : v ? 'Yes' : 'No')

type Stat = [label: string, value: string, note: string]

const of10 = (v: number | null | undefined) => (v === null || v === undefined ? dash : `${num(v)} of 10`)

function stats(r: CompetitorRow | null | undefined): Stat[] {
  return [
    ['Domain rank', !r || r.rank === undefined ? dash : r.rank === null ? 'not in top 100k' : `#${num(r.rank)}`, 'position among top sites, lower is better'],
    ['Page checks', !r || r.tech_passed === null || r.tech_total === null ? dash : `${r.tech_passed} of ${r.tech_total}`, 'homepage checks passed'],
    ['OG image', yn(r?.og_image), 'social preview image'],
    ['Structured data', yn(r?.structured_data), 'markup for search engines'],
    ['HN stories', val(r?.hn), 'Hacker News stories linking to it'],
    ['GitHub repos', val(r?.github), 'READMEs that mention it'],
    ['Indexed', of10(r?.indexed), 'pages found in search, 10 checked'],
    ['Web mentions', of10(r?.web), 'other sites mentioning it, 10 checked'],
  ]
}

// Shown blurred while locked. Not real numbers.
const PLACEHOLDER: Stat[] = stats(null).map(([label, , note]) => [label, '00', note])

function Card({ domain, you, rows, blurred, plain, loading }: { domain: string; you?: boolean; rows: Stat[]; blurred?: boolean; plain?: boolean; loading?: boolean }) {
  return (
    <div className={plain ? "scan-row" : "scan-card"}>
      <div className="scan-head">
        <Logo domain={domain} />
        <strong>{domain}</strong>
        {you ? <span className="muted">(you)</span> : null}
      </div>
      <dl className={`scan-stats${blurred && !loading ? ' comp-blur' : ''}`} aria-hidden={blurred || undefined} aria-busy={loading || undefined}>
        {rows.map(([k, v, note]) => (
          <div key={k}>
            <dt className="muted">{k}</dt>
            <dd>{loading && (v === dash || blurred) ? <span className="skel" role="status" aria-label="Loading" /> : v}</dd>
            <dd className="scan-note muted">{note}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** The scan results as one block per site: yours first, then each competitor. Competitor scores are blurred until the report is unlocked. */
export function ScanBlocks({ view }: { view: CheckView }) {
  const r = view.report
  const self = r?.self ?? view.partial?.self ?? null
  const locked = !r || r.locked
  const byDomain = new Map((r?.competitors ?? []).map((c) => [c.domain, c]))
  const back = `${window.location.pathname}${window.location.search}`
  // Until the scan step has finished, any figure that has not arrived yet shows as loading instead of a dash.
  const loading = view.steps[2]?.status !== 'done' && view.status !== 'error'
  if (!self && !view.competitors.length && !loading) return <p className="caption">No scan results yet.</p>
  return (
    <div className="scan-blocks">
      {view.domain && (self || loading) ? <Card domain={view.domain} you rows={stats(self)} loading={loading} /> : null}
      {view.competitors.length ? (
        <div className={locked ? 'comp-locked' : undefined}>
          <div className="scan-card scan-group">
            <p className="label">Competitors</p>
            {view.competitors.map((d) => (
              <Card key={d} domain={d} rows={locked ? PLACEHOLDER : stats(byDomain.get(d))} blurred={locked} plain loading={loading} />
            ))}
          </div>
          {locked && r && !loading ? (
            <div className="comp-cta scan-cta">
              <p><strong>Unlock the competitor scores</strong></p>
              <p className="muted">See how you compare on every check.</p>
              <Link className="btn small" href={`/sign-in?next=${encodeURIComponent(back)}`}>Sign in to unlock</Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/** Small prompt beside the score: competitor scores are part of the unlocked report. */
export function CompareCta() {
  const back = `${window.location.pathname}${window.location.search}`
  return (
    <div className="compare-cta">
      <span>Compare your score with your competitors</span>
      <Link className="btn small" href={`/sign-in?next=${encodeURIComponent(back)}`}>Sign in</Link>
    </div>
  )
}
