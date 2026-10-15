'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, type ReportSummary } from '../../lib/api.ts'
import type { Me } from '../../lib/auth.ts'
import { type Limits, LIMITS, type PlanId, PLANS } from '../../lib/content/plans.ts'
import type { Report } from '../../lib/shared/types.ts'
import { loadWorkspace, saveWorkspace, today, type Workspace } from '../../lib/workspace.ts'

type AnyReport = Report | ReportSummary

interface Ctx {
  me: Me
  plan: PlanId
  limits: Limits
  ws: Workspace
  update: (patch: Partial<Workspace> | ((w: Workspace) => Partial<Workspace>)) => void
  report: AnyReport | null
  reportState: 'none' | 'loading' | 'ready' | 'missing'
  refresh: () => void
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

export function DashboardProvider({ me, children }: { me: Me; children: ReactNode }) {
  const [ws, setWs] = useState<Workspace>(() => loadWorkspace(me.id))
  const [preview, setPreview] = useState<PlanId | null>(null)
  const [report, setReport] = useState<AnyReport | null>(null)
  const [reportState, setReportState] = useState<Ctx['reportState']>('none')
  const [tick, setTick] = useState(0)
  const hydrated = useRef(false)

  // localStorage is read after mount so the server and client markup agree.
  useEffect(() => {
    setWs(loadWorkspace(me.id))
    setPreview(previewPlan())
    hydrated.current = true
  }, [me.id])

  const update = useCallback<Ctx['update']>(
    (patch) => {
      setWs((w) => {
        const next = { ...w, ...(typeof patch === 'function' ? patch(w) : patch) }
        saveWorkspace(me.id, next)
        return next
      })
    },
    [me.id],
  )

  const domain = ws.domain
  useEffect(() => {
    if (!hydrated.current || !domain) {
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
  }, [domain, tick, update])

  const plan: PlanId = preview ?? me.plan ?? 'free'
  const value = useMemo<Ctx>(() => ({ me, plan, limits: LIMITS[plan], ws, update, report, reportState, refresh: () => setTick((t) => t + 1) }), [me, plan, ws, update, report, reportState])

  return <DashCtx.Provider value={value}>{children}</DashCtx.Provider>
}
