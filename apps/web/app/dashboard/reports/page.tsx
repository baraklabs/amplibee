'use client'

import Link from 'next/link'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { PageHead, ScoreRing, UpgradeNudge } from '../../../components/dashboard/ui.tsx'
import { LIMITS, PLANS } from '../../../lib/content/plans.ts'
import { CATEGORY_LABEL, dateLabel, FIX_LABEL, SEVERITY_LABEL } from '../../../lib/format.ts'

export default function Reports() {
  const { ws, limits, report, reportState } = useDash()
  const full = report && 'plan' in report ? report : null

  if (!ws.domain) {
    return (
      <>
        <PageHead title="Reports" sub="Your visibility reports." />
        <section className="card hero-card"><h2>No website yet</h2><p className="muted">Add your website in quick setup and your report shows here.</p><Link className="btn" href="/dashboard/setup">Open quick setup</Link></section>
      </>
    )
  }

  return (
    <>
      <PageHead title="Reports" sub={`Latest report for ${ws.domain}.`} action={<Link className="btn" href="/">Run a new check</Link>} />

      {reportState === 'loading' ? <p className="muted" role="status">Loading your report.</p> : null}
      {reportState === 'missing' ? (
        <section className="card hero-card"><h2>No report for {ws.domain} yet</h2><p className="muted">Run a check, then unlock the report to see it here.</p><Link className="btn" href="/">Check {ws.domain}</Link></section>
      ) : null}

      {report ? (
        <>
          <section className="card pad report-card">
            <ScoreRing score={report.score} size={110} />
            <div>
              <h2>{report.domain}</h2>
              <p className="muted">Generated {dateLabel(report.generated_at)}. {report.gap_total} gaps found.</p>
              <p><Link className="btn small" href={`/report/${report.domain}`}>Open the full report</Link></p>
            </div>
          </section>

          <section className="card pad">
            <div className="card-head">
              <h2>{limits.launchPlan ? 'Your customised launch plan' : 'Launch checklist'}</h2>
              {limits.launchPlan ? <span className="plan-badge">Customised</span> : null}
            </div>
            {full && full.plan.length ? (
              <ol className="plan-list">
                {full.plan.map((p) => <li key={p.gap_id}><strong>{p.title}</strong> <span className="muted">{FIX_LABEL[p.fix_type]}</span></li>)}
              </ol>
            ) : (
              <ul className="gap-list">
                {report.gaps.map((g) => <li key={g.id}><span className={`sev sev-${g.severity}`}>{SEVERITY_LABEL[g.severity]}</span><span>{g.message}<span className="muted"> {CATEGORY_LABEL[g.category]}</span></span></li>)}
              </ul>
            )}
            {!limits.launchPlan ? <UpgradeNudge plan={PLANS.find((p) => LIMITS[p.id].launchPlan) ?? null}>Get a launch plan built for your product, with Reddit, LinkedIn, X and review-site checks, on Growth.</UpgradeNudge> : null}
          </section>

        </>
      ) : null}
    </>
  )
}
