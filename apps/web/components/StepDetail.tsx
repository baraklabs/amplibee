import Link from 'next/link'
import type { CheckView, StepView } from '../lib/api.ts'
import { CATEGORY_LABEL, FIX_LABEL, SEVERITY_LABEL } from '../lib/format.ts'
import { SCORING } from '../lib/shared/scoring.config.ts'
import type { Report } from '../lib/shared/types.ts'
import { CompetitorList, Logo } from './CompetitorList.tsx'
import { LockedBlock } from './LockedBlock.tsx'
import { CompareCta, ScanBlocks } from './ScanBlocks.tsx'

const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour12: false })
const SUB: { key: keyof Report['sub_scores']; label: string }[] = [
  { key: 'discoverability', label: 'Discoverability' },
  { key: 'buzz', label: 'Buzz' },
  { key: 'trust', label: 'Trust' },
  { key: 'technical', label: 'Technical' },
]

function LogRows({ lines }: { lines: StepView['log'] }) {
  return (
    <ul className="trk-list">
      {lines.map((l, i) => (
        <li key={i} className={`trk-row${l.level === 'warn' || l.level === 'error' ? ' warn' : ''}`}>
          <span className="ico" aria-hidden="true"><span className="tick" /></span>
          <span>{l.msg}<span className="t-time mono">{clock(l.t)}</span></span>
        </li>
      ))}
    </ul>
  )
}

/** The latest few lines; the rest sit behind a toggle so long steps do not bury the data above. */
function Log({ step, limit }: { step: StepView; limit?: number }) {
  if (!step.log.length) return <p className="caption">Nothing logged for this step yet.</p>
  if (!limit || step.log.length <= limit) return <LogRows lines={step.log} />
  return (
    <>
      <LogRows lines={step.log.slice(-limit)} />
      <details>
        <summary className="caption">Show all {step.log.length} lines</summary>
        <LogRows lines={step.log} />
      </details>
    </>
  )
}

function Research({ view }: { view: CheckView }) {
  const p = view.product
  if (view.mode === 'no_website') {
    return (
      <dl>
        <dt className="muted">Sells</dt><dd>{p.sells}</dd>
        {p.customer ? <><dt className="muted">Ideal customer</dt><dd>{p.customer}</dd></> : null}
        {p.markets ? <><dt className="muted">Markets</dt><dd>{p.markets}</dd></> : null}
      </dl>
    )
  }
  return (
    <dl>
      <dt className="muted">Site</dt>
      <dd className="scan-head">{view.domain ? <Logo domain={view.domain} /> : null}<span>{view.domain}</span></dd>
      {p.title ? <><dt className="muted">Title</dt><dd>{p.title}</dd></> : null}
      {p.one_liner ? <><dt className="muted">One-liner</dt><dd>{p.one_liner}</dd></> : null}
      {p.description ? <><dt className="muted">Description</dt><dd>{p.description}</dd></> : null}
      {p.headings?.length ? (
        <>
          <dt className="muted">Headings found</dt>
          <dd><ul>{p.headings.slice(0, 12).map((h, i) => <li key={i}>{h.text}</li>)}</ul></dd>
        </>
      ) : null}
    </dl>
  )
}

function Score({ report }: { report: Report }) {
  return (
    <>
      {report.score !== null ? <p className="score">{report.score}<small>/100</small></p> : <p className="caption">Not scored.</p>}
      {report.locked ? <div><CompareCta /></div> : null}
      <div className="table-wrap">
        <table>
          <caption className="label">Sub-scores</caption>
          <thead><tr><th>Part</th><th className="num">Score</th><th className="num">Weight</th></tr></thead>
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
      <div className="table-wrap">
        <table>
          <caption className="label">Gaps ({report.gap_total})</caption>
          <thead><tr><th>Severity</th><th>Part</th><th>What we found</th><th className="num">Est. points</th></tr></thead>
          <tbody>
            {report.gaps.map((g) => (
              <tr key={g.id}>
                <td><span className={`sev ${g.severity}`}>{SEVERITY_LABEL[g.severity]}</span></td>
                <td>{CATEGORY_LABEL[g.category]}</td>
                <td className="gap-msg">{g.message}</td>
                <td className="num">+{g.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {report.locked && report.gap_total > report.gaps.length ? <p className="caption">{report.gap_total - report.gaps.length} more gaps unlock when you sign in.</p> : null}
    </>
  )
}

function Plan({ report }: { report: Report }) {
  if (!report.plan.length) {
    return report.locked
      ? <LockedBlock title={`Your ${report.gap_total} planned ${report.gap_total === 1 ? 'fix' : 'fixes'}`} text="Sign in to see each fix and where to do it." rows={report.gap_total} />
      : <p className="caption">No fixes planned yet.</p>
  }
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Action</th><th>Type</th><th>Where</th></tr></thead>
        <tbody>
          {report.plan.map((p) => (
            <tr key={p.gap_id}>
              <td>{p.title}</td>
              <td>{FIX_LABEL[p.fix_type]}</td>
              <td>{p.href ? (/^https?:/.test(p.href) ? <a href={p.href} rel="noopener noreferrer">Open</a> : <Link href={p.href}>Open the guide</Link>) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Launch({ report }: { report: Report }) {
  if (report.locked && !report.directories.length && !report.checklist.length) {
    return <LockedBlock title="Your launch list" text="Sign in to see the directories to submit to and your launch checklist." />
  }
  return (
    <>
      {report.directories.length ? (
        <div className="table-wrap">
          <table>
            <caption className="label">Directory listings</caption>
            <thead><tr><th>Directory</th><th>Status</th><th>Submit</th></tr></thead>
            <tbody>
              {report.directories.map((d) => (
                <tr key={d.slug}>
                  <td>{d.name}</td>
                  <td>{d.status === 'listed' ? 'Listed' : d.status === 'not_found' ? 'Not found' : 'Not confirmed'}</td>
                  <td>{d.submit_url ? <a href={d.submit_url} rel="noopener noreferrer">Open submission page</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {report.checklist.length ? (
        <>
          <span className="label">Launch checklist</span>
          <ol className="measure">{report.checklist.map((c) => <li key={c}>{c}</li>)}</ol>
        </>
      ) : null}
      {!report.directories.length && !report.checklist.length ? <p className="caption">Nothing to show for this step yet.</p> : null}
    </>
  )
}

/** Data a single step produced, shown in the main column when its sidebar entry is clicked. */
export function StepDetail({ view, step, onClose }: { view: CheckView; step: StepView; onClose: () => void }) {
  const r = view.report
  let body
  switch (step.key) {
    case 'research': body = <Research view={view} />; break
    case 'competitors': body = <CompetitorList view={view} />; break
    case 'scan': body = <ScanBlocks view={view} />; break
    case 'score': body = r ? <Score report={r} /> : <p className="caption">No results yet.</p>; break
    case 'plan': body = r ? <Plan report={r} /> : <p className="caption">No plan yet.</p>; break
    default: body = r ? <Launch report={r} /> : <p className="caption">Nothing to show yet.</p>
  }
  return (
    <section className="panel" aria-label={`Step ${step.step}: ${step.title}`}>
      <div className="oyekool-row">
        <h2 style={{ margin: 0 }}>Step {step.step} · {step.title}</h2>
        {r ? <button type="button" className="btn small" onClick={onClose}>Show full report</button> : null}
      </div>
      {body}
      <span className="label">Log</span>
      <Log step={step} limit={step.key === 'scan' ? 4 : undefined} />
    </section>
  )
}
