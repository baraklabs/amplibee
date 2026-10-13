// The job pipeline. A check is six steps. Each call to advance() runs a short, idempotent slice of the
// first unfinished step (one scan task, one fetch round), so no single invocation nears a time limit.

import { InputError, normalizeDomain } from './domain.ts'
import { int } from './env.ts'
import { profileFor } from './profiles.ts'
import type { Db } from './db.ts'
import { llmEnabled, suggestCompetitors } from './llm.ts'
import { parseHtml } from './html.ts'
import { buildTasks, runTask, type Task, TASK_LABEL, taskId } from './scan.ts'
import { SCORING } from './scoring.config.ts'
import { assembleReport, planFor, rowOf } from './report.ts'
import type { Fetcher } from './safe-fetch.ts'
import type { SearchProvider } from './search.ts'
import { assertSafeUrl, type Resolver } from './ssrf.ts'
import type { DirectoryRow, LogLine, Report, TargetScan } from './types.ts'

export const STEPS = [
  { step: 1, key: 'research', title: 'Research your product' },
  { step: 2, key: 'competitors', title: 'Find competitors' },
  { step: 3, key: 'scan', title: 'Scan visibility' },
  { step: 4, key: 'score', title: 'Score and rank gaps' },
  { step: 5, key: 'plan', title: 'Plan fixes' },
  { step: 6, key: 'launch', title: 'Launch' },
] as const

export interface CheckRow {
  id: string
  domain: string | null
  mode: 'website' | 'no_website'
  input: { sells?: string; customer?: string; markets?: string }
  status: 'running' | 'awaiting_input' | 'done' | 'error'
  tier: 'free' | 'full'
  product: Product
  competitors: string[]
  competitors_confirmed: boolean
  scan: Record<string, TargetScan>
  query_count: number
  utm: Record<string, string>
  created_at: string
  unlocked_at: string | null
}

export interface Product {
  title?: string | null
  description?: string | null
  one_liner?: string | null
  headings?: { level: number; text: string }[]
  pages?: Record<string, { url: string; status: number; note?: string }>
  sells?: string
  customer?: string
  markets?: string
  edited?: boolean
}

export interface StepRow {
  id: string
  check_id: string
  step: number
  key: string
  status: 'pending' | 'running' | 'awaiting_input' | 'done' | 'error'
  state: Record<string, unknown>
  log: LogLine[]
  lease_until: string | null
}

export interface PipelineEnv {
  db: Db
  fetcher: Fetcher
  resolve: Resolver
  search: SearchProvider | null
  fetchImpl: typeof fetch
  psiKey: string
  githubToken: string
  suggestEnabled: boolean
}

const LEASE_MS = 90_000
const MAX_ATTEMPTS = 3
const MAX_LOG = 300

function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`)
  return res.data as T
}

class StepLog {
  lines: LogLine[]
  constructor(existing: LogLine[]) {
    this.lines = existing
  }
  add(level: LogLine['level'], msg: string) {
    this.lines.push({ t: new Date().toISOString(), level, msg })
    if (this.lines.length > MAX_LOG) this.lines.splice(0, this.lines.length - MAX_LOG)
  }
}

interface Ctx {
  env: PipelineEnv
  check: CheckRow
  step: StepRow
  log: StepLog
  patchCheck(patch: Record<string, unknown>): Promise<void>
}

type Outcome = 'done' | 'again' | 'awaiting'

const fmt = (n: number) => n.toLocaleString('en-US')

// ---------- creation ----------

export async function createCheck(
  db: Db,
  o: { domain: string | null; mode: 'website' | 'no_website'; input: Record<string, string>; ipHash: string; utm: Record<string, string>; competitors?: string[] },
): Promise<string> {
  let domainId: string | null = null
  if (o.domain) {
    const d = must(
      await db.from('domains').upsert({ domain: o.domain, last_checked_at: new Date().toISOString() }, { onConflict: 'domain' }).select('id').single(),
      'domains upsert',
    ) as { id: string }
    domainId = d.id
  }
  const row = must(
    await db
      .from('checks')
      .insert({ domain: o.domain, domain_id: domainId, mode: o.mode, input: o.input, ip_hash: o.ipHash, utm: o.utm, competitors: o.competitors ?? [] })
      .select('id')
      .single(),
    'check insert',
  ) as { id: string }
  must(await db.from('check_steps').insert(STEPS.map((s) => ({ check_id: row.id, step: s.step, key: s.key }))), 'steps insert')
  return row.id
}

export async function loadCheck(db: Db, id: string): Promise<CheckRow | null> {
  const { data } = await db.from('checks').select('*').eq('id', id).maybeSingle()
  return (data as CheckRow | null) ?? null
}

export async function loadSteps(db: Db, id: string): Promise<StepRow[]> {
  return must(await db.from('check_steps').select('*').eq('check_id', id).order('step'), 'steps load') as StepRow[]
}

export async function loadDirectories(db: Db): Promise<DirectoryRow[]> {
  const rows = must(await db.from('directories').select('*').order('priority'), 'directories load') as DirectoryRow[]
  return rows
}

export async function latestReport(db: Db, checkId: string): Promise<{ id: string; version: number; payload: Report } | null> {
  const { data } = await db.from('results').select('id, version, payload').eq('check_id', checkId).eq('kind', 'report').order('version', { ascending: false }).limit(1).maybeSingle()
  return (data as { id: string; version: number; payload: Report } | null) ?? null
}

// ---------- advancing ----------

export interface AdvanceResult {
  busy: boolean
}

export async function advance(env: PipelineEnv, id: string): Promise<AdvanceResult> {
  const { db } = env
  const check = await loadCheck(db, id)
  if (!check || check.status === 'done' || check.status === 'error') return { busy: false }
  const steps = await loadSteps(db, id)
  const step = steps.find((s) => s.status !== 'done')
  if (!step) {
    await db.from('checks').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', id)
    return { busy: false }
  }
  if (step.status === 'awaiting_input' || step.status === 'error') return { busy: false }

  const now = new Date()
  const claimed = await db
    .from('check_steps')
    .update({ status: 'running', lease_until: new Date(now.getTime() + LEASE_MS).toISOString(), started_at: step.status === 'pending' && !step.log.length ? now.toISOString() : undefined })
    .eq('id', step.id)
    .or(`status.eq.pending,and(status.eq.running,lease_until.lt.${now.toISOString()})`)
    .select('*')
    .maybeSingle()
  if (!claimed.data) return { busy: true }
  const row = claimed.data as StepRow

  const log = new StepLog(row.log ?? [])
  const ctx: Ctx = {
    env,
    check,
    step: row,
    log,
    async patchCheck(patch) {
      Object.assign(check, patch)
      must(await db.from('checks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id), 'check update')
    },
  }

  let outcome: Outcome
  try {
    outcome = await HANDLERS[row.key as keyof typeof HANDLERS](ctx)
  } catch (e) {
    const attempts = Number(row.state.attempts ?? 0) + 1
    const msg = e instanceof Error ? e.message : String(e)
    log.add('error', `Step failed (attempt ${attempts} of ${MAX_ATTEMPTS}): ${msg}`)
    const dead = attempts >= MAX_ATTEMPTS
    await db.from('check_steps').update({ status: dead ? 'error' : 'pending', lease_until: null, log: log.lines, state: { ...row.state, attempts } }).eq('id', row.id)
    if (dead) await db.from('checks').update({ status: 'error', updated_at: new Date().toISOString() }).eq('id', id)
    return { busy: false }
  }

  const status = outcome === 'done' ? 'done' : outcome === 'awaiting' ? 'awaiting_input' : 'pending'
  must(
    await db.from('check_steps').update({ status, lease_until: null, log: log.lines, state: { ...row.state, ...(ctx.step.state ?? {}), attempts: 0 }, finished_at: status === 'done' ? new Date().toISOString() : null }).eq('id', row.id),
    'step update',
  )
  const checkStatus = outcome === 'awaiting' ? 'awaiting_input' : status === 'done' && row.step === 6 ? 'done' : 'running'
  await db.from('checks').update({ status: checkStatus, updated_at: new Date().toISOString() }).eq('id', id)
  return { busy: false }
}

// ---------- step 1: research ----------

async function research(c: Ctx): Promise<Outcome> {
  const { check, log } = c
  if (check.mode === 'no_website') {
    const i = check.input
    await c.patchCheck({ product: { sells: i.sells, customer: i.customer, markets: i.markets, one_liner: i.customer ? `${i.sells} for ${i.customer}` : i.sells, edited: false } })
    log.add('ok', [`Sells: ${i.sells}.`, i.customer ? `Customer: ${i.customer}.` : '', i.markets ? `Markets: ${i.markets}.` : ''].filter(Boolean).join(' '))
    return 'done'
  }
  if (check.product.edited) {
    log.add('info', 'Keeping the product details you edited.')
    return 'done'
  }
  const domain = check.domain as string
  const prof = profileFor(domain)
  const f = c.env.fetcher
  log.add('info', `Fetching https://${domain}/, /pricing and /about`)
  const paths = ['/', '/pricing', '/about']
  const results = await Promise.all(paths.map((p) => f.get(`https://${domain}${p}`)))
  const pages: NonNullable<Product['pages']> = {}
  const names = ['home', 'pricing', 'about']
  results.forEach((r, i) => {
    const url = `https://${domain}${paths[i]}`
    if (r.blockedByRobots) {
      pages[names[i]] = { url, status: 0, note: 'blocked by robots.txt' }
      log.add('warn', `${url} skipped: robots.txt does not allow AmplibeeBot.`)
    } else if (!r.status) {
      pages[names[i]] = { url, status: 0, note: r.error?.message }
      log.add(i === 0 ? 'error' : 'warn', `${url} failed: ${r.error?.message ?? 'no response'}`)
    } else if (!r.ok) {
      pages[names[i]] = { url: r.url, status: r.status }
      log.add(i === 0 ? 'error' : 'info', `${url} returned status ${r.status}${i === 0 ? '' : ', skipping'}`)
    } else {
      pages[names[i]] = { url: r.url, status: r.status }
      log.add('ok', `Fetched ${r.url} (${r.status}, ${(r.bytes / 1024).toFixed(0)} KB${r.truncated ? ', cut at 2 MB' : ''})`)
    }
  })
  const home = results[0]
  if (!home.ok) {
    await c.patchCheck({ product: { pages, edited: false, ...(prof ? { title: prof.title, description: prof.description, one_liner: prof.one_liner, headings: prof.headings.map((text) => ({ level: 2, text })) } : {}) } })
    if (prof) log.add('ok', `Title: "${prof.title}"`)
    log.add('warn', 'The homepage did not load, so there is nothing to extract. You can type the details yourself.')
    return 'done'
  }
  const p = parseHtml(home.body, home.url)
  const extra = results.slice(1).filter((r) => r.ok).map((r) => parseHtml(r.body, r.url))
  const headings = [...p.headings, ...extra.flatMap((e) => e.headings.slice(0, 4))].filter((h) => h.level <= 2 && h.text).slice(0, 8)
  const oneLiner = (p.metaDescription || p.og['og:description'] || p.firstParagraph || '').slice(0, 200)
  // Our own sites: fill only what the page itself did not give.
  const title = p.title || prof?.title || null
  const metaDescription = p.metaDescription || prof?.description || null
  const lead = oneLiner || prof?.one_liner || ''
  const outline = headings.length ? headings : (prof?.headings ?? []).map((text) => ({ level: 2, text }))
  await c.patchCheck({ product: { title, description: metaDescription, one_liner: lead, headings: outline, pages, edited: false } })
  log.add('ok', title ? `Title: "${title}"` : 'No title tag found.')
  log.add(p.metaDescription ? 'ok' : 'warn', p.metaDescription ? `Meta description: ${p.metaDescription.length} characters` : 'No meta description found.')
  log.add('info', `${headings.length} headings read. One-liner taken from the ${p.metaDescription ? 'meta description' : p.og['og:description'] ? 'og:description' : p.firstParagraph ? 'first paragraph' : 'page (none found)'}.`)
  return 'done'
}

// ---------- step 2: competitors ----------

/** What the product is, as a short search phrase, taken from what it sells or its description. Null when there is too little to go on. */
export function categoryPhrase(p: { sells?: string | null; title?: string | null; description?: string | null; one_liner?: string | null }): string | null {
  let s = productText(p).split(/(?<=[.!?])\s/)[0]
  // "Cap is the free, open-source screen recorder" -> "free, open-source screen recorder": drop the brand and the verb.
  const m = s.match(/^[^,.]{1,40}? (?:is|are|helps|lets|makes|turns) (?:the |a |an )?(.+)$/i)
  if (m && m[1].trim().split(' ').length >= 2) s = m[1]
  s = s.replace(/^(\S+),\s+/, '$1 ') // keep a leading adjective: "free, open-source ..." -> "free open-source ..."
  const head = s.split(/[,;:.|–—]| - | with | that | which | so | and /i)[0].trim().replace(/\s+tools?$/i, '')
  const words = head.split(' ').filter(Boolean).slice(0, 8)
  return words.length >= 2 ? words.join(' ') : null
}

function productText(p: { sells?: string | null; title?: string | null; description?: string | null; one_liner?: string | null }): string {
  return (p.sells || p.description || p.one_liner || p.title || '').replace(/\s+/g, ' ').trim()
}

/** Searches that find a new product's competitors: a named "alternative to X" first, then the product category. */
export function categoryQueries(p: { sells?: string | null; title?: string | null; description?: string | null; one_liner?: string | null }): string[] {
  const out: string[] = []
  const named = productText(p).match(/alternatives? to ([A-Z][A-Za-z0-9.-]+)/)
  if (named) out.push(`${named[1].replace(/[.,]+$/, '')} alternatives`)
  const phrase = categoryPhrase(p)
  if (phrase && !/alternative/i.test(phrase)) out.push(`best ${phrase} tools`)
  return out
}

async function competitors(c: Ctx): Promise<Outcome> {
  const { check, log, step } = c
  if (check.competitors_confirmed) {
    log.add('ok', check.competitors.length ? `Competitors: ${check.competitors.join(', ')}` : 'No competitors entered. The comparison will be skipped.')
    return 'done'
  }
  // Automatic: no confirmation screen. Find likely competitors, log what was found, save them and move on.
  // The first three are scanned. Up to seven more are kept as extras, shown blurred until the report is unlocked.
  const found: string[] = []
  const extra: string[] = []
  const add = async (raw: string, trusted = false) => {
    if (found.length >= 3 && extra.length >= 7) return
    try {
      const n = normalizeDomain(raw)
      if (n === check.domain || found.includes(n) || extra.includes(n) || NOT_COMPETITORS.some((x) => n === x || n.endsWith(`.${x}`))) return
      if (!trusted) await assertSafeUrl(`https://${n}/`, c.env.resolve)
      if (found.length < 3) found.push(n)
      else extra.push(n)
    } catch {
      // skip invalid or unsafe candidates
    }
  }
  const prof = profileFor(check.domain)
  if (prof) for (const d of prof.competitors) await add(d, true)
  if (c.env.search && !found.length) {
    // A brand nobody has written about yet has no "alternatives to X" pages, so search by what the product does first
    // and fall back to the brand name. At most two queries per check; they are not counted against the scan's budget.
    const queries: string[] = categoryQueries(check.product)
    if (check.domain) queries.push(`alternatives to ${check.domain.replace(/\.[a-z]{2,}$/, '')}`)
    queries.splice(2)
    if (!queries.length) log.add('warn', 'There is not enough product detail to build a search. Add what you sell and try again.')
    for (const query of queries) {
      if (found.length >= 3 && extra.length >= 7) break
      log.add('info', `Searching "${query}"`)
      try {
        const hits = await c.env.search.search(query, 20)
        const counts = new Map<string, number>()
        for (const h of hits) {
          try {
            const u = new URL(h.url)
            // A site's own pages beat deep article URLs, which are usually listicles about many products.
            const weight = u.pathname.split('/').filter(Boolean).length <= 1 ? 2 : 1
            const host = normalizeDomain(u.hostname)
            counts.set(host, (counts.get(host) ?? 0) + weight)
          } catch {
            // ignore unparseable URLs
          }
        }
        for (const [host] of [...counts.entries()].sort((x, y) => y[1] - x[1])) await add(host)
      } catch (e) {
        log.add('warn', `Competitor search failed: ${e instanceof Error ? e.message : 'unknown error'}`)
      }
    }
  }
  if (!found.length && llmEnabled()) {
    try {
      const summary = [check.product.title, check.product.one_liner, check.product.sells].filter(Boolean).join('. ')
      for (const d of await suggestCompetitors({ domain: check.domain, summary })) await add(d)
    } catch (e) {
      log.add('warn', `Competitor suggestion failed: ${e instanceof Error ? e.message : 'unknown error'}`)
    }
  }
  // Competitors are required and never asked from the user: if every source came back empty, fail the step so it retries.
  if (!found.length) throw new Error(c.env.search || llmEnabled() ? 'No competitors could be found automatically.' : 'Competitor discovery is not configured. Set SEARCH_API_KEY (or ENABLE_LLM and ANTHROPIC_API_KEY).')
  c.step.state = { ...c.step.state, suggestions: extra }
  await c.patchCheck({ competitors: found, competitors_confirmed: true })
  log.add('ok', `Competitors found: ${found.join(', ')}${extra.length ? ` (and ${extra.length} more)` : ''}`)
  return 'done'
}

// Directories, review sites and platforms that show up in "alternatives" searches but are not competitors.
const NOT_COMPETITORS = [
  'g2.com', 'capterra.com', 'getapp.com', 'softwareadvice.com', 'trustpilot.com', 'producthunt.com', 'alternativeto.net',
  'reddit.com', 'quora.com', 'wikipedia.org', 'youtube.com', 'linkedin.com', 'facebook.com', 'instagram.com', 'x.com',
  'twitter.com', 'medium.com', 'github.com', 'forbes.com', 'techcrunch.com', 'crunchbase.com', 'pcmag.com', 'zapier.com', 'google.com',
]

export function parseCompetitorList(input: unknown, self: string | null): string[] {
  if (!Array.isArray(input)) throw new InputError('invalid_competitors', 'Competitors must be a list of domains.')
  if (input.length > 3) throw new InputError('too_many_competitors', 'Too many competitors. Remove some and try again.')
  const out: string[] = []
  for (const raw of input) {
    const d = normalizeDomain(raw)
    if (d !== self && !out.includes(d)) out.push(d)
  }
  return out
}

export async function setCompetitors(env: PipelineEnv, check: CheckRow, list: string[]): Promise<void> {
  for (const d of list) await assertSafeUrl(`https://${d}/`, env.resolve)
  const { db } = env
  const added = list.filter((d) => !check.competitors.includes(d))
  must(await db.from('checks').update({ competitors: list, competitors_confirmed: true, status: 'running', updated_at: new Date().toISOString() }).eq('id', check.id), 'competitors update')
  await db.from('check_steps').update({ status: 'pending' }).eq('check_id', check.id).eq('step', 2).eq('status', 'awaiting_input')
  // New competitors after the scan has run: reopen scan, score, plan and launch so the new tasks run.
  if (added.length && check.competitors_confirmed) {
    await db.from('check_steps').update({ status: 'pending', finished_at: null, lease_until: null }).eq('check_id', check.id).gte('step', 3).eq('status', 'done')
  }
}

// ---------- step 3: scan ----------

async function getCached(db: Db, domain: string, kind: string): Promise<{ payload: unknown; created_at: string } | null> {
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString()
  const { data } = await db
    .from('results')
    .select('payload, created_at')
    .eq('domain', domain)
    .eq('kind', `scan:${kind}`)
    .eq('version', SCORING.dataVersion)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as { payload: unknown; created_at: string } | null) ?? null
}

export function describeOutcome(task: Task, data: unknown): { level: LogLine['level']; msg: string } {
  const d = task.domain
  const m = data as Record<string, any> // deno-lint-ignore no-explicit-any
  switch (task.kind) {
    case 'technical': {
      if (!m.reachable) return { level: 'error', msg: `${d}: could not read the homepage (${m.error ?? 'no response'}).` }
      const failed = (m.checks as { id: string; pass: boolean }[]).filter((x) => !x.pass).map((x) => x.id)
      return { level: failed.length ? 'warn' : 'ok', msg: `${d}: ${m.passed} of ${m.total} technical checks passed${failed.length ? `. Failed: ${failed.join(', ')}` : ''}.` }
    }
    case 'speed':
      return { level: m.score >= 90 ? 'ok' : 'warn', msg: `${d}: mobile performance score ${m.score} of 100${m.lcp_ms ? `, largest content at ${(m.lcp_ms / 1000).toFixed(1)} s` : ''}.` }
    case 'rank':
      return m.rank === null ? { level: 'info', msg: `${d}: not in the top 100,000 sites.` } : { level: 'ok', msg: `${d}: domain rank ${fmt(m.rank)}.` }
    case 'hn':
      return { level: 'info', msg: `${d}: ${fmt(m.count)} Hacker News ${m.count === 1 ? 'story links' : 'stories link'} to the domain.` }
    case 'github':
      return { level: 'info', msg: `${d}: ${fmt(m.count)} public GitHub ${m.count === 1 ? 'repository mentions' : 'repositories mention'} the domain in a README.` }
    case 'indexing':
      return { level: m.count ? 'ok' : 'warn', msg: `site:${d} returned ${m.count} ${m.count === 1 ? 'result' : 'results'} (reads up to 10).` }
    case 'directories':
      return { level: 'info', msg: `${d}: ${m.listed.length} confirmed, ${m.not_found.length} not found, ${m.unknown.length} could not be checked yet.` }
    default:
      return { level: 'info', msg: `${d}: ${m.count} ${task.kind === 'web' ? 'pages outside the site mention' : `${TASK_LABEL[task.kind].replace('Searching ', '').replace(' through the search provider', '')} results mention`} the domain.` }
  }
}

async function scan(c: Ctx): Promise<Outcome> {
  const { check, log, step, env } = c
  const tasks = buildTasks({ domain: check.domain, competitors: check.competitors, tier: check.tier })
  const done = new Set<string>((step.state.done as string[] | undefined) ?? [])
  const next = tasks.find((t) => !done.has(taskId(t)))
  if (!next) {
    log.add('ok', `Scan finished: ${tasks.length} measurements, ${check.query_count} of ${SCORING.queryCaps[check.tier]} search queries used.`)
    return 'done'
  }
  if (done.size === 0) log.add('info', `Scan plan: ${tasks.length} measurements across ${new Set(tasks.map((t) => t.domain)).size} domains. Search query cap for this check is ${SCORING.queryCaps[check.tier]}.`)
  log.add('info', `${next.domain}: ${TASK_LABEL[next.kind]}`)

  const cap = SCORING.queryCaps[check.tier]
  let outcome: { data?: unknown; skipped?: string }
  const cached = next.kind === 'directories' ? null : await getCached(env.db, next.domain, next.kind)
  if (cached) {
    outcome = { data: cached.payload }
    log.add('info', `${next.domain}: using the stored result from ${cached.created_at.slice(0, 10)} (results are kept 7 days).`)
  } else {
    const directories = next.kind === 'directories' ? await loadDirectories(env.db) : []
    try {
      outcome = await runTask(next, {
        fetcher: env.fetcher,
        search: env.search,
        fetchImpl: env.fetchImpl,
        psiKey: env.psiKey,
        githubToken: env.githubToken,
        directories,
        async takeQuery() {
          if (check.query_count >= cap) return false
          await c.patchCheck({ query_count: check.query_count + 1 })
          return true
        },
        // Live lookup against the Tranco API, so no list has to be downloaded. An empty answer means the site is
        // not on the list; a rank beyond the top 100,000 counts as not ranked, as before.
        async lookupRank(domain) {
          try {
            const res = await fetch(`https://tranco-list.eu/api/ranks/domain/${encodeURIComponent(domain)}`, { signal: AbortSignal.timeout(8_000) })
            if (!res.ok) return { imported: false, rank: null }
            const j = (await res.json()) as { ranks?: { rank: number }[] }
            const latest = j.ranks?.[0]?.rank
            return { imported: true, rank: latest !== undefined && latest <= int('TRANCO_TOP_N', 100_000) ? latest : null }
          } catch {
            return { imported: false, rank: null }
          }
        },
        log: (level, msg) => log.add(level, msg),
      })
    } catch (e) {
      outcome = { skipped: `Check failed: ${e instanceof Error ? e.message : 'unknown error'}` }
    }
    if (outcome.data !== undefined && next.kind !== 'directories') {
      await env.db.from('results').insert({ check_id: check.id, domain: next.domain, kind: `scan:${next.kind}`, version: SCORING.dataVersion, payload: outcome.data })
    }
  }

  const scans = { ...check.scan }
  const entry: TargetScan = { ...(scans[next.domain] ?? { domain: next.domain }) }
  if (outcome.data !== undefined) {
    ;(entry as unknown as Record<string, unknown>)[next.kind] = outcome.data
    const l = describeOutcome(next, outcome.data)
    log.add(l.level, l.msg)
  } else {
    entry.skipped = { ...(entry.skipped ?? {}), [next.kind]: outcome.skipped ?? 'skipped' }
    log.add('warn', `${next.domain}: ${next.kind} skipped. ${outcome.skipped}`)
  }
  scans[next.domain] = entry
  await c.patchCheck({ scan: scans })

  done.add(taskId(next))
  step.state = { ...step.state, done: [...done], total: tasks.length }
  if (done.size >= tasks.length) {
    log.add('ok', `Scan finished: ${tasks.length} measurements, ${check.query_count} of ${cap} search queries used.`)
    return 'done'
  }
  return 'again'
}

// ---------- step 4: score ----------

async function score(c: Ctx): Promise<Outcome> {
  const { check, log, env } = c
  const dirs = await loadDirectories(env.db)
  const prior = await latestReport(env.db, check.id)
  const report = assembleReport({
    mode: check.mode, domain: check.domain, input: check.input, scan: check.scan, competitors: check.competitors,
    directories: dirs, oneLiner: check.product.one_liner ?? '', tier: check.tier, queryCount: check.query_count, version: (prior?.version ?? 0) + 1,
  })
  must(await env.db.from('results').insert({ check_id: check.id, domain: check.domain, kind: 'report', version: report.version, payload: report }), 'report insert')

  const { score: total, sub_scores: sub, gaps } = report
  if (check.mode === 'website') {
    log.add('ok', total === null ? 'Nothing could be measured, so no score was produced.' : `Score ${total} of 100. Discoverability ${sub.discoverability ?? 'n/a'}, buzz ${sub.buzz ?? 'n/a'}, trust ${sub.trust ?? 'n/a'}, technical ${sub.technical ?? 'n/a'}.`)
    const top = gaps[0]
    log.add('info', `${gaps.length} gaps ranked by severity and estimated points.${top ? ` Largest: ${top.id} (${top.severity}, about ${top.impact} points).` : ''}`)
    if (check.tier === 'free') log.add('info', 'The score and top 3 gaps are free. Sign in to see all gaps, the competitor comparison and the fix plan.')
  } else {
    log.add('ok', `Reduced check for a product without a website: ${report.directories.length} directories to plan, ${report.competitors.length} competitors scanned.`)
  }
  return 'done'
}

// ---------- step 5: plan ----------

async function plan(c: Ctx): Promise<Outcome> {
  const { check, log, env } = c
  const rep = await latestReport(env.db, check.id)
  if (!rep) throw new Error('No report to plan from.')
  const report = rep.payload
  const items = planFor(report)
  report.plan = items
  must(await env.db.from('results').update({ payload: report }).eq('id', rep.id), 'plan update')
  const by = (t: string) => items.filter((i) => i.fix_type === t).length
  log.add('ok', `Mapped ${report.gaps.length} gaps to actions: ${by('free_guide')} guides, ${by('directory_submission')} directory submissions, ${by('content')} content tasks, ${by('review_collection')} review tasks, ${by('oyekool_campaign')} campaigns.`)
  return 'done'
}

// ---------- step 6: launch ----------

async function launch(c: Ctx): Promise<Outcome> {
  const { check, log, env } = c
  const rep = await latestReport(env.db, check.id)
  const n = rep ? rep.payload.plan.filter((p) => p.oyekool).length : 0
  if (n) log.add('ok', `${n} launch plan ${n === 1 ? 'item' : 'items'} ready for your app.`)
  log.add('ok', 'Check complete.')
  return 'done'
}

const HANDLERS = { research, competitors, scan, score, plan, launch }

// ---------- unlock ----------

export async function unlockCheck(db: Db, check: CheckRow): Promise<void> {
  if (check.tier === 'full') return
  const now = new Date().toISOString()
  must(await db.from('checks').update({ tier: 'full', unlocked_at: now, status: 'running', updated_at: now }).eq('id', check.id), 'unlock')
  // Reopen scan (new deep tasks), score, plan and launch. Logs and finished scan tasks are kept.
  await db.from('check_steps').update({ status: 'pending', finished_at: null, lease_until: null }).eq('check_id', check.id).gte('step', 3).eq('status', 'done')
}

// ---------- views ----------

export function gateReport(report: Report | null, tier: 'free' | 'full'): Report | null {
  if (!report) return null
  if (tier === 'full') return { ...report, locked: false }
  if (report.mode === 'no_website') {
    return { ...report, locked: true, plan: report.plan.slice(0, 3), directories: report.directories.slice(0, 3), checklist: report.checklist.slice(0, 3), competitors: [] }
  }
  return { ...report, locked: true, gaps: report.gaps.slice(0, 3), plan: [], directories: [], competitors: [], checklist: [] }
}

export async function buildView(db: Db, check: CheckRow) {
  const steps = await loadSteps(db, check.id)
  const rep = await latestReport(db, check.id)
  const selfScan = check.domain ? check.scan[check.domain] : undefined
  const suggestions = (steps.find((s) => s.step === 2)?.state.suggestions as string[] | undefined) ?? []
  return {
    id: check.id,
    mode: check.mode,
    domain: check.domain,
    status: check.status,
    tier: check.tier,
    unlocked: check.tier === 'full',
    product: check.product,
    competitors: check.competitors,
    // The extra names are only sent once unlocked. Before that the page gets the count and shows blurred placeholders.
    competitor_suggestions: check.tier === 'full' ? suggestions : [],
    competitor_more: suggestions.length,
    query_count: check.query_count,
    query_cap: SCORING.queryCaps[check.tier],
    steps: STEPS.map((def) => {
      const s = steps.find((x) => x.step === def.step)
      return { step: def.step, key: def.key, title: def.title, status: s?.status ?? 'pending', log: s?.log ?? [] }
    }),
    partial: check.domain ? { self: rowOf(selfScan, check.domain) } : null,
    report: gateReport(rep?.payload ?? null, check.tier),
  }
}
