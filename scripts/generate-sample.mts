// Runs the real scan tasks and report assembly against a live domain, then writes the static snapshot
// that the home page shows as the sample report.
//
//   npx tsx scripts/generate-sample.mts <domain> <competitor> <competitor>
//
// Search-backed checks (indexing, web mentions, reviews, Reddit, LinkedIn, X) need a search provider key.
// Set SEARCH_PROVIDER and SEARCH_API_KEY to include them; without a key they are skipped and the snapshot says so.

import dns from 'node:dns/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { normalizeDomain } from '../supabase/functions/_shared/domain.ts'
import { describeOutcome } from '../supabase/functions/_shared/pipeline.ts'
import { assembleReport, planFor } from '../supabase/functions/_shared/report.ts'
import { createFetcher } from '../supabase/functions/_shared/safe-fetch.ts'
import { buildTasks, runTask, taskId } from '../supabase/functions/_shared/scan.ts'
import { createSearchProvider } from '../supabase/functions/_shared/search.ts'
import type { DirectoryRow, TargetScan } from '../supabase/functions/_shared/types.ts'

const [, , rawDomain = 'linear.app', ...rawComps] = process.argv
const domain = normalizeDomain(rawDomain)
const competitors = rawComps.map(normalizeDomain).slice(0, 3)

// dns.lookup uses the operating system resolver. (dns.resolve4 talks to the configured servers directly and
// fails on machines whose resolver is a local stub.) Production uses Deno.resolveDns.
async function resolve(host: string): Promise<string[]> {
  return (await dns.lookup(host, { all: true })).map((r) => r.address)
}

const dirs = JSON.parse(await readFile(new URL('../supabase/seed/directories.json', import.meta.url), 'utf8')) as DirectoryRow[]

console.log('Downloading the Tranco top 100,000 list for rank lookups')
const csv = await (await fetch('https://tranco-list.eu/download/8PX5V/100000')).text()
const ranks = new Map<string, number>()
for (const line of csv.split('\n')) {
  const i = line.indexOf(',')
  if (i > 0) ranks.set(line.slice(i + 1).trim(), Number(line.slice(0, i)))
}

const search = createSearchProvider({ provider: process.env.SEARCH_PROVIDER ?? 'brave', apiKey: process.env.SEARCH_API_KEY ?? '' })
let queries = 0
const fetcher = createFetcher({ resolve, siteUrl: 'https://example.com' })
const deps = {
  fetcher, search, fetchImpl: fetch, psiKey: process.env.PSI_API_KEY ?? '', githubToken: process.env.GITHUB_TOKEN ?? '', directories: dirs,
  async takeQuery() {
    if (queries >= 2) return false
    queries++
    return true
  },
  async lookupRank(d: string) {
    return { imported: true, rank: ranks.get(d) ?? ranks.get('www.' + d) ?? null }
  },
  log: (level: string, msg: string) => console.log(`  [${level}] ${msg}`),
}

const scan: Record<string, TargetScan> = {}
const logLines: { domain: string; level: string; msg: string }[] = []
for (const task of buildTasks({ domain, competitors, tier: 'free' })) {
  console.log(taskId(task))
  const out = await runTask(task, deps)
  const entry = (scan[task.domain] ??= { domain: task.domain })
  if (out.data !== undefined) {
    ;(entry as unknown as Record<string, unknown>)[task.kind] = out.data
    logLines.push({ domain: task.domain, ...describeOutcome(task, out.data) })
  } else {
    logLines.push({ domain: task.domain, level: 'warn', msg: `${task.domain}: ${task.kind} skipped. ${out.skipped}` })
    entry.skipped = { ...(entry.skipped ?? {}), [task.kind]: out.skipped ?? 'skipped' }
    console.log(`  skipped: ${out.skipped}`)
  }
}

const home = scan[domain]?.technical
const report = assembleReport({
  mode: 'website', domain, input: {}, scan, competitors, directories: dirs,
  oneLiner: home?.description ?? '', tier: 'full', queryCount: queries, version: 1,
})
report.plan = planFor(report)

const snapshot = {
  taken_at: new Date().toISOString().slice(0, 10),
  note: search
    ? 'Taken with the live check code. Search-backed checks ran with the 2 query free-tier cap.'
    : 'Taken with the live check code. No search provider key was set, so indexing, web mentions and review checks were skipped and do not count toward the score.',
  report,
  product: { title: home?.title ?? null, description: home?.description ?? null },
  technical: home?.checks ?? [],
  log: logLines,
  scan_skipped: Object.fromEntries(Object.entries(scan).map(([d, s]) => [d, s.skipped ?? {}])),
}
await writeFile(new URL('../apps/web/data/sample-report.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n')
console.log(`\nScore ${report.score}. ${report.gaps.length} gaps. Wrote apps/web/data/sample-report.json`)
