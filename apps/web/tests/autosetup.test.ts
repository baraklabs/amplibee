import { describe, expect, it } from 'vitest'
import { deriveSetup } from '../lib/autoSetup.ts'
import { EMPTY } from '../lib/workspace.ts'
import type { Report } from '../lib/shared/types.ts'

const report = {
  directories: [
    { slug: 'a', name: 'A', status: 'listed', submit_url: 'https://a.test' },
    { slug: 'b', name: 'B', status: 'not_found', submit_url: 'https://b.test' },
    { slug: 'c', name: 'C', status: 'unknown', submit_url: 'https://c.test' },
    { slug: 'd', name: 'D', status: 'not_found', submit_url: null },
  ],
  plan: [{ gap_id: 'g', title: 'Write a comparison page', fix_type: 'content' }],
} as unknown as Report

const rivals = ['one.com', 'two.com', 'three.com', 'four.com', 'acme.io']

describe('deriveSetup', () => {
  it('free: competitors only, capped at 3, and never the own site', () => {
    const r = deriveSetup({ domain: 'acme.io', plan: 'free', ws: EMPTY, competitors: rivals, report })
    expect(r.patch.competitors).toEqual(['one.com', 'two.com', 'three.com'])
    expect(r.patch.keywords).toEqual([])
    expect(r.patch.directories).toEqual({})
    expect(r.patch.content).toEqual([])
  })

  it('starter: fills keywords and directories to the plan limit, skipping listed and unsubmittable ones', () => {
    const r = deriveSetup({ domain: 'acme.io', plan: 'starter', ws: EMPTY, competitors: rivals, report })
    expect(r.patch.keywords!.length).toBeLessThanOrEqual(10)
    expect(r.patch.keywords).toContain('acme alternatives')
    expect(Object.keys(r.patch.directories!).sort()).toEqual(['b', 'c'])
    expect(r.patch.content).toEqual([])
  })

  it('plus: also adds content ideas, once', () => {
    const first = deriveSetup({ domain: 'acme.io', plan: 'plus', ws: EMPTY, competitors: rivals, report })
    expect(first.added.content).toBeGreaterThan(0)
    const again = deriveSetup({ domain: 'acme.io', plan: 'plus', ws: { ...EMPTY, ...first.patch }, competitors: rivals, report })
    expect(again.added).toEqual({ competitors: 0, keywords: 0, directories: 0, content: 0 })
  })

  it('keeps what the person already added', () => {
    const ws = { ...EMPTY, competitors: ['mine.com'], keywords: ['my keyword'] }
    const r = deriveSetup({ domain: 'acme.io', plan: 'starter', ws, competitors: rivals, report })
    expect(r.patch.competitors![0]).toBe('mine.com')
    expect(r.patch.keywords![0]).toBe('my keyword')
  })
})
