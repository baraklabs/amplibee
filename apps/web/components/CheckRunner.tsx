'use client'

import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { api, ApiError, type CheckView, type StepView } from '../lib/api.ts'
import { ReportView } from './ReportView.tsx'
import { AuthGate } from './AuthGate.tsx'
import { RequestPanel } from './RequestPanel.tsx'
import { StepDetail } from './StepDetail.tsx'

const STATUS_LABEL: Record<StepView['status'], string> = {
  pending: 'Waiting',
  running: 'Running',
  awaiting_input: 'Needs you',
  done: 'Done',
  error: 'Failed',
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour12: false })

const VERB: Record<string, string> = {
  research: 'Amplibee is reading your pages',
  competitors: 'Amplibee is finding your competitors',
  scan: 'Amplibee is mapping where competitors are listed',
  score: 'Amplibee is finding the gaps',
  plan: 'Amplibee is preparing your launch plan',
  launch: 'Amplibee is launching your product',
}

function Rows({ step, live }: { step: StepView; live: boolean }) {
  const box = useRef<HTMLUListElement>(null)
  useEffect(() => {
    if (live && box.current) box.current.scrollTop = box.current.scrollHeight
  }, [step.log.length, live])
  return (
    <ul className="trk-list" ref={box}>
      {live && step.status === 'running' && !step.log.length ? (
        <li className="trk-row live">
          <span className="ico" aria-hidden="true"><span className="spin" /><span className="tick" /></span>
          <span>Processing</span>
        </li>
      ) : null}
      {step.log.map((l, i) => {
        const isLast = i === step.log.length - 1
        const spinning = live && isLast && step.status === 'running'
        return (
          <li key={`${step.step}-${i}`} className={`trk-row${spinning ? ' live' : ''}${l.level === 'warn' || l.level === 'error' ? ' warn' : ''}`}>
            <span className="ico" aria-hidden="true"><span className="spin" /><span className="tick" /></span>
            <span>{l.msg}<span className="t-time mono">{clock(l.t)}</span></span>
          </li>
        )
      })}
    </ul>
  )
}

/** Read-only answers for a check without a website. For a website, what was found is shown under step 1 in the sidebar. */
function ProductPanel({ view }: { view: CheckView }) {
  const p = view.product
  if (view.mode !== 'no_website') return null
  return (
    <div className="panel">
      <span className="label">Your answers</span>
      <dl style={{ margin: '8px 0 0' }}>
        <dt className="muted">Sells</dt><dd style={{ margin: '0 0 8px' }}>{p.sells}</dd>
        {p.customer ? <><dt className="muted">Ideal customer</dt><dd style={{ margin: '0 0 8px' }}>{p.customer}</dd></> : null}
        {p.markets ? <><dt className="muted">Markets</dt><dd style={{ margin: 0 }}>{p.markets}</dd></> : null}
      </dl>
    </div>
  )
}

/** Numbered step bar: finished steps are filled, the current one is a pill with its name. */
function Stepper({ steps, selected, onSelect }: { steps: StepView[]; selected?: number | null; onSelect?: (step: number | null) => void }) {
  return (
    <ol className="ws-steps" aria-label="Progress">
      {steps.map((s, i) => {
        const current = s.status === 'running' || s.status === 'awaiting_input'
        return (
          <li key={s.step} className={`ws-step ${s.status}`} aria-current={current ? 'step' : undefined}>
            {i > 0 ? <span className="ws-line" aria-hidden="true" /> : null}
            {(() => {
              const face = current ? (
                <span className="ws-pill"><span className="ws-dot" />{s.step} {s.title}</span>
              ) : (
                <span className="ws-num" title={s.title}>{s.step}</span>
              )
              if (!onSelect) return face
              return (
                <button
                  type="button"
                  className={`ws-step-btn${selected === s.step ? " active" : ""}`}
                  disabled={s.status === "pending"}
                  aria-pressed={selected === s.step}
                  aria-label={`Step ${s.step}: ${s.title}`}
                  onClick={() => onSelect(selected === s.step ? null : s.step)}
                >
                  {face}
                </button>
              )
            })()}
          </li>
        )
      })}
    </ol>
  )
}

/** Left rail: one line per step, what was found on the site under step 1, and the live log of the running step. */
function Sidebar({ view, selected, onSelect }: { view: CheckView; selected: number | null; onSelect: (step: number | null) => void }) {
  const current = view.steps.find((s) => s.status === 'running' || s.status === 'awaiting_input')
  const p = view.product
  return (
    <aside className="ws-side">
      {view.steps.map((s) => (
        <div key={s.step} className={`ws-side-step ${s.status}`}>
          <button
            type="button"
            className={`ws-side-btn${selected === s.step ? ' active' : ''}`}
            disabled={s.status === 'pending'}
            aria-pressed={selected === s.step}
            onClick={() => onSelect(selected === s.step ? null : s.step)}
          >
            <span className="ws-side-title mono">{s.status === 'done' ? '✓' : s.status === 'pending' ? '·' : '›'} step {s.step} · {s.title}</span>
          </button>
          {s.step === 1 && view.mode === 'website' ? (
            <p className="ws-company"><strong>{view.domain}</strong>{p.title ? <span>{p.title}</span> : null}{p.description || p.one_liner ? <span className="muted">{p.description || p.one_liner}</span> : null}</p>
          ) : null}
          {s.step === 2 && s.status === 'done' ? (
            view.competitors.length ? (
              <ul className="muted ws-chips ws-list">{view.competitors.map((d) => <li key={d}>{d}</li>)}</ul>
            ) : (
              <p className="muted ws-chips">No competitors found</p>
            )
          ) : null}
        </div>
      ))}
      {current ? (
        <div className="ws-live">
          <p className="agent-line"><span className="agent-mark" /><span className="shimmer">Amplibee is working on step {current.step} of {view.steps.length}</span></p>
          <Rows step={current} live />
        </div>
      ) : null}
      <p className="caption">Search queries used: {view.query_count} of {view.query_cap}.</p>
      <ProductPanel view={view} />
    </aside>
  )
}

/** Centre card shown while the scan runs and no report exists yet. */
function Waiting({ view, skipIntro }: { view: CheckView; skipIntro: boolean }) {
  const current = view.steps.find((s) => s.status === 'running')
  return (
    <div className="ws-card">
      <p className="ws-card-label mono">{current ? VERB[current.key] : 'Working'}</p>
      <p className="ws-big">{view.domain ?? 'Your launch plan'}</p>
      <StepPreview steps={view.steps} skipIntro={skipIntro} />
    </div>
  )
}

const STEP_INFO: Record<string, string> = {
  research: 'Researches your product: reads your pages to see what you sell and who it is for',
  competitors: 'Finds your competitors automatically',
  scan: 'Maps where you and your competitors are listed and mentioned',
  score: 'Finds the gaps and ranks them by impact',
  plan: 'Prepares your launch plan, fix by fix',
  launch: 'Launches your product with the plan',
}

/** Two passes: the step titles appear one by one, then the detail under each one appears in the same order. */
function StepPreview({ steps, skipIntro = false }: { steps: StepView[]; skipIntro?: boolean }) {
  const [shown, setShown] = useState(skipIntro ? steps.length : 0)
  const [detailed, setDetailed] = useState(skipIntro ? steps.length : 0)
  useEffect(() => {
    const total = steps.length
    if (shown >= total && detailed >= total) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const titlePass = shown < total
    // Pause once between the two passes so the full list is readable before the details start.
    const wait = reduce ? 0 : titlePass ? 700 : detailed === 0 ? 1200 : 600
    const t = setTimeout(() => (titlePass ? setShown((n) => n + 1) : setDetailed((n) => n + 1)), wait)
    return () => clearTimeout(t)
  }, [shown, detailed, steps.length])
  return (
    <ol className="ws-preview" aria-label="What Amplibee will do">
      {steps.slice(0, shown).map((s, i) => (
        <li key={s.step} className={`ws-prev-row ${s.status}`}>
          <span className="ws-prev-ico" aria-hidden="true">{s.status === 'done' ? '✓' : <>{s.step}<span className="ws-ring" /></>}</span>
          <span>
            <strong>{s.title}</strong>
            {i < detailed ? <span className="muted ws-prev-desc">{STEP_INFO[s.key]}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  )
}

const STEP_SKELETON: [string, string][] = [
  ['research', 'Research your product'],
  ['competitors', 'Find competitors'],
  ['scan', 'Scan visibility'],
  ['score', 'Score and rank gaps'],
  ['plan', 'Plan fixes'],
  ['launch', 'Launch'],
]

const SHELL_LINES = ['Connecting to the site', 'Fetching the homepage', 'Reading the page title and description', 'Reading the headings', 'Working out what you sell and who it is for']

/** Placeholder processing lines for step 1, shown one by one until the real log arrives. */
function ShellLog({ domain }: { domain: string | null }) {
  const [n, setN] = useState(1)
  useEffect(() => {
    if (n >= SHELL_LINES.length) return
    const t = setTimeout(() => setN((x) => x + 1), 1100)
    return () => clearTimeout(t)
  }, [n])
  return (
    <ul className="trk-list" aria-label="Processing">
      {SHELL_LINES.slice(0, n).map((l, i) => {
        const live = i === n - 1
        return (
          <li key={l} className={`trk-row${live ? ' live' : ''}`}>
            <span className="ico" aria-hidden="true"><span className="spin" /><span className="tick" /></span>
            <span>{l}{domain && i === 0 ? ` ${domain}` : ''}</span>
          </li>
        )
      })}
    </ul>
  )
}

/** The workspace before the first response arrives: step 1 already shows as running, so there is no separate loading page. */
function Shell({ domain }: { domain: string | null }) {
  const steps: StepView[] = STEP_SKELETON.map(([key, title], i) => ({ step: i + 1, key, title, status: i === 0 ? 'running' : 'pending', log: [] }))
  return (
    <div className="ws">
      <Stepper steps={steps} />
      <div className="ws-grid">
        <aside className="ws-side">
          {steps.map((s) => (
            <div key={s.step} className={`ws-side-step ${s.status}`}>
              <p className="ws-side-title mono">{s.status === 'running' ? '›' : '·'} step {s.step} · {s.title}</p>
              {s.step === 1 && domain ? <p className="ws-company"><strong>{domain}</strong></p> : null}
            </div>
          ))}
          <div className="ws-live"><p className="agent-line"><span className="agent-mark" /><span className="shimmer">Amplibee is working on step 1 of 6</span></p><ShellLog domain={domain} /></div>
        </aside>
        <main className="ws-main">
          <div className="ws-card">
            <p className="ws-card-label mono">{VERB.research}</p>
            <p className="ws-big">{domain ?? 'Your launch plan'}</p>
            <StepPreview steps={steps} />
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Plays the steps back one at a time, even when the server already has everything (a saved result, a cached scan).
 * Each step shows as running while its log lines appear, then holds for a moment with its outcome on the right before
 * the next one starts. A live run is never held back for long: a step can only be shown once the server has it.
 * `auto` is the step number whose outcome should be on screen; null once playback is over.
 */
// A step's details are never on screen for more than about 3 s once it has been fetched: a short list view, its log lines
// (squeezed into LINES_MS in total), then its outcome for HOLD_MS. While the server is still fetching, the step shows as processing.
const HOLD_MS = 1300 // a finished step stays on screen with its outcome
const INTRO_MS = 1000 // the list of steps is shown on its own before step 1 starts
const LIST_MS = 400 // between steps the list is shown again, with the finished step ticked and the next one processing
const LINES_MS = 800 // all the log lines of one step appear within this time

function usePaced(raw: CheckView | null): { view: CheckView | null; auto: number | null; playing: boolean } {
  const [shown, setShown] = useState(0) // steps fully played
  const [lines, setLines] = useState(0) // log lines revealed on the step being played
  const [held, setHeld] = useState(false) // the step being played is finished and its outcome is on screen
  const [gap, setGap] = useState(true) // the list is on screen before the step being played starts
  const total = raw?.steps.length ?? 0
  const passthrough = !raw || raw.status === 'error' || raw.status === 'awaiting_input' || raw.steps.some((x) => x.status === 'error' || x.status === 'awaiting_input')

  useEffect(() => {
    if (!raw || passthrough || shown >= total) return
    const cur = raw.steps[shown]
    if (cur.status === 'pending') return
    if (gap) {
      const t = setTimeout(() => setGap(false), shown === 0 ? INTRO_MS : LIST_MS)
      return () => clearTimeout(t)
    }
    if (cur.log.length > lines) {
      const t = setTimeout(() => setLines((n) => n + 1), Math.min(160, Math.max(25, LINES_MS / Math.max(1, cur.log.length))))
      return () => clearTimeout(t)
    }
    if (cur.status !== 'done') return
    if (!held) {
      const t = setTimeout(() => setHeld(true), 300)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setShown((n) => n + 1)
      setLines(0)
      setHeld(false)
      setGap(true)
    }, HOLD_MS)
    return () => clearTimeout(t)
  }, [raw, passthrough, shown, lines, held, gap, total])

  if (!raw || passthrough || shown >= total) return { view: raw, auto: null, playing: false }
  const reveal = shown + (held ? 1 : 0)
  const steps = raw.steps.map((x, i): StepView => {
    if (i < shown) return x
    if (i === shown) {
      // Not fetched yet, or about to be played: show it as processing, with no lines.
      if (x.status === 'pending' || gap) return { ...x, status: 'running', log: [] }
      return { ...x, status: held ? 'done' : 'running', log: x.log.slice(0, lines) }
    }
    return { ...x, status: 'pending', log: [] }
  })
  const view: CheckView = {
    ...raw,
    status: 'running',
    steps,
    report: reveal >= 4 ? raw.report : null,
    partial: reveal >= 3 ? raw.partial : null,
    product: raw.mode === 'no_website' || reveal >= 1 ? raw.product : {},
    competitors: reveal >= 2 ? raw.competitors : [],
    competitor_suggestions: reveal >= 2 ? raw.competitor_suggestions : [],
    competitor_more: reveal >= 2 ? raw.competitor_more : 0,
  }
  // Only the finished step is opened on the right; while a step processes, the list of steps stays there.
  return { view, auto: held ? shown + 1 : null, playing: true }
}

export function CheckRunner({ id }: { id: string }) {
  const params = useParams<{ domain?: string }>()
  const [raw, setView] = useState<CheckView | null>(null)
  const { view, auto, playing } = usePaced(raw)
  const [manual, setManual] = useState(false) // the user picked a step, so stop following the playback
  const [error, setError] = useState('')
  const [kick, setKick] = useState(0)
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const introPlayed = useRef(false) // the step list has been shown once, so coming back to it does not replay the build-up

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let failures = 0
      let v: CheckView
      try {
        v = await api.getCheck(id)
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Could not load this check.')
        return
      }
      if (cancelled) return
      setView(v)
      while (!cancelled) {
        if (v.status === 'done' || v.status === 'error' || v.status === 'awaiting_input') break
        try {
          v = await api.advance(id)
          failures = 0
          if (cancelled) return
          setView(v)
          if (v.busy) await sleep(1500)
        } catch (e) {
          failures++
          if (e instanceof ApiError && e.status === 429) {
            setError(e.message)
            return
          }
          if (failures >= 4) {
            setError(e instanceof ApiError ? e.message : 'The check stopped. Reload the page to continue.')
            return
          }
          await sleep(1000 * failures)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, kick])

  // Mirror progress in the address bar: phase=running while scanning, phase=final once finished.
  useEffect(() => {
    if (!view) return
    const url = new URL(window.location.href)
    if (!url.searchParams.has('phase')) return
    const phase = view.status === 'done' ? 'final' : 'running'
    if (url.searchParams.get('phase') !== phase) {
      url.searchParams.set('phase', phase)
      window.history.replaceState(null, '', url)
    }
  }, [view])

  if (error && !view) {
    return (
      <div className="wrap page-head">
        <h1>This check could not be loaded</h1>
        <p className="lede">{error}</p>
      </div>
    )
  }
  if (!view) return <Shell domain={params.domain ? decodeURIComponent(String(params.domain)) : null} />

  const scanDone = view.steps[2].status === 'done'
  const finished = view.status === 'done'
  const pick = (n: number | null) => {
    setManual(true)
    setSelected(n)
  }
  const current = manual ? selected : playing ? auto : selected
  const selectedStep = view.steps.find((x) => x.step === current && x.status !== 'pending') ?? null
  if (selectedStep) introPlayed.current = true
  const title = view.mode === 'website' ? view.domain : 'Your launch plan'

  return (
    <div className="ws">
      <Stepper steps={view.steps} selected={current} onSelect={pick} />

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="locked-note" role="status">{notice}</p> : null}

      <div className="ws-grid">
        <Sidebar view={view} selected={current} onSelect={pick} />
        <main className="ws-main">
          <p className="lede" role="status">
            {view.status === 'error'
              ? 'A step failed three times. The log shows which one. Start a new check to try again.'
              : finished
                  ? view.unlocked ? 'Finished. The full report is below.' : 'Finished. Your score and top 3 gaps are below.'
                  : `Running ${title}. Each line is a real request or measurement.`}
          </p>
          {selectedStep ? <StepDetail view={view} step={selectedStep} onClose={() => pick(null)} /> : null}
          {!selectedStep && (!view.report || playing) && view.status === 'running' ? <Waiting view={view} skipIntro={introPlayed.current} /> : null}
          {!selectedStep && view.report && !playing ? (
            <section aria-label="Report">
              <ReportView
                report={view.report}
                unlockSlot={
                  view.report.locked && scanDone ? (
                    <AuthGate
                      jobId={view.id}
                      onUnlocked={(v, sent, url) => {
                        setView(v)
                        setKick((n) => n + 1)
                        setNotice(sent ? 'The full report is unlocked and the link is in your inbox.' : `The full report is unlocked. We could not send the email, so keep this address: ${url}`)
                      }}
                    />
                  ) : null
                }
              />
              {view.report && !view.report.locked ? <RequestPanel jobId={view.id} /> : null}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}
