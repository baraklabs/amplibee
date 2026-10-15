// The dashboard workspace: its shape, validation, and the cut down to a plan's limits.

import { z } from 'zod'
import { PLAN_LIMITS, type PlanId } from './plans.ts'

const host = z.string().trim().toLowerCase().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, 'That is not a website address.').max(253)
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const MAX_CONTENT_ITEMS = 200 // ideas are not plan-limited, only the posts we write are, so this is a sanity cap
export const MAX_HISTORY = 120

export const workspaceSchema = z.object({
  domain: z.union([z.literal(''), host]),
  competitors: z.array(host).max(100),
  keywords: z.array(z.string().trim().toLowerCase().min(2).max(100)).max(100),
  directories: z.record(z.string().regex(/^[a-z0-9-]{1,60}$/), z.enum(['todo', 'submitted', 'listed'])),
  content: z
    .array(
      z.object({
        id: z.string().uuid(),
        title: z.string().trim().min(1).max(200),
        kind: z.enum(['blog', 'comparison', 'post']),
        state: z.enum(['idea', 'drafting', 'scheduled', 'published']),
        date: z.union([z.literal(''), day]),
      }),
    )
    .max(MAX_CONTENT_ITEMS),
  history: z.array(z.object({ date: day, score: z.number().int().min(0).max(100) })).max(MAX_HISTORY),
})

export type WorkspaceDoc = z.infer<typeof workspaceSchema>

export const EMPTY_DOC: WorkspaceDoc = { domain: '', competitors: [], keywords: [], directories: {}, content: [], history: [] }

const unique = <T>(xs: T[]) => [...new Set(xs)]

/** Removes duplicates and the person's own site, then cuts every list to what the plan includes. Content ideas need a plan with written posts. */
export function clampWorkspace(doc: WorkspaceDoc, plan: PlanId): WorkspaceDoc {
  const l = PLAN_LIMITS[plan]
  return {
    domain: doc.domain,
    competitors: unique(doc.competitors).filter((c) => c !== doc.domain).slice(0, l.competitors),
    keywords: unique(doc.keywords).slice(0, l.keywords),
    directories: Object.fromEntries(Object.entries(doc.directories).slice(0, l.directories)),
    content: l.blogPosts > 0 ? doc.content : [],
    history: [...new Map(doc.history.map((h) => [h.date, h])).values()], // one reading a day, the last one wins
  }
}
