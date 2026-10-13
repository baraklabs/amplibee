import { z } from 'zod'
import { dbUsers, verifyUser } from '../_shared/auth.ts'
import { getDb } from '../_shared/db.ts'
import { denoResolver } from '../_shared/dns.ts'
import { type EmailMessage, reportEmail, sendEmail } from '../_shared/email.ts'
import { fail, ok, type RateInfo } from '../_shared/envelope.ts'
import { env, flag, int, siteUrl } from '../_shared/env.ts'
import { InputError, normalizeDomain } from '../_shared/domain.ts'
import {
  advance, buildView, createCheck, gateReport, latestReport, loadCheck, loadDirectories, parseCompetitorList,
  type PipelineEnv, setCompetitors, unlockCheck,
} from '../_shared/pipeline.ts'
import { createFetcher } from '../_shared/safe-fetch.ts'
import { createSearchProvider } from '../_shared/search.ts'
import { assertSafeUrl, SsrfError } from '../_shared/ssrf.ts'
import { hashIp, signReportToken, verifyReportToken } from '../_shared/token.ts'
import { verifyTurnstile } from '../_shared/turnstile.ts'
import type { Report } from '../_shared/types.ts'
import { competitorsSchema, contactSchema, createCheckSchema, firstIssue, productSchema, removalSchema, requestSchema, unlockSchema, uuidSchema } from './schemas.ts'

const MAX_BODY = 16 * 1024

function pipelineEnv(): PipelineEnv {
  return {
    db: getDb(),
    fetcher: createFetcher({ resolve: denoResolver, siteUrl: siteUrl() }),
    resolve: denoResolver,
    search: createSearchProvider({ provider: env('SEARCH_PROVIDER', 'brave'), apiKey: env('SEARCH_API_KEY') }),
    fetchImpl: fetch,
    psiKey: env('PSI_API_KEY'),
    githubToken: env('GITHUB_TOKEN'),
    suggestEnabled: flag('FEATURE_COMPETITOR_SUGGEST', false),
  }
}

export function clientIp(req: Request): string {
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

export function secondsToUtcMidnight(): number {
  const n = new Date()
  const next = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1)
  return Math.max(1, Math.ceil((next - n.getTime()) / 1000))
}

export function rateInfo(limit: number, used: number): RateInfo {
  return { limit, remaining: limit - used, reset: Math.floor(Date.now() / 1000) + secondsToUtcMidnight() }
}

export async function body<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<{ data: z.infer<T> } | { error: Response }> {
  const raw = await req.text()
  if (raw.length > MAX_BODY) return { error: fail('too_large', 'The request body is too large.', { status: 413 }) }
  let json: unknown
  try {
    json = JSON.parse(raw || '{}')
  } catch {
    return { error: fail('invalid_json', 'The request body is not valid JSON.') }
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) return { error: fail('invalid_input', firstIssue(parsed.error), { status: 422 }) }
  return { data: parsed.data }
}

export async function hit(key: string): Promise<number> {
  const { data, error } = await getDb().rpc('rl_hit', { p_key: key })
  if (error) throw new Error(`rate limit: ${error.message}`)
  return Number(data)
}

async function turnstile(token: string, req: Request): Promise<Response | null> {
  const r = await verifyTurnstile(token, env('TURNSTILE_SECRET_KEY'), clientIp(req))
  if (r.ok) return null
  if (r.reason === 'not_configured') return fail('server_misconfigured', 'Bot protection is not configured on the server.', { status: 500 })
  return fail('bot_check_failed', 'The bot check did not pass. Reload the page and try again.', { status: 403 })
}

// ---------- POST /v1/check ----------

export async function postCheck(req: Request): Promise<Response> {
  const b = await body(req, createCheckSchema)
  if ('error' in b) return b.error
  const { domain: rawDomain, no_website, turnstile_token, client_id, utm } = b.data

  const bot = await turnstile(turnstile_token, req)
  if (bot) return bot

  // Two daily counters, each with the same limit: one per IP and one per browser (a random id the page keeps in
  // localStorage). The IP counter is the one that is hard to dodge; the browser one covers people sharing an IP.
  const limit = int('FREE_CHECKS_PER_IP_PER_DAY', 10)
  const salt = env('IP_HASH_SALT', 'amplibee')
  const ipHash = await hashIp(clientIp(req), salt)
  const ipUsed = await hit(`check:${ipHash}`)
  const browserUsed = client_id ? await hit(`check:browser:${await hashIp(client_id, salt)}`) : 0
  const used = Math.max(ipUsed, browserUsed)
  const rate = rateInfo(limit, used)
  if (used > limit) {
    return fail('rate_limited', 'Daily limit reached. Try again tomorrow.', {
      status: 429, rate, headers: { 'retry-after': String(secondsToUtcMidnight()) },
    })
  }
  const globalUsed = await hit('global:check')
  if (globalUsed > int('GLOBAL_DAILY_CAP', 500)) {
    return fail('capacity_reached', 'The service has reached its daily limit of free checks. Try again tomorrow.', {
      status: 503, rate, headers: { 'retry-after': String(secondsToUtcMidnight()) },
    })
  }

  let domain: string | null = null
  if (rawDomain) {
    try {
      domain = normalizeDomain(rawDomain)
      await assertSafeUrl(`https://${domain}/`, denoResolver)
    } catch (e) {
      if (e instanceof InputError) return fail(e.code, e.message, { status: 422, rate })
      if (e instanceof SsrfError) return fail('blocked_target', `We cannot check that address. ${e.message}`, { status: 422, rate })
      throw e
    }
  }

  const id = await createCheck(getDb(), {
    domain,
    mode: domain ? 'website' : 'no_website',
    input: no_website ?? {},
    ipHash,
    utm: utm ?? {},
  })
  return ok({ job_id: id, domain, mode: domain ? 'website' : 'no_website' }, { status: 201, rate })
}

// ---------- GET /v1/check/:id, POST /v1/check/:id/advance ----------

async function checkOr404(id: string) {
  if (!uuidSchema.safeParse(id).success) return null
  return await loadCheck(getDb(), id)
}

export async function getCheck(id: string): Promise<Response> {
  const check = await checkOr404(id)
  if (!check) return fail('not_found', 'That check does not exist or has expired.', { status: 404 })
  return ok(await buildView(getDb(), check))
}

export async function postAdvance(req: Request, id: string): Promise<Response> {
  const check = await checkOr404(id)
  if (!check) return fail('not_found', 'That check does not exist or has expired.', { status: 404 })
  const ipHash = await hashIp(clientIp(req), env('IP_HASH_SALT', 'amplibee'))
  const limit = int('ADVANCE_CALLS_PER_IP_PER_DAY', 1500)
  const used = await hit(`adv:${ipHash}`)
  if (used > limit) return fail('rate_limited', 'Too many requests today.', { status: 429, rate: rateInfo(limit, used) })
  const { busy } = await advance(pipelineEnv(), id)
  const fresh = (await loadCheck(getDb(), id)) ?? check
  return ok({ ...(await buildView(getDb(), fresh)), busy }, { rate: rateInfo(limit, used) })
}

// ---------- PATCH /v1/check/:id/competitors and /product ----------

export async function patchCompetitors(req: Request, id: string): Promise<Response> {
  const check = await checkOr404(id)
  if (!check) return fail('not_found', 'That check does not exist or has expired.', { status: 404 })
  const b = await body(req, competitorsSchema)
  if ('error' in b) return b.error
  try {
    const list = parseCompetitorList(b.data.competitors, check.domain)
    const e = pipelineEnv()
    await setCompetitors(e, check, list)
  } catch (err) {
    if (err instanceof InputError) return fail(err.code, err.message, { status: 422 })
    if (err instanceof SsrfError) return fail('blocked_target', `We cannot check that competitor. ${err.message}`, { status: 422 })
    throw err
  }
  const fresh = (await loadCheck(getDb(), id)) ?? check
  return ok(await buildView(getDb(), fresh))
}

export async function patchProduct(req: Request, id: string): Promise<Response> {
  const check = await checkOr404(id)
  if (!check) return fail('not_found', 'That check does not exist or has expired.', { status: 404 })
  const b = await body(req, productSchema)
  if ('error' in b) return b.error
  const product = { ...check.product, ...b.data, edited: true }
  const { error } = await getDb().from('checks').update({ product, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  const fresh = (await loadCheck(getDb(), id)) ?? check
  return ok(await buildView(getDb(), fresh))
}

// ---------- POST /v1/unlock ----------

export async function postUnlock(req: Request): Promise<Response> {
  const b = await body(req, unlockSchema)
  if ('error' in b) return b.error
  const { job_id } = b.data

  const user = await verifyUser(dbUsers(getDb()), req.headers.get('authorization'))
  if (!user) return fail('auth_required', 'Sign in to unlock the full report.', { status: 401 })

  const limit = int('UNLOCKS_PER_USER_PER_DAY', 20)
  const used = await hit(`unlock:${user.id}`)
  if (used > limit) return fail('rate_limited', 'Too many unlock requests today.', { status: 429, rate: rateInfo(limit, used) })

  const db = getDb()
  const check = await loadCheck(db, job_id)
  if (!check) return fail('not_found', 'That check does not exist or has expired.', { status: 404 })
  const scanDone = await db.from('check_steps').select('status').eq('check_id', job_id).eq('step', 3).maybeSingle()
  if ((scanDone.data as { status: string } | null)?.status !== 'done') {
    return fail('scan_not_finished', 'Wait for the scan to finish, then unlock the report.', { status: 409 })
  }

  // Creating the account is the consent to send this one report link to the account email.
  const ins = await db.from('leads').insert({ email: user.email, domain: check.domain, check_id: job_id, consent: true, utm: check.utm ?? {} })
  if (ins.error) throw new Error(ins.error.message)
  await unlockCheck(db, check)

  const token = await signReportToken(env('REPORT_TOKEN_SECRET'), job_id)
  const label = check.domain ?? 'your product'
  const link = check.domain ? `${siteUrl()}/report/${check.domain}?k=${token}` : `${siteUrl()}/check/${job_id}`
  const rep = await latestReport(db, job_id)
  const msg: EmailMessage = { to: user.email, ...reportEmail({ domain: label, score: rep?.payload.score ?? null, link }) }
  const sent = await sendEmail(msg)

  const fresh = (await loadCheck(db, job_id)) ?? check
  return ok({ report: gateReport(rep?.payload ?? null, 'full'), email_sent: sent.ok, report_url: link, deep_scan_pending: true, job: await buildView(db, fresh) })
}

// ---------- POST /v1/requests, GET /v1/requests?job_id= ----------

const REQUEST_LABEL: Record<string, string> = {
  directory_submission: 'Directory submission',
  track_competitors: 'Competitor tracking',
  launch_done_for_you: 'Launch done for you',
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function postContact(req: Request): Promise<Response> {
  const b = await body(req, contactSchema)
  if ('error' in b) return b.error
  const { name, email, company, topic, message, turnstile_token } = b.data

  const bot = await turnstile(turnstile_token, req)
  if (bot) return bot

  const limit = int('CONTACT_PER_IP_PER_DAY', 5)
  const ipHash = await hashIp(clientIp(req), env('IP_HASH_SALT', 'amplibee'))
  const used = await hit(`contact:${ipHash}`)
  if (used > limit) return fail('rate_limited', 'You have sent several messages today. Try again tomorrow, or email hello@amplibee.com.', { status: 429, rate: rateInfo(limit, used) })

  const ins = await getDb().from('contact_messages').insert({ name, email, company: company || null, topic, message }).select('id').single()
  if (ins.error) throw new Error(ins.error.message)

  // Tell the owner. The message is stored either way, so a failed send never fails the request.
  const notify = env('CONTACT_NOTIFY_EMAIL') || env('REQUESTS_NOTIFY_EMAIL') || 'hello@amplibee.com'
  await sendEmail({
    to: notify,
    subject: `Contact form: ${topic.replace(/_/g, ' ')} from ${name}`,
    text: `${name} <${email}>${company ? ` (${company})` : ''}
Topic: ${topic}

${message}`,
    html: `<p><b>${esc(name)}</b> &lt;${esc(email)}&gt;${company ? ` (${esc(company)})` : ''}<br>Topic: ${esc(topic)}</p><p>${esc(message).replace(/\n/g, '<br>')}</p>`,
  })
  return ok({ received: true }, { status: 201 })
}

export async function postRequest(req: Request): Promise<Response> {
  const b = await body(req, requestSchema)
  if ('error' in b) return b.error
  const { job_id, type, note } = b.data

  const db = getDb()
  const user = await verifyUser(dbUsers(db), req.headers.get('authorization'))
  if (!user) return fail('auth_required', 'Sign in to make a request.', { status: 401 })

  const limit = int('REQUESTS_PER_USER_PER_DAY', 20)
  const used = await hit(`request:${user.id}`)
  if (used > limit) return fail('rate_limited', 'Too many requests today.', { status: 429, rate: rateInfo(limit, used) })

  const check = await loadCheck(db, job_id)
  if (!check) return fail('not_found', 'That check does not exist or has expired.', { status: 404 })
  if (check.tier !== 'full') return fail('unlock_first', 'Unlock the full report before you make a request.', { status: 403 })

  const rep = await latestReport(db, job_id)
  const details: Record<string, unknown> = { note: note ?? null, product: check.product }
  if (type === 'track_competitors') details.competitors = check.competitors
  if (type === 'directory_submission') {
    details.directories = (rep?.payload.directories ?? []).filter((d) => d.status !== 'listed' && d.submit_url).map((d) => ({ slug: d.slug, name: d.name, submit_url: d.submit_url }))
  }
  if (type === 'launch_done_for_you') {
    details.gaps = (rep?.payload.gaps ?? []).slice(0, 10).map((g) => ({ id: g.id, severity: g.severity, impact: g.impact }))
    details.competitors = check.competitors
  }

  const ins = await db.from('service_requests').insert({ user_id: user.id, email: user.email, check_id: job_id, domain: check.domain, type, details }).select('id, type, status, created_at').single()
  if (ins.error) {
    if ((ins.error as { code?: string }).code === '23505') return ok({ already: true, type, status: 'new' })
    throw new Error(ins.error.message)
  }

  // Tell the owner, if an address is configured. Failure to send never fails the request.
  const notify = env('REQUESTS_NOTIFY_EMAIL')
  if (notify) {
    await sendEmail({
      to: notify,
      subject: `New request: ${REQUEST_LABEL[type]} for ${check.domain ?? 'a product without a website'}`,
      text: `${user.email} asked for "${REQUEST_LABEL[type]}" on ${check.domain ?? 'a no-website check'}.\n\nCheck id: ${job_id}\n${note ? `Note: ${note}\n` : ''}`,
      html: `<p>${user.email.replace(/</g, '&lt;')} asked for <b>${REQUEST_LABEL[type]}</b> on ${(check.domain ?? 'a no-website check').replace(/</g, '&lt;')}.</p><p>Check id: ${job_id}</p>`,
    })
  }
  return ok({ already: false, ...(ins.data as object) }, { status: 201 })
}

export async function getRequests(req: Request): Promise<Response> {
  const db = getDb()
  const user = await verifyUser(dbUsers(db), req.headers.get('authorization'))
  if (!user) return fail('auth_required', 'Sign in to see your requests.', { status: 401 })
  const jobId = new URL(req.url).searchParams.get('job_id') ?? ''
  if (!uuidSchema.safeParse(jobId).success) return fail('invalid_input', 'That job id is not valid.', { status: 422 })
  const { data, error } = await db.from('service_requests').select('type, status, created_at').eq('user_id', user.id).eq('check_id', jobId).order('created_at')
  if (error) throw new Error(error.message)
  return ok(data ?? [])
}

// ---------- GET /v1/report/:domain ----------

export async function getReport(req: Request, domainParam: string): Promise<Response> {
  let domain: string
  try {
    domain = normalizeDomain(decodeURIComponent(domainParam))
  } catch {
    return fail('invalid_domain', 'That is not a valid domain.', { status: 422 })
  }
  const db = getDb()
  const d = await db.from('domains').select('removed').eq('domain', domain).maybeSingle()
  if (!d.data || (d.data as { removed: boolean }).removed) return fail('not_found', 'No public report exists for that domain.', { status: 404 })

  const k = new URL(req.url).searchParams.get('k')
  const tokenCheckId = await verifyReportToken(env('REPORT_TOKEN_SECRET'), k)
  let checkId: string | null = null
  if (tokenCheckId) {
    const c = await loadCheck(db, tokenCheckId)
    if (c && c.domain === domain) checkId = c.id
  }
  if (!checkId) {
    const latest = await db.from('checks').select('id').eq('domain', domain).eq('status', 'done').order('created_at', { ascending: false }).limit(1).maybeSingle()
    checkId = (latest.data as { id: string } | null)?.id ?? null
  }
  if (!checkId) return fail('not_found', 'No finished report exists for that domain.', { status: 404 })
  const rep = await latestReport(db, checkId)
  if (!rep) return fail('not_found', 'No finished report exists for that domain.', { status: 404 })
  const r: Report = rep.payload

  if (tokenCheckId && checkId === tokenCheckId) {
    return ok({ access: 'full', report: gateReport(r, 'full') })
  }
  return ok({
    access: 'summary',
    report: { domain: r.domain, generated_at: r.generated_at, score: r.score, sub_scores: r.sub_scores, gap_total: r.gap_total, gaps: r.gaps.slice(0, 3) },
  }, { headers: { 'cache-control': 'public, max-age=300' } })
}

// ---------- GET /v1/directories ----------

export async function getDirectories(): Promise<Response> {
  const rows = await loadDirectories(getDb())
  return ok(
    rows.map((d) => ({ slug: d.slug, name: d.name, url: d.url, category: d.category, submit_url: d.submit_url, description: d.description, priority: d.priority, verified: d.verified })),
    { headers: { 'cache-control': 'public, max-age=3600' } },
  )
}

// ---------- POST /v1/removal ----------

export async function postRemoval(req: Request): Promise<Response> {
  const b = await body(req, removalSchema)
  if ('error' in b) return b.error
  const bot = await turnstile(b.data.turnstile_token, req)
  if (bot) return bot
  let domain: string
  try {
    domain = normalizeDomain(b.data.domain)
  } catch (e) {
    return fail('invalid_domain', e instanceof InputError ? e.message : 'That is not a valid domain.', { status: 422 })
  }
  const db = getDb()
  const ins = await db.from('removal_requests').insert({ domain, email: b.data.email ?? null, reason: b.data.reason ?? null })
  if (ins.error) throw new Error(ins.error.message)
  // Hide the public report right away. A person reviews the request afterwards.
  await db.from('domains').update({ removed: true }).eq('domain', domain)
  return ok({ domain, status: 'hidden' }, { status: 201 })
}
