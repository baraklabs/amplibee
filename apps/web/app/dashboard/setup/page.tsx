'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AutoSetup } from '../../../components/dashboard/AutoSetup.tsx'
import { AddRow } from '../../../components/dashboard/AddRow.tsx'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { PageHead, upgradeHref } from '../../../components/dashboard/ui.tsx'
import { planFor } from '../../../lib/content/plans.ts'
import { DIRECTORIES } from '../../../lib/directories.ts'
import { setupSteps } from '../../../lib/setup.ts'
import { brandOf, cleanDomain } from '../../../lib/workspace.ts'

export default function Setup() {
  const d = useDash()
  const { ws, update, limits, plan } = d
  const steps = setupSteps(d)
  const done = steps.filter((s) => s.done).length
  const brand = brandOf(ws.domain || 'brand')
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  useEffect(() => {
    try {
      if (localStorage.getItem('amplibee_setup_mode') === 'manual') setMode('manual')
    } catch {
      // storage blocked: starts on automatic
    }
  }, [])
  const choose = (m: 'auto' | 'manual') => {
    setMode(m)
    try {
      localStorage.setItem('amplibee_setup_mode', m)
    } catch {
      // storage blocked: the choice lasts until the tab closes
    }
  }
  const starters = [...DIRECTORIES].filter((x) => x.submit_url).sort((a, b) => a.priority - b.priority).slice(0, 6)

  const addCompetitor = (v: string) => {
    const dom = cleanDomain(v)
    if (!dom) return 'Enter a website like competitor.com.'
    if (dom === ws.domain) return 'That is your own site.'
    if (ws.competitors.includes(dom)) return 'Already added.'
    if (ws.competitors.length >= limits.competitors) return `Your plan includes ${limits.competitors} competitors.`
    update({ competitors: [...ws.competitors, dom] })
    return null
  }

  const addKeyword = (v: string) => {
    const k = v.trim().toLowerCase().replace(/\s+/g, ' ')
    if (k.length < 2) return 'Too short.'
    if (ws.keywords.includes(k)) return 'Already added.'
    if (ws.keywords.length >= limits.keywords) return `Your plan includes ${limits.keywords} keywords.`
    update({ keywords: [...ws.keywords, k] })
    return null
  }

  const pickDir = (slug: string) => {
    const picked = Object.keys(ws.directories).length
    if (!ws.directories[slug] && picked >= limits.directories) return
    update({ directories: { ...ws.directories, [slug]: ws.directories[slug] ?? 'todo' } })
  }

  return (
    <>
      <PageHead title="Quick setup" sub="Four short steps. You can change any of it later." action={<span className="muted">{done} of {steps.length} done</span>} />
      <div className="meter-bar big" aria-hidden="true"><span style={{ width: `${(done / steps.length) * 100}%` }} /></div>

      <div className="mode-switch" role="group" aria-label="Setup mode">
        <button type="button" className={mode === 'auto' ? 'on' : ''} aria-pressed={mode === 'auto'} onClick={() => choose('auto')}>
          <strong>Automatic</strong><span>Enter your site, we do the rest</span>
        </button>
        <button type="button" className={mode === 'manual' ? 'on' : ''} aria-pressed={mode === 'manual'} onClick={() => choose('manual')}>
          <strong>Manual</strong><span>Choose every item yourself</span>
        </button>
      </div>

      {mode === 'auto' ? (
        <section className="card pad">
          <h2>Set up automatically</h2>
          <p className="muted">Enter your site once. We run the full check, then fill in competitors, keywords, directories and content ideas for your plan. You can change anything afterwards, or switch to Manual.</p>
          <AutoSetup />
          <ul className="auto-summary">
            <li><strong>{ws.domain || '-'}</strong><span className="muted">Website</span></li>
            <li><strong>{ws.competitors.length}</strong><span className="muted">Competitors</span></li>
            <li><strong>{ws.keywords.length}</strong><span className="muted">Keywords</span></li>
            <li><strong>{Object.keys(ws.directories).length}</strong><span className="muted">Directories</span></li>
          </ul>
        </section>
      ) : null}

      {mode === 'manual' ? (
      <ol className="steps">
        <li className="card pad step" data-done={steps[0].done ? 'true' : undefined}>
          <h2><span className="step-n">1</span> Your website</h2>
          <AddRow label="Website" placeholder="yourproduct.com" button={ws.domain ? 'Change' : 'Add website'} onAdd={(v) => {
            const dom = cleanDomain(v)
            if (!dom) return 'Enter a website like yourproduct.com.'
            update({ domain: dom, competitors: ws.competitors.filter((c) => c !== dom) })
            return null
          }} />
          {ws.domain ? <p className="muted">Tracking <strong>{ws.domain}</strong>. <Link href="/">Run a fresh check</Link> to refresh the report.</p> : null}
        </li>

        <li className="card pad step" data-done={steps[1].done ? 'true' : undefined}>
          <h2><span className="step-n">2</span> Your competitors</h2>
          <AddRow label="Competitor website" placeholder="competitor.com" onAdd={addCompetitor} />
          <p className="muted">{ws.competitors.length} of {limits.competitors} used.</p>
          {ws.competitors.length ? <ul className="chips">{ws.competitors.map((c) => <li key={c}>{c}</li>)}</ul> : null}
        </li>

        <li className="card pad step" data-done={steps[2].done ? 'true' : undefined}>
          <h2><span className="step-n">3</span> Keywords to track</h2>
          {steps[2].locked ? (
            <p className="muted">Keyword tracking is included from the {planFor('keywords').name} plan. <Link href={upgradeHref(planFor('keywords'))}>Upgrade</Link> to track up to 10 keywords.</p>
          ) : (
            <>
              <AddRow label="Keyword" placeholder={`${brand} alternatives`} onAdd={addKeyword} />
              {ws.domain ? (
                <p className="suggest"><span className="muted">Try:</span> {[`${brand} alternatives`, `${brand} reviews`, `${brand} pricing`].filter((k) => !ws.keywords.includes(k)).map((k) => <button key={k} type="button" className="chip-btn" onClick={() => addKeyword(k)}>+ {k}</button>)}</p>
              ) : null}
              <p className="muted">{ws.keywords.length} of {limits.keywords} used.</p>
            </>
          )}
        </li>

        <li className="card pad step" data-done={steps[3].done ? 'true' : undefined}>
          <h2><span className="step-n">4</span> Directories</h2>
          {steps[3].locked ? (
            <p className="muted">Directory submissions are included from the {planFor('directories').name} plan. <Link href={upgradeHref(planFor('directories'))}>Upgrade</Link> to get a submission tracker.</p>
          ) : (
            <>
              <p className="muted">Pick where to list {ws.domain || 'your product'} first. {Object.keys(ws.directories).length} of {limits.directories} chosen.</p>
              <ul className="pick-list">
                {starters.map((s) => (
                  <li key={s.slug}>
                    <label><input type="checkbox" checked={!!ws.directories[s.slug]} disabled={!ws.directories[s.slug] && Object.keys(ws.directories).length >= limits.directories} onChange={() => (ws.directories[s.slug] ? update((w) => { const { [s.slug]: _, ...rest } = w.directories; return { directories: rest } }) : pickDir(s.slug))} /> <strong>{s.name}</strong> <span className="muted">{s.description}</span></label>
                  </li>
                ))}
              </ul>
            </>
          )}
        </li>
      </ol>
      ) : null}

      {done === steps.length || (plan === 'free' && steps[0].done && steps[1].done) ? (
        <p><Link className="btn" href="/dashboard">Go to your dashboard</Link></p>
      ) : null}
    </>
  )
}
