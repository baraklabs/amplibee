'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, type ReportSummary } from '../../lib/api.ts'
import type { Me } from '../../lib/auth.ts'
import { type Limits, LIMITS, type PlanId, PLANS } from '../../lib/content/plans.ts'
import type { Report } from '../../lib/shared/types.ts'
import { EMPTY, loadWorkspace, saveWorkspace, today, type Workspace } from '../../lib/workspace.ts'

type AnyReport = Report | ReportSummary

/** loading: first fetch, saved: server has the latest, saving: a change is on its way, offline: the server could not be reached. */
export type SyncState = 'loading' | 'saved' | 'saving' | 'offline'

interface Ctx {
  me: Me
  plan: PlanId
  limits: Limits
  ws: Workspace
  update: (patch: Partial<Workspace> | ((w: Workspace) => Partial<Workspace>)) => void
  report: AnyReport | null
  reportState: 'none' | 'loading' | 'ready' | 'missing'
  refresh: () => void
  sync: SyncState
  retrySync: () => void
}

const DashCtx = createContext<Ctx | null>(null)

export function useDash(): Ctx {
  const c = useContext(DashCtx)
  if (!c) throw new Error('useDash outside the dashboard')
  return c
}

/** In development, ?plan=growth previews another plan without touching the account. */
function previewPlan(): PlanId | null {
  if (process.env.NODE_ENV === 'production') return null
  try {
    const q = new URLSearchParams(window.location.search).get('plan')
    if (q) sessionStorage.setItem('amplibee_preview_plan', q)
    const v = sessionStorage.getItem('amplibee_preview_plan')
    return PLANS.some((p) => p.id === v) ? (v as PlanId) : null
  } catch {
    return null
  }
}

const isEmpty = (w: Workspace) => !w.domain && !w.competitors.length && !w.keywords.length && !Object.keys(w.directories).length && !w.content.length
const sameLists = (a: Workspace, b: Workspace) =>
  a.domain === b.domain && a.competitors.length === b.competitors.length && a.keywords.length === b.keywords.length && Object.keys(a.directories).length === Object.keys(b.directories).length && a.content.length === b.content.length

const SAVE_DELAY_MS = 700

export function DashboardProvider({ me, children }: { me: Me; children: ReactNode }) {
  const [ws, setWs] = useState<Workspace>(EMPTY)
  const [preview, setPreview] = useState<PlanId | null>(null)
  const [report, setReport] = useState<AnyReport | null>(null)
  const [reportState, setReportState] = useState<Ctx['reportState']>('none')
  const [tick, setTick] = useState(0)
  const [sync, setSync] = useState<SyncState>('loading')
  const [loaded, setLoaded] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [dirty, setDirty] = useState(0) // bumped by every edit; the save effect reacts to it
  const version = useRef(0) // the edit number the screen is on, so a slow save never overwrites a newer edit
  const wsRef = useRef(ws)
  wsRef.current = ws

  // The browser copy shows at once; the server copy replaces it as soon as it arrives.
  useEffect(() => {
    setPreview(previewPlan())
    const local = loadWorkspace(me.id)
    setWs(local)
    let live = true
    setSync('loading')
    api
      .getWorkspace()
      .then((server) => {
        if (!live) return
        if (isEmpty(server) && !isEmpty(local)) {
          // First time on the server: upload what this browser already has.
          setWs(local)
          version.current++
          setDirty((d) => d + 1)
        } else {
          setWs(server)
          saveWorkspace(me.id, server)
        }
        setLoaded(true)
        setSync('saved')
      })
      .catch(() => {
        if (live) setSync('offline')
      })
    return () => {
      live = false
    }
  }, [me.id, attempt])

  const update = useCallback<Ctx['update']>(
    (patch) => {
      setWs((w) => {
        const next = { ...w, ...(typeof patch === 'function' ? patch(w) : patch) }
        saveWorkspace(me.id, next)
        return next
      })
      version.current++
      setDirty((d) => d + 1)
    },
    [me.id],
  )

  // Save a moment after the last edit. Nothing is sent before the server copy has been read, so an empty screen can never overwrite real data.
  useEffect(() => {
    if (!loaded || dirty === 0) return
    setSync('saving')
    const sent = version.current
    const t = setTimeout(() => {
      api
        .saveWorkspace(wsRef.current)
        .then((saved) => {
          if (sent !== version.current) return // edited again meanwhile; that edit has its own save coming
          // The server cuts lists to the plan; show what it kept.
          if (!sameLists(saved, wsRef.current)) {
            setWs(saved)
            saveWorkspace(me.id, saved)
          }
          setSync('saved')
        })
        .catch(() => {
          if (sent === version.current) setSync('offline')
        })
    }, SAVE_DELAY_MS)
    return () => clearTimeout(t)
  }, [dirty, loaded, me.id])

  const domain = ws.domain
  useEffect(() => {
    if (!loaded || !domain) {
      setReport(null)
      setReportState('none')
      return
    }
    let live = true
    setReportState('loading')
    api
      .report(domain)
      .then((r) => {
        if (!live) return
        setReport(r.report)
        setReportState('ready')
        const score = r.report.score
        if (score !== null) {
          // One reading a day, kept so the analytics page can draw a trend.
          update((w) => (w.history.some((h) => h.date === today()) ? {} : { history: [...w.history, { date: today(), score }].slice(-60) }))
        }
      })
      .catch(() => {
        if (!live) return
        setReport(null)
        setReportState('missing')
      })
    return () => {
      live = false
    }
  }, [domain, tick, update, loaded])

  const plan: PlanId = preview ?? me.plan ?? 'free'
  const value = useMemo<Ctx>(
    () => ({ me, plan, limits: LIMITS[plan], ws, update, report, reportState, refresh: () => setTick((t) => t + 1), sync, retrySync: () => setAttempt((a) => a + 1) }),
    [me, plan, ws, update, report, reportState, sync],
  )

  return <DashCtx.Provider value={value}>{children}</DashCtx.Provider>
}
