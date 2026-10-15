import { describe, expect, it } from 'vitest'
import { LIMITS } from '../../apps/web/lib/content/plans.ts'
import { PLAN_LIMITS } from '../functions/_shared/plans.ts'
import { clampWorkspace, EMPTY_DOC, workspaceSchema } from '../functions/_shared/workspace.ts'

const ID = '11111111-1111-4111-8111-111111111111'

describe('plan limits', () => {
  it('match the web app', () => {
    for (const [id, l] of Object.entries(PLAN_LIMITS)) {
      const w = LIMITS[id as keyof typeof LIMITS]
      expect(l).toEqual({ competitors: w.competitors, keywords: w.keywords, directories: w.directories, blogPosts: w.blogPosts })
    }
  })
})

describe('workspaceSchema', () => {
  it('accepts an empty workspace and a full one', () => {
    expect(workspaceSchema.safeParse(EMPTY_DOC).success).toBe(true)
    const full = { domain: 'acme.io', competitors: ['one.com'], keywords: ['acme alternatives'], directories: { 'product-hunt': 'todo' }, content: [{ id: ID, title: 'Best acme alternatives', kind: 'comparison', state: 'idea', date: '' }], history: [{ date: '2026-10-15', score: 62 }] }
    expect(workspaceSchema.safeParse(full).success).toBe(true)
  })

  it('rejects bad domains, statuses and scores', () => {
    expect(workspaceSchema.safeParse({ ...EMPTY_DOC, domain: 'not a domain' }).success).toBe(false)
    expect(workspaceSchema.safeParse({ ...EMPTY_DOC, directories: { a: 'done' } }).success).toBe(false)
    expect(workspaceSchema.safeParse({ ...EMPTY_DOC, history: [{ date: '2026-10-15', score: 140 }] }).success).toBe(false)
    expect(workspaceSchema.safeParse({ ...EMPTY_DOC, competitors: ['https://x.com/path'] }).success).toBe(false)
  })
})

describe('clampWorkspace', () => {
  const big = {
    ...EMPTY_DOC,
    domain: 'acme.io',
    competitors: ['acme.io', 'a.com', 'a.com', 'b.com', 'c.com', 'd.com', 'e.com'],
    keywords: Array.from({ length: 30 }, (_, i) => `keyword ${i}`),
    directories: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`dir-${i}`, 'todo' as const])),
    content: [{ id: ID, title: 'An idea', kind: 'blog' as const, state: 'idea' as const, date: '' }],
  }

  it('free keeps 3 competitors, drops the own site and duplicates, and nothing else', () => {
    const r = clampWorkspace(big, 'free')
    expect(r.competitors).toEqual(['a.com', 'b.com', 'c.com'])
    expect(r.keywords).toEqual([])
    expect(r.directories).toEqual({})
    expect(r.content).toEqual([])
  })

  it('starter cuts to 5 / 10 / 3 and still has no content', () => {
    const r = clampWorkspace(big, 'starter')
    expect(r.competitors).toHaveLength(5)
    expect(r.keywords).toHaveLength(10)
    expect(Object.keys(r.directories)).toHaveLength(3)
    expect(r.content).toEqual([])
  })

  it('plus keeps content ideas', () => {
    expect(clampWorkspace(big, 'plus').content).toHaveLength(1)
  })
})
