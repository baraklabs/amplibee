// Client for the account endpoints (api/v1/auth/*). The login lives in this browser's localStorage: a short-lived
// access token and a refresh token that is swapped for a new pair whenever the access token runs out.

import { API_URL } from './config.ts'

export class AuthError extends Error {
  code: string
  status: number
  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

export interface Me {
  id: string
  email: string
  name: string | null
  has_password: boolean
  plan?: 'free' | 'starter' | 'plus' | 'growth' | 'scale' | 'authority'
  can_switch_plan?: boolean
  created_at?: string | null
  trial_ends_at?: string | null
  trial_available?: boolean
}

type Tokens = { access_token: string; refresh_token: string }
type SessionReply = ({ status: 'signed_in' } & Tokens) | { status: 'verification_required'; pending_token: string; email: string }

/** What the caller does next: the person is signed in, or has to type the code we emailed them. */
export type Outcome = { kind: 'signed_in' } | { kind: 'verify'; email: string }

const SESSION_KEY = 'amplibee_session'
const PENDING_KEY = 'amplibee_pending'
const EVENT = 'amplibee-auth'

function read<T>(store: 'local' | 'session', key: string): T | null {
  try {
    const raw = (store === 'local' ? localStorage : sessionStorage).getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(store: 'local' | 'session', key: string, value: unknown | null): void {
  try {
    const s = store === 'local' ? localStorage : sessionStorage
    if (value === null) s.removeItem(key)
    else s.setItem(key, JSON.stringify(value))
  } catch {
    // storage blocked: the login simply will not last past this tab
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT))
}

const stored = () => read<{ access: string; refresh: string }>('local', SESSION_KEY)
const setTokens = (t: Tokens | null) => write('local', SESSION_KEY, t ? { access: t.access_token, refresh: t.refresh_token } : null)

export const hasSession = () => !!stored()
export const getPending = () => read<{ token: string; email: string }>('session', PENDING_KEY)

/** Tells every open component that the account changed, so they load it again. */
export const notifyAccountChanged = () => window.dispatchEvent(new Event(EVENT))

/** Calls fn now and whenever the login changes (this tab or another). Returns the unsubscribe function. */
export function onAuthChange(fn: () => void): () => void {
  const on = (e: Event) => {
    if (e.type === EVENT || (e as StorageEvent).key === SESSION_KEY) fn()
  }
  window.addEventListener(EVENT, on)
  window.addEventListener('storage', on)
  return () => {
    window.removeEventListener(EVENT, on)
    window.removeEventListener('storage', on)
  }
}

async function call<T>(path: string, init: { method?: string; json?: unknown; bearer?: string } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/auth${path}`, {
      method: init.method ?? (init.json !== undefined ? 'POST' : 'GET'),
      headers: { ...(init.json !== undefined ? { 'content-type': 'application/json' } : {}), ...(init.bearer ? { authorization: `Bearer ${init.bearer}` } : {}) },
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
    })
  } catch {
    throw new AuthError('network', 'Could not reach Amplibee. Check your connection and try again.', 0)
  }
  let body: { ok?: boolean; data?: T; error?: { code: string; message: string } } | null = null
  try {
    body = await res.json()
  } catch {
    // handled below
  }
  if (!res.ok || !body?.ok) throw new AuthError(body?.error?.code ?? 'bad_response', body?.error?.message ?? `Sign-in answered with status ${res.status}.`, res.status)
  return body.data as T
}

function settle(r: SessionReply): Outcome {
  if (r.status === 'signed_in') {
    write('session', PENDING_KEY, null)
    setTokens(r)
    return { kind: 'signed_in' }
  }
  write('session', PENDING_KEY, { token: r.pending_token, email: r.email })
  return { kind: 'verify', email: r.email }
}

export const signIn = async (email: string, password: string) => settle(await call<SessionReply>('/signin', { json: { email, password } }))
export const signUp = async (name: string, email: string, password: string) => settle(await call<SessionReply>('/signup', { json: { name, email, password } }))
export const signInWithGoogle = async (credential: string) => settle(await call<SessionReply>('/google', { json: { credential } }))
export const verifyLink = async (token: string) => settle(await call<SessionReply>('/verify-link', { json: { token } }))

export async function verifyCode(code: string): Promise<Outcome> {
  const p = getPending()
  if (!p) throw new AuthError('session_expired', 'Your sign-up session has ended. Sign in to get a new code.', 401)
  return settle(await call<SessionReply>('/verify', { json: { code }, bearer: p.token }))
}

export async function resendCode(): Promise<void> {
  const p = getPending()
  if (!p) throw new AuthError('session_expired', 'Your sign-up session has ended. Sign in to get a new code.', 401)
  settle(await call<SessionReply>('/resend', { json: {}, bearer: p.token }))
}

export const forgotPassword = (email: string) => call<{ sent: boolean }>('/forgot', { json: { email } })
export const resetPassword = (p: { token: string; password: string } | { email: string; code: string; password: string }) => call<{ reset: boolean }>('/reset', { json: p })

/** Ends the login here and on the server. */
export async function signOut(): Promise<void> {
  const s = stored()
  setTokens(null)
  write('session', PENDING_KEY, null)
  if (s) await call('/logout', { json: { refresh_token: s.refresh } }).catch(() => undefined)
}

// ---------- tokens ----------

function expiresAt(jwt: string): number {
  try {
    const part = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return Number(JSON.parse(atob(part)).exp) * 1000
  } catch {
    return 0
  }
}

let refreshing: Promise<boolean> | null = null

/** Swaps the refresh token for a new pair. One call at a time, so parallel requests do not spend the same token twice. */
function refresh(): Promise<boolean> {
  if (!refreshing) {
    const s = stored()
    refreshing = (s
      ? call<SessionReply>('/refresh', { json: { refresh_token: s.refresh } }).then((r) => (r.status === 'signed_in' ? (setTokens(r), true) : false))
      : Promise.resolve(false)
    )
      .catch((e) => {
        // a rejected token means the login is over; a network failure just means try again later
        if (e instanceof AuthError && e.status === 401) setTokens(null)
        return false
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

/** A valid access token, refreshing it first when it is about to run out. Null when nobody is signed in. */
export async function accessToken(): Promise<string | null> {
  let s = stored()
  if (!s) return null
  if (expiresAt(s.access) - 30_000 < Date.now()) {
    if (!(await refresh())) return null
    s = stored()
  }
  return s?.access ?? null
}

/** Who is signed in, or null when nobody is. */
export async function currentUser(): Promise<Me | null> {
  const token = await accessToken()
  if (!token) return null
  try {
    return await call<Me>('/me', { bearer: token })
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) setTokens(null)
    return null
  }
}

/** Saves a new display name. */
export async function updateName(name: string): Promise<void> {
  const token = await accessToken()
  if (!token) throw new AuthError('auth_required', 'Sign in to continue.', 401)
  await call<{ name: string }>('/me', { method: 'PATCH', json: { name }, bearer: token })
  notifyAccountChanged()
}
