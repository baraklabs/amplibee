import Link from 'next/link'
import type { ReactNode } from 'react'
import { CATEGORY_LABEL, FIX_LABEL, num, SEVERITY_LABEL } from '../lib/format.ts'
import { buildOyekoolUrl, TASK_LABEL } from '../lib/oyekool.ts'
import { SCORING } from '../lib/shared/scoring.config.ts'
import type { CompetitorRow, Report } from '../lib/shared/types.ts'

const SUB: { key: keyof Report['sub_scores']; label: string }[] = [
  { key: 'discoverability', label: 'Discoverability' },
  { key: 'buzz', label: 'Buzz' },
  { key: 'trust', label: 'Trust' },
  { key: 'technical', label: 'Technical' },
]

const dash = '-'
const val = (v: number | null | undefined) => (v === null || v === undefined ? dash : num(v))
const yn = (v: boolean | null) => (v === null ? dash : v ? 'Yes' : 'No')

export function Compare({ rows }: { rows: CompetitorRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <caption className="label">Competitor comparison</caption>
        <thead>
          <tr>
            <th>Site</th>
            <th className="num">Domain rank</th>
            <th className="num">Page checks</th>
            <th>OG image</th>
            <th>Structured data</th>
            <th className="num">HN stories</th>
            <th className="num">GitHub repos</th>
            <th className="num">Indexed (max 10)</th>
            <th className="num">Web mentions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.domain}>
              <td>{r.domain}{i === 0 ? <span className="muted"> (you)</span> : null}</td>
              <td className="num">{r.rank === undefined ? dash : r.rank === null ? 'not in top 100k' : num(r.rank)}</td>
              <td className="num">{r.tech_passed === null || r.tech_total === null ? dash : `${r.tech_passed} of ${r.tech_total}`}</td>
              <td>{yn(r.og_image)}</td>
              <td>{yn(r.structured_data)}</td>
              <td className="num">{val(r.hn)}</td>
              <td className="num">{val(r.github)}</td>
              <td className="num">{val(r.indexed)}</td>
              <td className="num">{val(r.web)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ReportView({ report, unlockSlot, skipped }: { report: Report; unlockSlot?: ReactNode; skipped?: string }) {
  const noSite = report.mode === 'no_website'
  const hidden = report.gap_total - report.gaps.length
  const oyekoolItems = report.plan.filter((p) => p.oyekool)

  return (
    <article className="report" aria-label={noSite ? 'Launch plan' : `Visibility report for ${report.domain}`}>
      <div className="report-head">
        <div>
          <span className="label">{noSite ? 'Launch plan' : 'Visibility score'}</span>
          {noSite || report.score === null ? (
            <p className="score" style={{ fontSize: '2.2rem', lineHeight: 1.1 }}>{noSite ? 'No site yet' : 'Not scored'}</p>
          ) : (
            <>
              <p className="score" aria-label={`${report.score} out of 100`}>{report.score}<small>/100</small></p>
              <div className="score-bar" aria-hidden="true"><span style={{ width: `${report.score}%` }} /></div>
            </>
          )}
        </div>
        {noSite ? (
          <p className="measure" style={{ alignSelf: 'end' }}>
            Without a website there is nothing to score. This plan lists the directories to prepare for, how your competitors show up, and what to do before launch.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="label">Sub-scores</caption>
              <thead>
                <tr><th>Part</th><th className="num">Score</th><th className="num">Weight</th></tr>
              </thead>
              <tbody>
                {SUB.map((s) => (
                  <tr key={s.key}>
                    <td>{s.label}</td>
                    <td className="num">{report.sub_scores[s.key] === null ? 'not measured' : `${report.sub_scores[s.key]} / 100`}</td>
                    <td className="num">{SCORING.weights[s.key]}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="report-body">
        <section aria-labelledby="gaps-h">
          <h3 id="gaps-h">{noSite ? 'The gap to close first' : `Gaps, ranked by severity and estimated points (${report.gap_total})`}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Severity</th><th>Part</th><th>What we found</th><th className="num">Est. points</th></tr>
              </thead>
              <tbody>
                {report.gaps.map((g) => (
                  <tr key={g.id}>
                    <td><span className={`sev ${g.severity}`}>{SEVERITY_LABEL[g.severity]}</span></td>
                    <td>{CATEGORY_LABEL[g.category]}</td>
                    <td className="gap-msg">{g.message}</td>
                    <td className="num">{noSite ? dash : `+${g.impact}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {report.locked && hidden > 0 ? (
            <div className="locked-note">
              <strong>{hidden} more {hidden === 1 ? 'gap' : 'gaps'}</strong> are in the full report, along with the competitor comparison and the fix plan. Sign in to unlock them.
            </div>
          ) : null}
          {unlockSlot}
        </section>

        {!report.locked && report.competitors.length > 0 && report.self ? (
          <section aria-label="Competitor comparison">
            <Compare rows={[report.self, ...report.competitors]} />
          </section>
        ) : null}
        {!report.locked && noSite && report.competitors.length > 0 ? (
          <section aria-label="Competitor comparison">
            <Compare rows={report.competitors} />
          </section>
        ) : null}

        {report.plan.length > 0 ? (
          <section aria-labelledby="plan-h">
            <h3 id="plan-h">Fix plan</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Action</th><th>Type</th><th>Where</th></tr></thead>
                <tbody>
                  {report.plan.map((p) => (
                    <tr key={p.gap_id}>
                      <td>{p.title}</td>
                      <td>{FIX_LABEL[p.fix_type]}</td>
                      <td>
                        {p.oyekool ? (
                          <div className="oyekool-row">
                            <a className="btn small" href={buildOyekoolUrl({ gapId: p.gap_id, domain: report.domain, prefill: p.oyekool })} rel="noopener">Get it done for me</a>
                            <span className="caption">Want to get mentioned by people to improve your brand visibility? We'll get it done for you. Suggested start ${p.oyekool.price_usd}. You set the final brief and price.</span>
                          </div>
                        ) : p.fix_type === 'directory_submission' && !/^https?:/.test(p.href ?? '') ? (
                          <span className="caption">Submission pages are in the directory list below.</span>
                        ) : p.href ? (
                          /^https?:/.test(p.href) ? <a href={p.href} rel="noopener">Open the submission page</a> : <Link href={p.href}>Open the guide</Link>
                        ) : (
                          dash
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {oyekoolItems.length > 0 ? (
              <p className="caption" style={{ marginTop: 10 }}>
                Campaigns run through a partner marketplace where brands pay creators to post, write about or engage with their product. A campaign improves your odds of being mentioned.
              </p>
            ) : null}
          </section>
        ) : null}

        {report.directories.length > 0 ? (
          <section aria-labelledby="dirs-h">
            <h3 id="dirs-h">{noSite ? 'Directories to prepare for' : 'Directory listings'}</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Directory</th>{noSite ? null : <th>Status</th>}<th>Submit</th></tr></thead>
                <tbody>
                  {report.directories.map((d) => (
                    <tr key={d.slug}>
                      <td>{d.name}</td>
                      {noSite ? null : <td>{d.status === 'listed' ? 'Listed' : d.status === 'not_found' ? 'Not found' : 'Not confirmed'}</td>}
                      <td>{d.submit_url ? <a href={d.submit_url} rel="noopener">Open submission page</a> : dash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {report.checklist.length > 0 ? (
          <section aria-labelledby="list-h">
            <h3 id="list-h">Launch checklist</h3>
            <ol className="measure">{report.checklist.map((c) => <li key={c}>{c}</li>)}</ol>
          </section>
        ) : null}

        <p className="caption" style={{ marginTop: 28 }}>
          Generated {report.generated_at.slice(0, 10)}. Search queries used: {report.query_count} of {report.query_cap}. Impact figures are estimates from the scoring formula, not forecasts.
          {skipped ? ` ${skipped}` : ''}
        </p>
      </div>
    </article>
  )
}
