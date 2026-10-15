// JSON envelope: { ok, data, error: { code, message } } on every response.

export interface Envelope<T = unknown> {
  ok: boolean
  data: T | null
  error: { code: string; message: string } | null
}

export interface RateInfo {
  limit: number
  remaining: number
  reset: number // unix seconds
}

export function rateHeaders(r?: RateInfo): Record<string, string> {
  if (!r) return {}
  return {
    'x-ratelimit-limit': String(r.limit),
    'x-ratelimit-remaining': String(Math.max(0, r.remaining)),
    'x-ratelimit-reset': String(r.reset),
  }
}

export function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> {
  const h: Record<string, string> = { vary: 'origin' }
  if (origin && allowed.includes(origin)) {
    h['access-control-allow-origin'] = origin
    h['access-control-allow-methods'] = 'GET,POST,PATCH,PUT,OPTIONS'
    h['access-control-allow-headers'] = 'content-type,authorization'
    h['access-control-expose-headers'] = 'x-ratelimit-limit,x-ratelimit-remaining,x-ratelimit-reset,retry-after'
    h['access-control-max-age'] = '600'
  }
  return h
}

export function ok<T>(data: T, init: { status?: number; headers?: Record<string, string>; rate?: RateInfo } = {}): Response {
  const body: Envelope<T> = { ok: true, data, error: null }
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...rateHeaders(init.rate), ...init.headers },
  })
}

export function fail(code: string, message: string, init: { status?: number; headers?: Record<string, string>; rate?: RateInfo } = {}): Response {
  const body: Envelope<never> = { ok: false, data: null, error: { code, message } }
  return new Response(JSON.stringify(body), {
    status: init.status ?? 400,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...rateHeaders(init.rate), ...init.headers },
  })
}

/** Add CORS headers to an already built response. */
export function withHeaders(res: Response, extra: Record<string, string>): Response {
  const h = new Headers(res.headers)
  for (const [k, v] of Object.entries(extra)) h.set(k, v)
  return new Response(res.body, { status: res.status, headers: h })
}
