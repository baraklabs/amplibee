'use client'

import Link from 'next/link'
import { type FormEvent, useRef, useState } from 'react'
import { api, ApiError, type CheckView, type StepView } from '../../lib/api.ts'
import { hasFeature } from '../../lib/content/plans.ts'
import { deriveSetup, type SetupResult } from '../../lib/autoSetup.ts'
import { cleanDomain } from '../../lib/workspace.ts'
import { Turnstile } from '../Turnstile.tsx'
import { useDash } from './DashboardContext.tsx'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const SKELETON: StepView[] = ['Research your product', 'Find competitors', 'Scan visibility', 'Score and rank gaps', 'Plan fixes', 'Launch'].map((title, i) => ({ step: i + 1, key: String(i), title, status: 'pending', log: [] }))

/**
 * One field, one button: runs the full check on the site, then fills in competitors, keywords, directories and
 * content ideas for the current plan. Everything stays editable on the other pages.
 */
export function AutoSetup({ compact = false }: { compact?: boolean }) {
  const { ws, plan, update, refresh } = useDash()
  const [domain, setDomain] = useState(ws.domain)
  const [token, setToken] = useState<string | null>(null)
  const [reset, setReset] = useState(0)
  const [busy, setBusy] = useState(false)
  const [steps, setSteps] = useState<StepView[]>(SKELETON)
  const [phase, setPhase] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<SetupResult | null>(null)
  const running = useRef(false)

  async function run(e: FormEvent) {
    e.preventDefault()
    if (running.current) return
    setError('')
    setResult(null)
    const dom = cleanDomain(domain)
    if (!dom) return setError('Enter your website address, for example example.com.')
    if (!token) return setError('The bot check is still loading. Wait a moment and try again.')
    running.current = true
    setBusy(true)
    setSteps(SKELETON.map((s, i) => ({ ...s, status: i === 0 ? 'running' : 'pending' })))
    try {
      setPhase('Starting the check')
      const created = await api.createCheck({ domain: dom, turnstile_token: token })

      let view: CheckView = await api.getCheck(created.job_id)
      let failures = 0
      while (view.status === 'running') {
        setSteps(view.steps)
        setPhase(view.steps.find((s) => s.status === 'running')?.title ?? 'Working')
        try {
          view = await api.advance(created.job_id)
          failures = 0
          if (view.busy) await sleep(1500)
        } catch (err) {
          if (err instanceof ApiError && err.status === 429) throw err
          if (++failures >= 4) throw err
          await sleep(1000 * failures)
        }
      }
      setSteps(view.steps)
      if (view.status === 'awaiting_input') throw new ApiError('needs_input', 'This check needs a few answers from you before it can finish.', 0)
      if (view.status === 'error') throw new ApiError('check_failed', 'The check could not read this site. Check the address and try again.', 0)

      // Unlocking brings the full report and the extra competitor suggestions, and emails the report link.
      setPhase('Unlocking your report')
      const unlocked = await api.unlock(created.job_id)
      const rivals = [...unlocked.job.competitors, ...unlocked.job.competitor_suggestions]

      setPhase('Setting up your dashboard')
      const out = deriveSetup({ domain: dom, plan, ws, competitors: rivals, report: unlocked.report })
      update(out.patch)
      refresh()
      setResult(out)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
    } finally {
      running.current = false
      setBusy(false)
      setPhase('')
      setToken(null)
      setReset((n) => n + 1)
    }
  }

  const skipped = (['keywords', 'directories', 'content'] as const).filter((f) => !hasFeature(plan, f)).map((f) => ({ keywords: 'keyword tracking', directories: 'directory tracking', content: 'content ideas' })[f])
  const doneCount = steps.filter((s) => s.status === 'done').length

  return (
    <div className={`auto${compact ? ' compact' : ''}`}>
      <form className="add-row" onSubmit={run} noValidate>
        <label className="label" htmlFor="auto-domain">Your website</label>
        <div className="add-row-fields">
          <input id="auto-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourproduct.com" disabled={busy} autoComplete="off" autoCapitalize="none" spellCheck={false} />
          <button type="submit" className="btn" disabled={busy || !domain.trim()}>{busy ? <><span className="btn-spin" aria-hidden="true" />Working</> : ws.domain ? 'Run again' : 'Set up automatically'}</button>
        </div>
        {error ? <p className="field-error" role="alert">{error}</p> : null}
      </form>
      <Turnstile onToken={setToken} resetKey={reset} />

      {busy ? (
        <div className="auto-run" role="status" aria-live="polite">
          <p className="auto-phase"><span className="agent-mark" /> <span className="shimmer">{phase}</span> <span className="muted">({doneCount} of {steps.length} steps)</span></p>
          <ol className="auto-steps">
            {steps.map((s) => <li key={s.step} data-status={s.status}><span aria-hidden="true">{s.status === 'done' ? '✓' : s.status === 'running' ? '›' : '·'}</span> {s.title}</li>)}
          </ol>
          <p className="caption muted">This takes about a minute. Keep this page open.</p>
        </div>
      ) : null}

      {result ? (
        <div className="auto-done" role="status">
          <p><strong>Your dashboard is ready.</strong> We added:</p>
          <ul className="ticks">
            <li>{result.added.competitors} competitors</li>
            {result.added.keywords ? <li>{result.added.keywords} keywords to track</li> : null}
            {result.added.directories ? <li>{result.added.directories} directories to submit to</li> : null}
            {result.added.content ? <li>{result.added.content} content ideas</li> : null}
          </ul>
          {skipped.length ? <p className="muted">Not included on your plan: {skipped.join(', ')}.</p> : null}
          <p className="muted">We emailed you the report link.</p>
          <p className="locked-actions">
            <Link className="btn" href="/dashboard">Open the dashboard</Link>
            <Link className="btn secondary" href="/dashboard/competitors">Review competitors</Link>
          </p>
        </div>
      ) : null}
    </div>
  )
}
