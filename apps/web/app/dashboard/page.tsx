'use client'

import Link from 'next/link'
import { AutoSetup } from '../../components/dashboard/AutoSetup.tsx'
import { PageHead, ScoreRing, UpgradeNudge, upgradeHref } from '../../components/dashboard/ui.tsx'
import { useDash } from '../../components/dashboard/DashboardContext.tsx'
import { hasFeature, nextPlan, planById, planFor } from '../../lib/content/plans.ts'
import { CATEGORY_LABEL, SEVERITY_LABEL } from '../../lib/format.ts'
import type { Report } from '../../lib/shared/types.ts'
import { setupSteps } from '../../lib/setup.ts'

const CATS: (keyof Report['sub_scores'])[] = ['discoverability', 'buzz', 'trust', 'technical']

export default function Overview() {
  const d = useDash()
  const { me, plan, limits, ws, report, reportState } = d
  const steps = setupSteps(d)
  const done = steps.filter((s) => s.done).length
  const first = (me.name ?? '').trim().split(/\s+/)[0] || me.email.split('@')[0]
  const next = nextPlan(plan)

  const dirs = report && 'directories' in report ? report.directories : null
  const listed = dirs?.filter((x) => x.status === 'listed').length
  const dirTotal = dirs?.length
  const gaps = report?.gaps ?? []

  // The single most useful thing to upsell here: the first locked area, else more room on a limit already reached.
  const lockedFeature = (['keywords', 'directories', 'content', 'analytics'] as const).find((f) => !hasFeature(plan, f))

  return (
    <>
      <PageHead
        title={`Welcome, ${first}`}
        sub={ws.domain ? `Here is how ${ws.domain} is doing.` : 'Add your website and we will start measuring.'}
        action={<span className="plan-badge">{planById(plan).name} plan</span>}
      />

      {!ws.domain ? (
        <section className="card hero-card">
          <h2>Start with your website</h2>
          <p className="muted">Enter your domain and we pull in your visibility score, the gaps to fix, your directory listings and a competitor comparison.</p>
          <AutoSetup compact />
        </section>
      ) : null}

      <section className="tiles" aria-label="Key numbers">
        <div className="tile tile-score">
          <ScoreRing score={report && 'score' in report ? report.score : null} />
          <div>
            <p className="label">Visibility score</p>
            <p className="muted tile-note">{reportState === 'loading' ? 'Loading your report.' : reportState === 'missing' ? 'No report yet. Run a check.' : report ? 'Out of 100' : 'Add your website'}</p>
          </div>
        </div>
        <div className="tile">
          <p className="label">Open gaps</p>
          <p className="tile-num">{report ? report.gap_total : '-'}</p>
          <p className="muted tile-note">{limits.launchPlan ? 'With your customised launch plan' : `Showing ${plan === 'free' ? 3 : plan === 'starter' ? 5 : 10} per check`}</p>
        </div>
        <div className="tile">
          <p className="label">Directories listed</p>
          <p className="tile-num">{listed === undefined ? '-' : `${listed}`}<small>{dirTotal ? ` / ${dirTotal}` : ''}</small></p>
          <Link className="tile-link" href="/dashboard/directories">View directories</Link>
        </div>
        <div className="tile">
          <p className="label">Competitors</p>
          <p className="tile-num">{ws.competitors.length}<small> / {limits.competitors}</small></p>
          <Link className="tile-link" href="/dashboard/competitors">Manage</Link>
        </div>
        <div className="tile">
          <p className="label">Keywords tracked</p>
          {hasFeature(plan, 'keywords') ? (
            <>
              <p className="tile-num">{ws.keywords.length}<small> / {limits.keywords}</small></p>
              <Link className="tile-link" href="/dashboard/keywords">Manage</Link>
            </>
          ) : (
            <>
              <p className="tile-num tile-locked">Locked</p>
              <Link className="tile-link" href={upgradeHref(planFor('keywords'))}>Unlock with {planFor('keywords').name}</Link>
            </>
          )}
        </div>
      </section>

      <div className="dash-cols">
        <div className="dash-col">
          {done < steps.length ? (
            <section className="card pad" aria-labelledby="qs">
              <div className="card-head">
                <h2 id="qs">Quick setup</h2>
                <span className="muted">{done} of {steps.length} done</span>
              </div>
              <div className="meter-bar big" aria-hidden="true"><span style={{ width: `${(done / steps.length) * 100}%` }} /></div>
              <ul className="checklist">
                {steps.map((s) => (
                  <li key={s.id} data-done={s.done ? 'true' : undefined}>
                    <span className="check-dot" aria-hidden="true">{s.done ? '✓' : ''}</span>
                    <span className="check-text"><strong>{s.title}</strong><span className="muted">{s.locked ? `Included from the ${planFor(s.locked).name} plan` : s.hint}</span></span>
                    {!s.done ? <Link className="btn small secondary" href={s.locked ? upgradeHref(planFor(s.locked)) : '/dashboard/setup'}>{s.locked ? 'Upgrade' : 'Do it'}</Link> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card pad" aria-labelledby="fx">
            <div className="card-head">
              <h2 id="fx">Fix these first</h2>
              <Link className="tile-link" href="/dashboard/reports">Full report</Link>
            </div>
            {gaps.length === 0 ? (
              <p className="muted">{ws.domain ? 'Your gaps appear here once your report loads.' : 'Add your website to see what to fix.'}</p>
            ) : (
              <ul className="gap-list">
                {gaps.slice(0, 4).map((g) => (
                  <li key={g.id}>
                    <span className={`sev sev-${g.severity}`}>{SEVERITY_LABEL[g.severity]}</span>
                    <span>{g.message}<span className="muted"> {CATEGORY_LABEL[g.category]}, about +{g.impact} points</span></span>
                  </li>
                ))}
              </ul>
            )}
            {report && report.gap_total > gaps.length ? (
              <UpgradeNudge plan={next}>{report.gap_total - gaps.length} more gaps are waiting. {next?.name} shows more of them on every check.</UpgradeNudge>
            ) : null}
          </section>
        </div>

        <div className="dash-col">
          <section className="card pad" aria-labelledby="sc">
            <h2 id="sc">Score breakdown</h2>
            {report ? (
              <ul className="bars">
                {CATS.map((c) => {
                  const v = report.sub_scores[c]
                  return (
                    <li key={c}>
                      <span>{CATEGORY_LABEL[c]}</span>
                      <span className="meter-bar"><span style={{ width: `${v ?? 0}%` }} /></span>
                      <span className="mono">{v ?? '-'}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="muted">Appears once your report loads.</p>
            )}
          </section>

          {next ? (
            <section className="card pad upsell" aria-labelledby="up">
              <span className="lock-chip">{next.name}: ${next.monthly}/mo</span>
              <h2 id="up">{lockedFeature ? `Unlock ${{ keywords: 'keyword tracking', directories: 'directory submissions', content: 'the content planner', analytics: 'analytics' }[lockedFeature]}` : `Step up to ${next.name}`}</h2>
              <ul className="ticks">
                {next.features.slice(0, 4).map((f) => <li key={f}>{f}</li>)}
              </ul>
              <Link className="btn" href={upgradeHref(lockedFeature ? planFor(lockedFeature) : next)}>Upgrade to {(lockedFeature ? planFor(lockedFeature) : next).name}</Link>
            </section>
          ) : null}
        </div>
      </div>
    </>
  )
}
