// Fills the workspace from a finished check, so nobody has to type their competitors, keywords or directories by hand.
// Everything is capped by the plan, and nothing the person already added is removed or replaced.

import { LIMITS, type PlanId } from './content/plans.ts'
import { DIRECTORIES } from './directories.ts'
import type { Report } from './shared/types.ts'
import { brandOf, type ContentItem, type Workspace } from './workspace.ts'

export interface SetupInput {
  domain: string
  plan: PlanId
  ws: Workspace
  /** Competitors the check found, plus the extra suggestions that unlock with the report. */
  competitors: string[]
  report: Report | null
}

export interface SetupResult {
  patch: Partial<Workspace>
  added: { competitors: number; keywords: number; directories: number; content: number }
}

const MAX_IDEAS = 8

export function deriveSetup({ domain, plan, ws, competitors, report }: SetupInput): SetupResult {
  const limits = LIMITS[plan]
  const brand = brandOf(domain)

  const rivals = [...ws.competitors]
  for (const c of competitors) {
    if (rivals.length >= limits.competitors) break
    if (c !== domain && !rivals.includes(c)) rivals.push(c)
  }

  const keywords = [...ws.keywords]
  if (limits.keywords > 0) {
    const wanted = [`${brand} alternatives`, `${brand} reviews`, `${brand} pricing`, ...rivals.slice(0, 4).map((c) => `${brand} vs ${brandOf(c)}`), `best ${brand} alternative`]
    for (const k of wanted) {
      if (keywords.length >= limits.keywords) break
      if (!keywords.includes(k)) keywords.push(k)
    }
  }

  const directories = { ...ws.directories }
  if (limits.directories > 0 && report) {
    const rank = new Map(DIRECTORIES.map((d) => [d.slug, d.priority]))
    const open = report.directories
      .filter((d) => d.status !== 'listed' && d.submit_url)
      .sort((a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99))
    for (const d of open) {
      if (Object.keys(directories).length >= limits.directories) break
      directories[d.slug] ??= 'todo'
    }
  }

  const content: ContentItem[] = [...ws.content]
  if (limits.blogPosts > 0) {
    const have = new Set(content.map((c) => c.title))
    const ideas: { title: string; kind: ContentItem['kind'] }[] = [
      ...rivals.slice(0, 3).map((c) => ({ title: `${brand} vs ${brandOf(c)}: which is right for you?`, kind: 'comparison' as const })),
      { title: `Best ${brand} alternatives`, kind: 'comparison' },
      { title: `How ${brand} helps your customers, with a real example`, kind: 'blog' },
      { title: `Launch announcement: what ${brand} does and who it is for`, kind: 'post' },
      ...(report?.plan ?? []).filter((p) => p.fix_type === 'content').map((p) => ({ title: p.title, kind: 'blog' as const })),
    ]
    for (const i of ideas) {
      if (content.length >= ws.content.length + MAX_IDEAS) break
      if (have.has(i.title)) continue
      have.add(i.title)
      content.push({ id: crypto.randomUUID(), title: i.title, kind: i.kind, state: 'idea', date: '' })
    }
  }

  return {
    patch: { domain, competitors: rivals, keywords, directories, content },
    added: {
      competitors: rivals.length - ws.competitors.length,
      keywords: keywords.length - ws.keywords.length,
      directories: Object.keys(directories).length - Object.keys(ws.directories).length,
      content: content.length - ws.content.length,
    },
  }
}
