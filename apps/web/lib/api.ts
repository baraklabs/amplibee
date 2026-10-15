// Client for the JSON API. The site is a pure client of it: no database access happens here.

import { API_URL } from './config.ts'
import { accessToken as currentToken } from './auth.ts'
import type { Gap, LogLine, Report } from './shared/types.ts'
import type { Workspace } from './workspace.ts'

export interface ApiEnvelope<T> {
  ok: boolean
  data: T | null
  error: { code: string; message: string } | null
}

export class ApiError extends Error {
  code: string
  status: number
  retryAfter?: number
  constructor(code: string, message: string, status: number, retryAfter?: number) {
    super(message)
    this.code = code
    this.status = status
    this.retryAfter = retryAfter
  }
}

export interface StepView {
  step: number
  key: string
  title: string
  status: 'pending' | 'running' | 'awaiting_input' | 'done' | 'error'
  log: LogLine[]
}

export interface ProductView {
  title?: string | null
  description?: string | null
  one_liner?: string | null
  headings?: { level: number; text: string }[]
  sells?: string
  customer?: string
  markets?: string
}

export interface CheckView {
  id: string
  mode: 'website' | 'no_website'
  domain: string | null
  status: 'running' | 'awaiting_input' | 'done' | 'error'
  tier: 'free' | 'full'
  unlocked: boolean
  product: ProductView
  competitors: string[]
  competitor_suggestions: string[]
  competitor_more: number
  query_count: number
  query_cap: number
  steps: StepView[]
  partial: { self: Report['self'] } | null
  report: Report | null
  busy?: boolean
}

export interface ReportSummary {
  domain: string
  generated_at: string
  score: number | null
  sub_scores: Report['sub_scores']
  gap_total: number
  gaps: Gap[]
}

export type RequestType = 'directory_submission' | 'track_competitors' | 'launch_done_for_you'

/** The signed-in user's access token, or a clear error when there is no session. */
async function accessToken(): Promise<string> {
  const token = await currentToken()
  if (!token) throw new ApiError('auth_required', 'Sign in to continue.', 401)
  return token
}

async function call<T>(path: string, init: RequestInit & { json?: unknown; auth?: boolean } = {}): Promise<T> {
  const { json, auth, ...rest } = init
  const authHeader: Record<string, string> = auth ? { authorization: `Bearer ${await accessToken()}` } : {}
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: { ...(json !== undefined ? { 'content-type': 'application/json' } : {}), ...authHeader, ...(rest.headers ?? {}) },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    })
  } catch {
    throw new ApiError('network', 'Could not reach the Amplibee API. Check your connection and try again.', 0)
  }
  let body: ApiEnvelope<T> | null = null
  try {
    body = (await res.json()) as ApiEnvelope<T>
  } catch {
    // fall through to the generic error below
  }
  if (!res.ok || !body || !body.ok || body.data === null) {
    const retry = Number(res.headers.get('retry-after'))
    throw new ApiError(body?.error?.code ?? 'bad_response', body?.error?.message ?? `The API answered with status ${res.status}.`, res.status, Number.isFinite(retry) && retry > 0 ? retry : undefined)
  }
  return body.data
}

/** A random id this browser keeps, so the server can count checks per browser as well as per IP. Empty when storage is blocked. */
function browserId(): string | undefined {
  try {
    let id = localStorage.getItem("amplibee_browser")
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem("amplibee_browser", id)
    }
    return id
  } catch {
    return undefined
  }
}

export const api = {
  createCheck: (b: { domain?: string; no_website?: { sells: string; customer?: string; markets?: string }; turnstile_token: string; utm?: Record<string, string> }) =>
    call<{ job_id: string; domain: string | null; mode: string }>('/check', { method: 'POST', json: { ...b, client_id: browserId() } }),
  getCheck: (id: string) => call<CheckView>(`/check/${id}`),
  advance: (id: string) => call<CheckView>(`/check/${id}/advance`, { method: 'POST', json: {} }),
  setCompetitors: (id: string, competitors: string[]) => call<CheckView>(`/check/${id}/competitors`, { method: 'PATCH', json: { competitors } }),
  setProduct: (id: string, p: { title?: string; description?: string; one_liner?: string }) => call<CheckView>(`/check/${id}/product`, { method: 'PATCH', json: p }),
  unlock: (job_id: string) =>
    call<{ report: Report | null; email_sent: boolean; report_url: string; job: CheckView }>('/unlock', { method: 'POST', json: { job_id }, auth: true }),
  sendContact: (b: { name: string; email: string; company?: string; topic: string; message: string; turnstile_token: string }) =>
    call<{ received: boolean }>('/contact', { method: 'POST', json: b }),
  createRequest: (job_id: string, type: RequestType, note?: string) =>
    call<{ already: boolean; type: RequestType; status: string }>('/requests', { method: 'POST', json: { job_id, type, note }, auth: true }),
  listRequests: (job_id: string) =>
    call<{ type: RequestType; status: string; created_at: string }[]>(`/requests?job_id=${encodeURIComponent(job_id)}`, { auth: true }),
  switchPlan: (plan: string) => call<{ plan: string }>('/plan', { method: 'POST', json: { plan }, auth: true }),
  getWorkspace: () => call<Workspace>('/workspace', { auth: true, cache: 'no-store' }),
  saveWorkspace: (w: Workspace) => call<Workspace>('/workspace', { method: 'PUT', json: w, auth: true }),
  report: (domain: string, k?: string) =>
    call<{ access: 'full'; report: Report } | { access: 'summary'; report: ReportSummary }>(`/report/${encodeURIComponent(domain)}${k ? `?k=${encodeURIComponent(k)}` : ''}`, { cache: 'no-store' }),
}
