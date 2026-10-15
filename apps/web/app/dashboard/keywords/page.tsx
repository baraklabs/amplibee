'use client'

import { AddRow } from '../../../components/dashboard/AddRow.tsx'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Gate, LockedPage, Meter, PageHead, Sketch, UpgradeNudge } from '../../../components/dashboard/ui.tsx'
import { upgradeFor } from '../../../lib/content/plans.ts'
import { brandOf } from '../../../lib/workspace.ts'

export default function Keywords() {
  const { ws, update, limits, plan } = useDash()
  const full = ws.keywords.length >= limits.keywords
  const brand = brandOf(ws.domain || 'brand')

  const add = (v: string) => {
    const k = v.trim().toLowerCase().replace(/\s+/g, ' ')
    if (k.length < 2) return 'Too short.'
    if (ws.keywords.includes(k)) return 'Already added.'
    if (full) return `Your plan includes ${limits.keywords} keywords.`
    update({ keywords: [...ws.keywords, k] })
    return null
  }

  return (
    <>
      <PageHead title="Keywords" sub="The searches you want to be found for." />
      <Gate
        feature="keywords"
        locked={
          <LockedPage feature="keywords" title="Track the searches that matter" text="Pick the keywords your buyers use and watch where you show up for them." bullets={['10 keywords on Starter, up to 100 on Authority', 'Daily readings, one place for all of them', 'See which competitors rank where you do not']}>
            <Sketch rows={6} cols={4} />
          </LockedPage>
        }
      >
        <div className="dash-cols">
          <div className="dash-col">
            <section className="card pad">
              <AddRow label="Add a keyword" placeholder={`best ${brand} alternative`} disabled={full} onAdd={add} />
              {full ? <UpgradeNudge plan={upgradeFor(plan, 'keywords')}>You are using all {limits.keywords} keywords.</UpgradeNudge> : null}
            </section>

            <section className="card pad">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Keyword</th><th>Status</th><th><span className="sr-only">Remove</span></th></tr></thead>
                  <tbody>
                    {ws.keywords.length === 0 ? (
                      <tr><td colSpan={3} className="muted">No keywords yet. Add your first above.</td></tr>
                    ) : (
                      ws.keywords.map((k) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td><span className="status wait">Waiting for first reading</span></td>
                          <td className="num"><button type="button" className="link-btn" onClick={() => update({ keywords: ws.keywords.filter((x) => x !== k) })} aria-label={`Remove ${k}`}>Remove</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <div className="dash-col">
            <section className="card pad"><Meter used={ws.keywords.length} max={limits.keywords} label="Keywords used" /></section>
            <section className="card pad">
              <h2>Good keywords to track</h2>
              <ul className="plain">
                <li>Your brand name, to see what shows up for it</li>
                <li>&ldquo;{brand} alternatives&rdquo; and &ldquo;{brand} vs&rdquo;</li>
                <li>The problem you solve, in the words buyers use</li>
                <li>&ldquo;best [your category] for [your customer]&rdquo;</li>
              </ul>
            </section>
          </div>
        </div>
      </Gate>
    </>
  )
}
