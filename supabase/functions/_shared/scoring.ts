import { SCORING } from './scoring.config.ts'
import type { Category, TargetScan } from './types.ts'

/** Flat numbers pulled out of a scan. null means "not measured": it is left out and the rest is rescaled. */
export interface Metrics {
  directories_listed: number | null
  indexed: number | null
  rank: number | null | undefined // undefined: not measured, null: measured but not in the list
  tech: Record<string, boolean> | null
  speed: number | null
  web: number | null
  hn: number | null
  github: number | null
  social: number | null
  profiles: boolean | null
  structured: boolean | null
  about: boolean | null
  reviews: number | null
  competitors: BuzzParts[] // mention counts of each scanned competitor
}

export interface BuzzParts {
  web: number | null
  hn: number | null
  github: number | null
  social: number | null
}

export type SubScores = Record<Category, number | null>

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/** Weighted mean of 0..1 values, skipping nulls. Returns 0..100 or null if nothing was measured. */
export function weighted(parts: [number | null, number][]): number | null {
  let sum = 0
  let w = 0
  for (const [v, weight] of parts) {
    if (v === null || Number.isNaN(v)) continue
    sum += clamp01(v) * weight
    w += weight
  }
  return w === 0 ? null : (sum / w) * 100
}

export function rankValue(rank: number | null | undefined): number | null {
  if (rank === undefined) return null
  if (rank === null) return 0
  const { rankBest, rankWorst } = SCORING.discoverability
  return clamp01((Math.log10(rankWorst) - Math.log10(rank)) / (Math.log10(rankWorst) - Math.log10(rankBest)))
}

function cap(n: number | null, c: number): number | null {
  return n === null ? null : clamp01(n / c)
}

export function buzzIndex(m: Pick<Metrics, 'web' | 'hn' | 'github' | 'social'>): number | null {
  const b = SCORING.buzz
  return weighted([
    [cap(m.web, b.caps.web), b.web],
    [cap(m.hn, b.caps.hn), b.hn],
    [cap(m.github, b.caps.github), b.github],
    [cap(m.social, b.caps.social), b.social],
  ])
}

export function scoreMetrics(m: Metrics): { total: number | null; exact: number | null; sub: SubScores } {
  const d = SCORING.discoverability
  const discoverability = weighted([
    [cap(m.directories_listed, d.directoriesTarget), d.directories],
    [cap(m.indexed, d.indexingTarget), d.indexing],
    [rankValue(m.rank), d.rank],
  ])

  const abs = buzzIndex(m)
  // Relative part: compare only the mention types measured for both sides, against the strongest competitor.
  let rel: number | null = null
  for (const c of m.competitors) {
    const both = (k: keyof BuzzParts) => (m[k] !== null && c[k] !== null)
    const mine = buzzIndex({ web: both('web') ? m.web : null, hn: both('hn') ? m.hn : null, github: both('github') ? m.github : null, social: both('social') ? m.social : null })
    const theirs = buzzIndex({ web: both('web') ? c.web : null, hn: both('hn') ? c.hn : null, github: both('github') ? c.github : null, social: both('social') ? c.social : null })
    if (mine === null || theirs === null) continue
    const ratio = Math.max(mine, theirs) === 0 ? 1 : mine / Math.max(mine, theirs)
    rel = rel === null ? ratio : Math.min(rel, ratio)
  }
  // With no usable competitor the benchmark is a full-marks site, so adding a weak competitor can lift
  // the score and adding a strong one cannot lower it below the no-competitor value.
  if (abs !== null && rel === null) rel = abs / 100
  const buzz = abs === null ? null : weighted([[abs / 100, SCORING.buzz.absolute], [rel, SCORING.buzz.relative]])

  const t = SCORING.trust
  const trust = weighted([
    [m.profiles === null ? null : m.profiles ? 1 : 0, t.profiles],
    [m.structured === null ? null : m.structured ? 1 : 0, t.structured],
    [m.about === null ? null : m.about ? 1 : 0, t.about],
    [cap(m.reviews, t.reviewsTarget), t.reviews],
  ])

  let techChecks: number | null = null
  if (m.tech) {
    const parts = Object.entries(m.tech).map(([id, pass]) => [pass ? 1 : 0, SCORING.technical.checkWeights[id] ?? 4] as [number, number])
    techChecks = parts.length ? weighted(parts) : 0
  }
  const technical = weighted([
    [techChecks === null ? null : techChecks / 100, SCORING.technical.checks],
    [m.speed === null ? null : m.speed / 100, SCORING.technical.speed],
  ])

  const sub: SubScores = { discoverability, buzz, trust, technical }
  const total = weighted(
    (Object.keys(SCORING.weights) as Category[]).map((k) => [sub[k] === null ? null : (sub[k] as number) / 100, SCORING.weights[k]] as [number | null, number]),
  )
  const r = (n: number | null) => (n === null ? null : Math.round(n))
  return { total: r(total), exact: total, sub: { discoverability: r(discoverability), buzz: r(buzz), trust: r(trust), technical: r(technical) } }
}

const count = (s?: { count: number }) => (s ? s.count : null)

/** Turn a scan into metrics. `competitors` are scanned competitor domains, used for the relative buzz part. */
export function scanToMetrics(scan: TargetScan, competitors: TargetScan[] = []): Metrics {
  const tech = scan.technical && scan.technical.reachable ? Object.fromEntries(scan.technical.checks.map((c) => [c.id, c.pass])) : scan.technical ? {} : null
  const social = [scan.reddit, scan.linkedin, scan.x]
  const socialMeasured = social.some((s) => s)
  const m: Metrics = {
    directories_listed: scan.directories ? scan.directories.listed.length : null,
    indexed: scan.indexing ? scan.indexing.count : null,
    rank: scan.rank ? scan.rank.rank : undefined,
    tech,
    speed: scan.speed ? scan.speed.score : null,
    web: count(scan.web),
    hn: count(scan.hn),
    github: count(scan.github),
    social: socialMeasured ? social.reduce((a, s) => a + (s ? s.count : 0), 0) : null,
    profiles: scan.technical ? scan.technical.profile_links.length > 0 : null,
    structured: scan.technical && scan.technical.reachable ? !!tech?.structured_data : null,
    about: scan.technical ? scan.technical.about_found : null,
    reviews: count(scan.reviews),
    competitors: [],
  }
  m.competitors = competitors.map((c) => {
    const cm = scanToMetrics(c)
    return { web: cm.web, hn: cm.hn, github: cm.github, social: cm.social }
  })
  return m
}

export function scoreScan(scan: TargetScan, competitors: TargetScan[] = []) {
  return scoreMetrics(scanToMetrics(scan, competitors))
}
