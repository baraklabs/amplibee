// Outbound fetcher for user-supplied hosts: SSRF checks on every hop, 3 redirects at most,
// 8 s timeout, 2 MB body cap, robots.txt respected, clear User-Agent. It never throws.

import { assertSafeUrl, type Resolver, SsrfError } from './ssrf.ts'
import { isAllowed, parseRobots, type RobotsRule } from './robots.ts'

export const MAX_REDIRECTS = 3
export const TIMEOUT_MS = 8_000
export const MAX_BYTES = 2 * 1024 * 1024
export const BOT_TOKEN = 'AmplibeeBot'

export interface FetchOptions {
  method?: 'GET' | 'HEAD'
  maxBytes?: number
  timeoutMs?: number
  ignoreRobots?: boolean
  readBody?: boolean
  accept?: string
}

export interface FetchResult {
  ok: boolean
  status: number // 0 when no response was received
  url: string // final URL after redirects
  contentType: string
  body: string
  bytes: number
  truncated: boolean
  redirects: number
  blockedByRobots?: boolean
  error?: { code: string; message: string }
}

export interface FetcherDeps {
  resolve: Resolver
  fetchImpl?: typeof fetch
  siteUrl?: string
}

export interface Fetcher {
  get(url: string, opts?: FetchOptions): Promise<FetchResult>
  userAgent: string
}

function failure(url: string, code: string, message: string, extra: Partial<FetchResult> = {}): FetchResult {
  return { ok: false, status: 0, url, contentType: '', body: '', bytes: 0, truncated: false, redirects: 0, error: { code, message }, ...extra }
}

async function readCapped(res: Response, maxBytes: number): Promise<{ text: string; bytes: number; truncated: boolean }> {
  if (!res.body) return { text: '', bytes: 0, truncated: false }
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0
  let truncated = false
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (bytes + value.length > maxBytes) {
      chunks.push(value.slice(0, maxBytes - bytes))
      bytes = maxBytes
      truncated = true
      await reader.cancel().catch(() => {})
      break
    }
    chunks.push(value)
    bytes += value.length
  }
  const all = new Uint8Array(bytes)
  let o = 0
  for (const c of chunks) {
    all.set(c, o)
    o += c.length
  }
  return { text: new TextDecoder('utf-8', { fatal: false }).decode(all), bytes, truncated }
}

export function createFetcher(deps: FetcherDeps): Fetcher {
  const f = deps.fetchImpl ?? fetch
  const userAgent = `${BOT_TOKEN}/1.0 (visibility checker; +${deps.siteUrl ?? 'https://example.com'}/how-it-works)`
  const robotsCache = new Map<string, Promise<RobotsRule[] | 'deny'>>()

  async function robotsFor(origin: string): Promise<RobotsRule[] | 'deny'> {
    let p = robotsCache.get(origin)
    if (!p) {
      p = (async () => {
        const r = await get(`${origin}/robots.txt`, { ignoreRobots: true, maxBytes: 512 * 1024 })
        if (r.status === 200) return parseRobots(r.body, BOT_TOKEN)
        if (r.status >= 500) return 'deny' // RFC 9309: a server error means do not crawl
        return [] // missing or unreachable robots.txt: no restrictions
      })()
      robotsCache.set(origin, p)
    }
    return p
  }

  async function get(start: string, opts: FetchOptions = {}): Promise<FetchResult> {
    const method = opts.method ?? 'GET'
    const maxBytes = opts.maxBytes ?? MAX_BYTES
    const timeout = opts.timeoutMs ?? TIMEOUT_MS
    let current = start

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      let url: URL
      try {
        url = await assertSafeUrl(current, deps.resolve)
      } catch (e) {
        const err = e instanceof SsrfError ? e : new SsrfError('bad_url', 'Invalid address.')
        return failure(current, err.code, err.message, { redirects: hop })
      }

      if (!opts.ignoreRobots) {
        const rules = await robotsFor(url.origin)
        if (rules === 'deny' || !isAllowed(rules, url.pathname + url.search)) {
          return failure(url.toString(), 'robots_disallow', `robots.txt on ${url.hostname} does not allow ${BOT_TOKEN} to fetch this path.`, {
            blockedByRobots: true,
            redirects: hop,
          })
        }
      }

      let res: Response
      try {
        res = await f(url.toString(), {
          method,
          redirect: 'manual',
          headers: { 'user-agent': userAgent, accept: opts.accept ?? 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5' },
          signal: AbortSignal.timeout(timeout),
        })
      } catch (e) {
        const timedOut = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
        return failure(url.toString(), timedOut ? 'timeout' : 'network', timedOut ? `No response from ${url.hostname} within ${timeout / 1000} seconds.` : `Could not connect to ${url.hostname}.`, { redirects: hop })
      }

      const loc = res.headers.get('location')
      if (res.status >= 300 && res.status < 400 && loc) {
        await res.body?.cancel().catch(() => {})
        if (hop === MAX_REDIRECTS) return failure(url.toString(), 'too_many_redirects', `More than ${MAX_REDIRECTS} redirects.`, { redirects: hop })
        try {
          current = new URL(loc, url).toString()
        } catch {
          return failure(url.toString(), 'bad_redirect', 'The redirect target is not a valid URL.', { redirects: hop })
        }
        continue
      }

      const contentType = res.headers.get('content-type') ?? ''
      let body = ''
      let bytes = 0
      let truncated = false
      if (opts.readBody === false || method === 'HEAD') {
        await res.body?.cancel().catch(() => {})
      } else {
        try {
          ;({ text: body, bytes, truncated } = await readCapped(res, maxBytes))
        } catch {
          return failure(url.toString(), 'read_failed', `The connection to ${url.hostname} dropped while reading.`, { status: res.status, redirects: hop })
        }
      }
      return { ok: res.status >= 200 && res.status < 300, status: res.status, url: url.toString(), contentType, body, bytes, truncated, redirects: hop }
    }
    return failure(start, 'too_many_redirects', `More than ${MAX_REDIRECTS} redirects.`)
  }

  return { get, userAgent }
}
