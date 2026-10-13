import { corsHeaders, fail, ok, withHeaders } from '../_shared/envelope.ts'
import { allowedOrigins } from '../_shared/env.ts'
import {
  getCheck, getDirectories, postContact, getReport, getRequests, patchCompetitors, patchProduct, postAdvance, postCheck, postRemoval, postRequest, postUnlock,
} from './handlers.ts'

type Handler = (req: Request, m: RegExpMatchArray) => Promise<Response>

const routes: { method: string; pattern: RegExp; handler: Handler }[] = [
  { method: 'GET', pattern: /^\/health$/, handler: async () => ok({ status: 'ok' }) },
  { method: 'POST', pattern: /^\/check$/, handler: (req) => postCheck(req) },
  { method: 'GET', pattern: /^\/check\/([^/]+)$/, handler: (_r, m) => getCheck(m[1]) },
  { method: 'POST', pattern: /^\/check\/([^/]+)\/advance$/, handler: (req, m) => postAdvance(req, m[1]) },
  { method: 'PATCH', pattern: /^\/check\/([^/]+)\/competitors$/, handler: (req, m) => patchCompetitors(req, m[1]) },
  { method: 'PATCH', pattern: /^\/check\/([^/]+)\/product$/, handler: (req, m) => patchProduct(req, m[1]) },
  { method: 'POST', pattern: /^\/unlock$/, handler: (req) => postUnlock(req) },
  { method: 'POST', pattern: /^\/contact$/, handler: (req) => postContact(req) },
  { method: 'POST', pattern: /^\/requests$/, handler: (req) => postRequest(req) },
  { method: 'GET', pattern: /^\/requests$/, handler: (req) => getRequests(req) },
  { method: 'GET', pattern: /^\/report\/([^/]+)$/, handler: (req, m) => getReport(req, m[1]) },
  { method: 'GET', pattern: /^\/directories$/, handler: () => getDirectories() },
  { method: 'POST', pattern: /^\/removal$/, handler: (req) => postRemoval(req) },
]

/** The function is served under /functions/v1/<name>/v1/..., or /<name>/v1/... locally. Route on what follows the API's own /v1. */
export function apiPath(pathname: string): string | null {
  const m = /\/v1(\/(?:health|check|unlock|report|directories|removal|requests|contact)(?:\/.*)?)$/.exec(pathname)
  return m ? m[1].replace(/\/$/, '') : null
}

export async function route(req: Request): Promise<Response> {
  const cors = corsHeaders(req.headers.get('origin'), allowedOrigins())
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  const path = apiPath(new URL(req.url).pathname)
  if (!path) return withHeaders(fail('not_found', 'Unknown endpoint.', { status: 404 }), cors)

  let pathMatched = false
  for (const r of routes) {
    const m = r.pattern.exec(path)
    if (!m) continue
    pathMatched = true
    if (r.method !== req.method) continue
    try {
      return withHeaders(await r.handler(req, m), cors)
    } catch (e) {
      console.error('unhandled', path, e instanceof Error ? e.stack ?? e.message : e)
      return withHeaders(fail('internal_error', 'Something went wrong on our side. Try again in a minute.', { status: 500 }), cors)
    }
  }
  return withHeaders(
    pathMatched ? fail('method_not_allowed', 'That method is not allowed here.', { status: 405 }) : fail('not_found', 'Unknown endpoint.', { status: 404 }),
    cors,
  )
}
