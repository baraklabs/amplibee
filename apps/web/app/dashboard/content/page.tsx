'use client'

import { useState } from 'react'
import { AddRow } from '../../../components/dashboard/AddRow.tsx'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Gate, LockedPage, PageHead, Sketch, UpgradeNudge } from '../../../components/dashboard/ui.tsx'
import { nextPlan } from '../../../lib/content/plans.ts'
import { brandOf, type ContentItem, type ContentKind, type ContentState } from '../../../lib/workspace.ts'

const STATES: ContentState[] = ['idea', 'drafting', 'scheduled', 'published']
const STATE_LABEL: Record<ContentState, string> = { idea: 'Ideas', drafting: 'Drafting', scheduled: 'Scheduled', published: 'Published' }
const KIND_LABEL: Record<ContentKind, string> = { blog: 'Blog post', comparison: 'Comparison page', post: 'Social post' }

export default function Content() {
  const { ws, update, limits, plan } = useDash()
  const [kind, setKind] = useState<ContentKind>('blog')
  const brand = brandOf(ws.domain || 'your product')

  const suggestions = [
    ...ws.competitors.slice(0, 3).map((c) => ({ title: `${brand} vs ${brandOf(c)}: which is right for you?`, kind: 'comparison' as const })),
    { title: `Best ${brand} alternatives`, kind: 'comparison' as const },
    { title: `How ${brand} helps your customers, with a real example`, kind: 'blog' as const },
    { title: `Launch announcement: what ${brand} does and who it is for`, kind: 'post' as const },
  ].filter((s) => !ws.content.some((c) => c.title === s.title))

  const add = (title: string, k: ContentKind = kind) =>
    update((w) => ({ content: [...w.content, { id: crypto.randomUUID(), title: title.trim(), kind: k, state: 'idea', date: '' }] }))
  const patch = (id: string, p: Partial<ContentItem>) => update((w) => ({ content: w.content.map((c) => (c.id === id ? { ...c, ...p } : c)) }))

  return (
    <>
      <PageHead title="Content planner" sub="Plan what to publish so buyers and AI search find you." />
      <Gate
        feature="content"
        locked={
          <LockedPage feature="content" title="Plan the content that gets you found" text="A board for your blog posts, comparison pages and launch posts, with ideas built from your competitors." bullets={['Ideas drawn from your competitors and gaps', 'Idea, drafting, scheduled and published columns', 'Blog posts written for you: 1 on Plus, 4 on Growth, up to 45 a month']}>
            <Sketch rows={6} cols={3} />
          </LockedPage>
        }
      >
        <div className="dash-cols">
          <div className="dash-col wide">
            <section className="card pad">
              <form className="add-row" onSubmit={(e) => { e.preventDefault() }}>
                <div className="kind-row" role="group" aria-label="Type">
                  {(Object.keys(KIND_LABEL) as ContentKind[]).map((k) => <button key={k} type="button" className={`chip-btn${kind === k ? ' on' : ''}`} aria-pressed={kind === k} onClick={() => setKind(k)}>{KIND_LABEL[k]}</button>)}
                </div>
              </form>
              <AddRow label="Add an idea" placeholder="Working title" onAdd={(v) => { add(v); return null }} />
            </section>

            <div className="board">
              {STATES.map((s) => (
                <section key={s} className="board-col" aria-label={STATE_LABEL[s]}>
                  <h3>{STATE_LABEL[s]} <span className="muted">{ws.content.filter((c) => c.state === s).length}</span></h3>
                  {ws.content.filter((c) => c.state === s).map((c) => (
                    <article key={c.id} className="card pad board-card">
                      <p className="board-kind">{KIND_LABEL[c.kind]}</p>
                      <p><strong>{c.title}</strong></p>
                      <div className="board-actions">
                        <select aria-label="Move to" value={c.state} onChange={(e) => patch(c.id, { state: e.target.value as ContentState })}>{STATES.map((x) => <option key={x} value={x}>{STATE_LABEL[x]}</option>)}</select>
                        <input type="date" aria-label="Publish date" value={c.date} onChange={(e) => patch(c.id, { date: e.target.value, state: e.target.value && c.state === 'idea' ? 'scheduled' : c.state })} />
                        <button type="button" className="link-btn" onClick={() => update({ content: ws.content.filter((x) => x.id !== c.id) })}>Remove</button>
                      </div>
                    </article>
                  ))}
                </section>
              ))}
            </div>
          </div>

          <div className="dash-col">
            <section className="card pad">
              <h2>Written for you</h2>
              <p className="tile-num">{limits.blogPosts}<small> blog {limits.blogPosts === 1 ? 'post' : 'posts'} included</small></p>
              <p className="muted caption"><a href="/contact?topic=general">Ask us to write one</a> from any idea on the board.</p>
              <UpgradeNudge plan={nextPlan(plan)}>Need more posts? {nextPlan(plan)?.name} includes more, with images.</UpgradeNudge>
            </section>
            <section className="card pad">
              <h2>Ideas for you</h2>
              {suggestions.length === 0 ? <p className="muted">All added.</p> : (
                <ul className="plain suggestions">
                  {suggestions.map((s) => <li key={s.title}><span>{s.title}<span className="muted"> {KIND_LABEL[s.kind]}</span></span><button type="button" className="chip-btn" onClick={() => add(s.title, s.kind)}>+ Add</button></li>)}
                </ul>
              )}
            </section>
          </div>
        </div>
      </Gate>
    </>
  )
}
