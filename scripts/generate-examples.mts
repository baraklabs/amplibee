// Runs the real free-tier checks on a few well-known public domains and stores a compact result for each,
// for the example cards on the home page. Nothing here is invented: every number comes from a live request.
//
//   npx tsx scripts/generate-examples.mts linear.app plausible.io resend.com posthog.com

import dns from 'node:dns/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { normalizeDomain } from '../supabase/functions/_shared/domain.ts'
import { assembleReport } from '../supabase/functions/_shared/report.ts'
import { createFetcher } from '../supabase/functions/_shared/safe-fetch.ts'
import { buildTasks, runTask } from '../supabase/functions/_shared/scan.ts'
import { createSearchProvider } from '../supabase/functions/_shared/search.ts'
import type { DirectoryRow, TargetScan } from '../supabase/functions/_shared/types.ts'

const domains = process.argv.slice(2).map(normalizeDomain)
if (!domains.length) throw new Error('Pass at least one domain.')

const resolve = async (h: string) => (await dns.lookup(h, { all: true })).map((r) => r.address)
const dirs = JSON.parse(await readFile(new URL('../supabase/seed/directories.json', import.meta.url), 'utf8')) as DirectoryRow[]
const csv = await (await fetch('https://tranco-list.eu/download/8PX5V/100000')).text()
const ranks = new Map<string, number>()
for (const l of csv.split('\n')) {
  const i = l.indexOf(',')
  if (i > 0) ranks.set(l.slice(i + 1).trim(), Number(l.slice(0, i)))
}
const search = createSearchProvider({ provider: process.env.SEARCH_PROVIDER ?? 'brave', apiKey: process.env.SEARCH_API_KEY ?? '' })

const out = []
for (const domain of domains) {
  let queries = 0
  const deps = {
    fetcher: createFetcher({ resolve, siteUrl: 'https://example.com' }), search, fetchImpl: fetch,
    psiKey: process.env.PSI_API_KEY ?? '', githubToken: process.env.GITHUB_TOKEN ?? '', directories: dirs,
    async takeQuery() { return queries++ < 2 },
    async lookupRank(d: string) { return { imported: true, rank: ranks.get(d) ?? null } },
    log: () => {},
  }
  const scan: Record<string, TargetScan> = {}
  for (const task of buildTasks({ domain, competitors: [], tier: 'free' })) {
    const r = await runTask(task, deps)
    const e = (scan[domain] ??= { domain })
    if (r.data !== undefined) (e as unknown as Record<string, unknown>)[task.kind] = r.data
  }
  const rep = assembleReport({ mode: 'website', domain, input: {}, scan, competitors: [], directories: dirs, oneLiner: '', tier: 'free', queryCount: queries, version: 1 })
  const s = scan[domain]
  out.push({
    domain, score: rep.score, sub_scores: rep.sub_scores, gap_total: rep.gap_total, top_gap: rep.gaps[0]?.message ?? null,
    rank: s.rank?.rank ?? null, hn: s.hn?.count ?? null, github: s.github?.count ?? null,
    tech_passed: s.technical?.passed ?? null, tech_total: s.technical?.total ?? null,
  })
  console.log(domain, rep.score, rep.gap_total)
}
await writeFile(new URL('../apps/web/data/examples.json', import.meta.url), JSON.stringify({ taken_at: new Date().toISOString().slice(0, 10), items: out }, null, 2) + '\n')
