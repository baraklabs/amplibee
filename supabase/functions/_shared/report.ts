// Pure report assembly: scans in, Report out. Used by the score step and by scripts/generate-sample.mts.

import { buildGaps, buildPlan, launchChecklist } from './gaps.ts'
import { SCORING } from './scoring.config.ts'
import { scoreScan } from './scoring.ts'
import { finalizeDirectories } from './scan.ts'
import type { Category, CompetitorRow, DirectoryRow, Gap, Report, TargetScan } from './types.ts'

export function rowOf(s: TargetScan | undefined, domain: string): CompetitorRow {
  const t = s?.technical
  const reachable = !!t && t.reachable
  const check = (id: string) => (reachable ? !!t.checks.find((x) => x.id === id)?.pass : null)
  return {
    domain,
    rank: s?.rank ? s.rank.rank : undefined,
    tech_passed: reachable ? t.passed : null,
    tech_total: reachable ? t.total : null,
    og_image: check('og_image'),
    structured_data: check('structured_data'),
    hn: s?.hn ? s.hn.count : null,
    github: s?.github ? s.github.count : null,
    indexed: s?.indexing ? s.indexing.count : null,
    web: s?.web ? s.web.count : null,
  }
}

export interface AssembleArgs {
  mode: 'website' | 'no_website'
  domain: string | null
  input: { sells?: string; customer?: string; markets?: string }
  scan: Record<string, TargetScan>
  competitors: string[]
  directories: DirectoryRow[]
  oneLiner: string
  tier: 'free' | 'full'
  queryCount: number
  version: number
}

export function assembleReport(a: AssembleArgs): Report {
  const comps = a.competitors.map((d) => a.scan[d] ?? { domain: d })
  let total: number | null = null
  let sub: Record<Category, number | null> = { discoverability: null, buzz: null, trust: null, technical: null }
  let gaps: Gap[]
  let self: CompetitorRow | null = null
  let dirView: Report['directories']
  let checklist: string[] = []

  if (a.mode === 'website' && a.domain) {
    const selfScan: TargetScan = { ...(a.scan[a.domain] ?? { domain: a.domain }) }
    selfScan.directories = finalizeDirectories(selfScan, a.directories) ?? selfScan.directories
    const r = scoreScan(selfScan, comps)
    total = r.total
    sub = r.sub
    gaps = buildGaps({ self: selfScan, competitors: comps, directories: a.directories, oneLiner: a.oneLiner })
    self = rowOf(selfScan, selfScan.domain)
    const st = selfScan.directories
    dirView = a.directories
      .filter((d) => d.submit_url || d.check_method !== 'none')
      .map((d) => ({
        slug: d.slug, name: d.name, submit_url: d.submit_url,
        status: st?.listed.includes(d.slug) ? 'listed' : st?.not_found.includes(d.slug) ? 'not_found' : 'unknown',
      }))
  } else {
    gaps = [{
      id: 'no_website', category: 'discoverability', severity: 'high', impact: 0, fix_type: 'free_guide', fix_ref: 'technical-basics',
      message: 'You have no website yet, so search engines, directories and buyers have nothing to find. Start with one page that says what you sell.',
    }]
    checklist = launchChecklist({ sells: a.input.sells ?? '', customer: a.input.customer ?? '', markets: a.input.markets ?? '' })
    dirView = a.directories.filter((d) => d.submit_url).map((d) => ({ slug: d.slug, name: d.name, submit_url: d.submit_url, status: 'unknown' as const }))
  }

  return {
    domain: a.domain ?? '', mode: a.mode, generated_at: new Date().toISOString(), version: a.version,
    score: total, sub_scores: sub, gaps, gap_total: gaps.length, self,
    competitors: comps.map((s) => rowOf(s, s.domain)), plan: [], directories: dirView, checklist,
    locked: false, query_count: a.queryCount, query_cap: SCORING.queryCaps[a.tier],
  }
}

/** Step 5: map gaps (and, without a website, the directory list) to actions. */
export function planFor(report: Report): Report['plan'] {
  const items = buildPlan(report.gaps)
  if (report.mode === 'no_website') {
    return [
      ...items,
      ...report.directories.slice(0, 8).map((d) => ({
        gap_id: `directory:${d.slug}`, title: `Submit to ${d.name} once the site is live`, fix_type: 'directory_submission' as const, href: d.submit_url ?? undefined,
      })),
    ]
  }
  return items
}
