'use client'

import { useState } from 'react'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Meter, PageHead, UpgradeNudge } from '../../../components/dashboard/ui.tsx'
import { hasFeature, upgradeFor } from '../../../lib/content/plans.ts'
import { CATEGORY_NAME, DIRECTORIES } from '../../../lib/directories.ts'
import type { DirStatus } from '../../../lib/workspace.ts'

const NEXT: Record<DirStatus, DirStatus> = { todo: 'submitted', submitted: 'listed', listed: 'todo' }
const LABEL: Record<DirStatus, string> = { todo: 'To do', submitted: 'Submitted', listed: 'Listed' }

export default function Directories() {
  const { ws, update, limits, plan, report } = useDash()
  const [cat, setCat] = useState('all')
  const canTrack = hasFeature(plan, 'directories')
  const tracked = Object.keys(ws.directories).length
  const full = tracked >= limits.directories

  // What the last check found on the open web, by directory.
  const found = new Map((report && 'directories' in report ? report.directories : []).map((x) => [x.slug, x.status]))
  const list = [...DIRECTORIES].sort((a, b) => a.priority - b.priority).filter((x) => cat === 'all' || x.category === cat)

  function toggle(slug: string) {
    if (!canTrack) return
    if (!ws.directories[slug]) {
      if (full) return
      update({ directories: { ...ws.directories, [slug]: 'todo' } })
    } else {
      update({ directories: { ...ws.directories, [slug]: NEXT[ws.directories[slug]] } })
    }
  }

  return (
    <>
      <PageHead title="Directories" sub="Where buyers look for products like yours." />

      {canTrack ? (
        <section className="card pad inline-meter"><Meter used={tracked} max={limits.directories} label="Submissions tracked" /></section>
      ) : (
        <UpgradeNudge plan={upgradeFor(plan, 'directories')}>You can see where you are listed. Submission tracking starts on Starter, with 3 submissions.</UpgradeNudge>
      )}
      {canTrack && full ? <UpgradeNudge plan={upgradeFor(plan, 'directories')}>You have used all {limits.directories} submissions.</UpgradeNudge> : null}

      <div className="filter-row" role="group" aria-label="Category">
        {['all', ...Object.keys(CATEGORY_NAME)].map((c) => (
          <button key={c} type="button" className={`chip-btn${cat === c ? ' on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c === 'all' ? 'All' : CATEGORY_NAME[c]}</button>
        ))}
      </div>

      <section className="card pad">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Directory</th><th>Found by our check</th><th>Your status</th><th><span className="sr-only">Open</span></th></tr></thead>
            <tbody>
              {list.map((x) => {
                const f = found.get(x.slug)
                const mine = ws.directories[x.slug]
                return (
                  <tr key={x.slug}>
                    <td><strong>{x.name}</strong><br /><span className="muted">{CATEGORY_NAME[x.category] ?? x.category}</span></td>
                    <td>{!f ? <span className="muted">{ws.domain ? 'Not checked' : 'Add a site'}</span> : <span className={`status ${f === 'listed' ? 'ok' : f === 'not_found' ? 'bad' : 'wait'}`}>{f === 'listed' ? 'Listed' : f === 'not_found' ? 'Not found' : 'Unknown'}</span>}</td>
                    <td>
                      {canTrack ? (
                        <button type="button" className={`status-btn ${mine ?? 'none'}`} onClick={() => toggle(x.slug)} disabled={!mine && full}>{mine ? LABEL[mine] : 'Track'}</button>
                      ) : (
                        <span className="muted">Locked</span>
                      )}
                    </td>
                    <td className="num">{x.submit_url ? <a href={x.submit_url} target="_blank" rel="noopener noreferrer">Submit</a> : <a href={x.url} target="_blank" rel="noopener noreferrer">Visit</a>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
