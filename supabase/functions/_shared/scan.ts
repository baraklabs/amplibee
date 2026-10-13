// Scan tasks. One task is one target (a domain) times one kind of measurement, so each invocation stays short.

import { brandSlug, hostOf } from './domain.ts'
import { parseHtml } from './html.ts'
import type { Fetcher } from './safe-fetch.ts'
import { SearchError, type SearchProvider } from './search.ts'
import { analyzeTechnical, unreachable } from './technical.ts'
import type { DirectoryRow, DirectoryStatus, MentionSet, SpeedResult, TargetScan, TechnicalResult } from './types.ts'

export type TaskKind =
  | 'technical' | 'speed' | 'rank' | 'hn' | 'github' | 'indexing' | 'web' | 'directories'
  | 'reddit' | 'linkedin' | 'x' | 'reviews'

export interface Task {
  domain: string
  kind: TaskKind
}

export const taskId = (t: Task) => `${t.domain}|${t.kind}`

export interface ScanDeps {
  fetcher: Fetcher
  search: SearchProvider | null
  fetchImpl: typeof fetch
  psiKey: string
  githubToken: string
  directories: DirectoryRow[]
  /** Reserve one search query. Returns false when the cap for this check is used up. */
  takeQuery(): Promise<boolean>
  lookupRank(domain: string): Promise<{ imported: boolean; rank: number | null }>
  log(level: 'info' | 'ok' | 'warn' | 'error', msg: string): void
}

export interface Outcome {
  data?: unknown
  skipped?: string
}

export function buildTasks(o: { domain: string | null; competitors: string[]; tier: 'free' | 'full' }): Task[] {
  const t: Task[] = []
  const add = (domain: string, kinds: TaskKind[]) => kinds.forEach((kind) => t.push({ domain, kind }))
  if (o.domain) add(o.domain, ['technical', 'speed', 'rank', 'hn', 'github', 'indexing', 'web', 'directories'])
  for (const c of o.competitors) add(c, ['technical', 'rank', 'hn', 'github'])
  if (o.tier === 'full') {
    if (o.domain) add(o.domain, ['reddit', 'linkedin', 'x', 'reviews'])
    for (const c of o.competitors) add(c, ['indexing', 'web'])
  }
  return t
}

export const TASK_LABEL: Record<TaskKind, string> = {
  technical: 'Reading homepage, sitemap.xml and robots.txt',
  speed: 'Running PageSpeed Insights (mobile)',
  rank: 'Looking up domain rank',
  hn: 'Searching Hacker News',
  github: 'Searching GitHub READMEs',
  indexing: 'Checking indexing with site: search',
  web: 'Searching the web for mentions',
  directories: 'Checking directory listings',
  reddit: 'Searching Reddit',
  linkedin: 'Searching LinkedIn through the search provider',
  x: 'Searching X through the search provider',
  reviews: 'Searching review sites',
}

const OWN = (domain: string) => (url: string) => {
  const h = hostOf(url)
  return !!h && (h === domain || h.endsWith('.' + domain))
}

export async function runTask(task: Task, deps: ScanDeps): Promise<Outcome> {
  const { domain } = task
  switch (task.kind) {
    case 'technical':
      return { data: await technicalTask(domain, deps) }
    case 'speed':
      return speedTask(domain, deps)
    case 'rank': {
      const r = await deps.lookupRank(domain)
      if (!r.imported) return { skipped: 'The domain rank service did not answer, so the rank could not be looked up.' }
      return { data: { rank: r.rank } }
    }
    case 'hn':
      return hnTask(domain, deps)
    case 'github':
      return githubTask(domain, deps)
    case 'indexing': {
      const res = await searchTask(deps, `site:${domain}`, (u) => OWN(domain)(u), 10)
      if ('skipped' in res) return res
      return { data: { count: res.data.count, provider: deps.search?.name ?? '', query: `site:${domain}` } }
    }
    case 'web': {
      // No quotes around the domain: Serper free accounts reject quoted (exact-match) queries with a 400.
      const q = `${domain} -site:${domain}`
      return searchTask(deps, q, (u) => !OWN(domain)(u), 10)
    }
    case 'reddit':
      return searchTask(deps, `${domain} site:reddit.com`, (u) => /(^|\.)reddit\.com$/.test(hostOf(u) ?? ''), 10)
    case 'linkedin':
      return searchTask(deps, `${domain} site:linkedin.com`, (u) => /(^|\.)linkedin\.com$/.test(hostOf(u) ?? ''), 10)
    case 'x':
      return searchTask(deps, `${domain} (site:x.com OR site:twitter.com)`, (u) => /^(x|twitter)\.com$/.test(hostOf(u) ?? ''), 10)
    case 'reviews':
      return searchTask(deps, `${domain} (site:g2.com OR site:trustpilot.com OR site:capterra.com OR site:producthunt.com)`, (u) => /^(g2|trustpilot|capterra|producthunt)\.com$/.test(hostOf(u) ?? ''), 10)
    case 'directories':
      return { data: await directoriesTask(domain, deps) }
    default:
      return { skipped: 'Unknown task.' }
  }
}

async function technicalTask(domain: string, d: ScanDeps): Promise<TechnicalResult> {
  const f = d.fetcher
  let home = await f.get(`https://${domain}/`)
  if (home.status === 0 && !home.blockedByRobots && ['network', 'timeout'].includes(home.error?.code ?? '')) {
    const alt = await f.get(`http://${domain}/`)
    if (alt.status) home = alt
  }
  if (home.blockedByRobots) return unreachable(home.url, 0, `robots.txt on ${domain} does not allow AmplibeeBot to read the homepage`)
  if (!home.status) return unreachable(home.url, 0, home.error?.message ?? 'no response')
  if (home.status >= 400) return unreachable(home.url, home.status, `the homepage answered with status ${home.status}`)

  const page = parseHtml(home.body, home.url)
  const origin = new URL(home.url).origin
  let ogUrl: string | null = null
  if (page.og['og:image']) {
    try {
      ogUrl = new URL(page.og['og:image'], home.url).toString()
    } catch {
      ogUrl = null
    }
  }
  const [sm, rb, about, og] = await Promise.all([
    f.get(`${origin}/sitemap.xml`, { ignoreRobots: true, maxBytes: 512 * 1024, accept: 'application/xml,text/xml,*/*;q=0.5' }),
    f.get(`${origin}/robots.txt`, { ignoreRobots: true, maxBytes: 512 * 1024, accept: 'text/plain,*/*;q=0.5' }),
    f.get(`${origin}/about`),
    ogUrl ? f.get(ogUrl, { readBody: false, accept: 'image/*,*/*;q=0.5' }) : Promise.resolve(null),
  ])

  let ogImage: { url: string; status: number } | null = null
  if (ogUrl && og && !og.blockedByRobots) {
    const isImage = !og.contentType || /^image\//i.test(og.contentType) || /octet-stream/i.test(og.contentType)
    ogImage = { url: ogUrl, status: og.status >= 200 && og.status < 300 && !isImage ? 415 : og.status }
  }
  const aboutOk = about.status === 200
  return analyzeTechnical({
    finalUrl: home.url,
    status: home.status,
    page,
    sitemap: { status: sm.status, valid: sm.status === 200 && /<urlset|<sitemapindex/i.test(sm.body) },
    robots: { status: rb.status, text: rb.status === 200 ? rb.body : null },
    ogImage,
    aboutLinks: aboutOk ? parseHtml(about.body, about.url).links : [],
    aboutFound: aboutOk || page.links.some((l) => /\/(about|team|company|our-story)(\/|$|\?)/i.test(new URL(l).pathname + '/')),
  })
}

async function speedTask(domain: string, d: ScanDeps): Promise<Outcome> {
  const url =
    'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=' +
    encodeURIComponent(`https://${domain}/`) +
    (d.psiKey ? `&key=${encodeURIComponent(d.psiKey)}` : '')
  let res: Response
  try {
    res = await d.fetchImpl(url, { signal: AbortSignal.timeout(60_000) })
  } catch {
    return { skipped: 'PageSpeed Insights did not answer in 60 seconds.' }
  }
  if (res.status === 429) return { skipped: 'PageSpeed Insights quota reached. Set PSI_API_KEY to raise it.' }
  if (!res.ok) return { skipped: `PageSpeed Insights answered with status ${res.status}.` }
  const j = (await res.json()) as {
    lighthouseResult?: { categories?: { performance?: { score?: number | null } }; audits?: Record<string, { numericValue?: number }> }
  }
  const lr = j.lighthouseResult
  const score = lr?.categories?.performance?.score
  if (typeof score !== 'number') return { skipped: 'PageSpeed Insights returned no performance score.' }
  const a = lr?.audits ?? {}
  const data: SpeedResult = {
    score: Math.round(score * 100),
    lcp_ms: a['largest-contentful-paint']?.numericValue ?? null,
    cls: a['cumulative-layout-shift']?.numericValue ?? null,
    tbt_ms: a['total-blocking-time']?.numericValue ?? null,
  }
  return { data }
}

async function hnTask(domain: string, d: ScanDeps): Promise<Outcome> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(domain)}&tags=story&restrictSearchableAttributes=url&hitsPerPage=3`
  try {
    const res = await d.fetchImpl(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return { skipped: `Hacker News search answered with status ${res.status}.` }
    const j = (await res.json()) as { nbHits?: number; hits?: { title?: string; objectID: string }[] }
    const data: MentionSet = {
      count: j.nbHits ?? 0,
      top: (j.hits ?? []).slice(0, 3).map((h) => ({ title: h.title ?? '(untitled)', url: `https://news.ycombinator.com/item?id=${h.objectID}` })),
      query: domain,
    }
    return { data }
  } catch {
    return { skipped: 'Hacker News search did not answer.' }
  }
}

async function githubTask(domain: string, d: ScanDeps): Promise<Outcome> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(`"${domain}" in:readme`)}&per_page=3`
  const headers: Record<string, string> = { accept: 'application/vnd.github+json', 'user-agent': 'AmplibeeBot/1.0' }
  if (d.githubToken) headers.authorization = `Bearer ${d.githubToken}`
  try {
    const res = await d.fetchImpl(url, { headers, signal: AbortSignal.timeout(10_000) })
    if (res.status === 403 || res.status === 429) return { skipped: 'GitHub rate limit reached. Set GITHUB_TOKEN to raise it.' }
    if (!res.ok) return { skipped: `GitHub search answered with status ${res.status}.` }
    const j = (await res.json()) as { total_count?: number; items?: { full_name: string; html_url: string }[] }
    const data: MentionSet = {
      count: j.total_count ?? 0,
      top: (j.items ?? []).slice(0, 3).map((i) => ({ title: i.full_name, url: i.html_url })),
      query: `"${domain}" in:readme`,
    }
    return { data }
  } catch {
    return { skipped: 'GitHub search did not answer.' }
  }
}

async function searchTask(
  d: ScanDeps,
  query: string,
  keep: (url: string) => boolean,
  n: number,
): Promise<{ data: MentionSet } | { skipped: string }> {
  if (!d.search) return { skipped: 'No search provider is configured.' }
  if (!(await d.takeQuery())) return { skipped: 'The search query cap for this check was reached.' }
  try {
    const hits = (await d.search.search(query, n)).filter((h) => keep(h.url))
    return {
      data: {
        count: hits.length,
        top: hits.slice(0, 3).map((h) => ({ title: h.title || h.url, url: h.url })),
        hosts: [...new Set(hits.map((h) => hostOf(h.url)).filter((x): x is string => !!x))],
        query,
      },
    }
  } catch (e) {
    return { skipped: e instanceof SearchError ? e.message : 'The search provider did not answer.' }
  }
}

async function directoriesTask(domain: string, d: ScanDeps): Promise<DirectoryStatus> {
  const brand = brandSlug(domain)
  const checkable = d.directories.filter((x) => x.check_method !== 'none')
  const listed: string[] = []
  const notFound: string[] = []
  const unknown: string[] = []
  await Promise.all(
    checkable.map(async (dir) => {
      if (dir.check_method !== 'slug_url' || !dir.check_url_template) return void unknown.push(dir.slug)
      const url = dir.check_url_template.replace('{slug}', brand).replace('{domain}', domain)
      const r = await d.fetcher.get(url)
      if (r.status === 200 && r.body.toLowerCase().includes(domain)) listed.push(dir.slug)
      else if (r.status === 200 || r.status === 404 || r.status === 410) notFound.push(dir.slug)
      else unknown.push(dir.slug)
    }),
  )
  return { listed: listed.sort(), not_found: notFound.sort(), unknown: unknown.sort(), checked: checkable.length }
}

/** Upgrade directory results with evidence from the other tasks (Hacker News count, search result hosts). */
export function finalizeDirectories(scan: TargetScan, dirs: DirectoryRow[]): DirectoryStatus | undefined {
  const base = scan.directories
  if (!base) return undefined
  const hosts = new Set<string>([...(scan.web?.hosts ?? []), ...(scan.reviews?.hosts ?? [])])
  const listed = new Set(base.listed)
  const notFound = new Set(base.not_found)
  const unknown = new Set<string>()
  for (const dir of dirs.filter((x) => x.check_method !== 'none')) {
    if (listed.has(dir.slug)) continue
    const dirHost = hostOf(dir.url)
    const hit =
      (dir.check_method === 'hn_api' && (scan.hn?.count ?? 0) > 0) ||
      (dir.check_method === 'search_hit' && !!dirHost && [...hosts].some((h) => h === dirHost || h.endsWith('.' + dirHost)))
    if (hit) {
      listed.add(dir.slug)
      notFound.delete(dir.slug)
    } else if (!notFound.has(dir.slug)) unknown.add(dir.slug)
  }
  return { listed: [...listed].sort(), not_found: [...notFound].sort(), unknown: [...unknown].sort(), checked: listed.size + notFound.size + unknown.size }
}
