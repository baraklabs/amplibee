import { describe, expect, it } from 'vitest'
import { annualPerMonth, annualTotal, COMPARE, hasFeature, LIMITS, PLANS, planFor, upgradeFor } from '../lib/content/plans.ts'

describe('plans', () => {
  it('has Free, 10, 40, 90, 240 and 490 in that order', () => {
    expect(PLANS.map((p) => p.monthly)).toEqual([0, 10, 40, 90, 240, 490])
  })

  it('annual billing is twelve months for the price of ten', () => {
    for (const p of PLANS.filter((x) => x.monthly > 0)) {
      expect(annualTotal(p.monthly)).toBe(p.monthly * 10)
      expect(p.monthly * 12 - annualTotal(p.monthly)).toBe(p.monthly * 2) // exactly two months saved
    }
  })

  it('works out the per-month price for annual billing', () => {
    expect([10, 40, 90, 240, 490].map(annualPerMonth)).toEqual([8, 33, 75, 200, 408])
  })

  const text = (id: string) => PLANS.find((p) => p.id === id)!.features.join(' | ')

  it('Free lists its limits', () => {
    expect(text('free')).toMatch(/3 gaps/)
    expect(text('free')).toMatch(/3 competitors/)
    expect(text('free')).toMatch(/2 checks a day/)
    expect(text('free')).toMatch(/Domain ranking/)
    expect(text('free')).toMatch(/Brand visibility score/)
  })

  it('the 10 and 40 plans list their limits', () => {
    for (const re of [/5 competitors/, /Track 10 keywords/, /3 directory submissions/, /7 days of analytics/]) expect(text('starter')).toMatch(re)
    expect(text('starter')).not.toMatch(/blog/)
    for (const re of [/10 competitors/, /Track 20 keywords/, /10 directory submissions/, /1 blog post written/]) expect(text('plus')).toMatch(re)
  })

  it('the 90 plan lists its limits', () => {
    for (const re of [/10 gaps/, /20 competitors/, /Track 20 keywords/, /10 checks a day/, /Extra checks/, /Customised launch plan/, /50 directory submissions/, /7 days of analytics/, /4 blog posts/]) {
      expect(text('growth')).toMatch(re)
    }
  })

  it('the 240 and 490 plans list their limits', () => {
    expect(text('scale')).toMatch(/100 directory submissions/)
    expect(text('scale')).toMatch(/50 competitors/)
    expect(text('scale')).toMatch(/Track 50 keywords/)
    expect(text('scale')).toMatch(/20 blog posts written, with images/)
    expect(text('authority')).toMatch(/150\+ directory submissions/)
    expect(text('authority')).toMatch(/100 competitors/)
    expect(text('authority')).toMatch(/Track 100 keywords/)
    expect(text('authority')).toMatch(/1 month of analytics and tracking/)
    expect(text('authority')).toMatch(/AI visibility: Google Search, ChatGPT, Perplexity, Gemini and more/)
    expect(text('authority')).toMatch(/50 prompts tracked daily/)
    expect(text('authority')).toMatch(/45 blog posts a month, with images/)
  })

  it('limits match the comparison table', () => {
    const row = (label: string) => COMPARE.find((r) => r.label === label)!.values
    expect(PLANS.map((p) => LIMITS[p.id].competitors)).toEqual(row('Competitors to compare').map(Number))
    expect(PLANS.map((p) => LIMITS[p.id].keywords)).toEqual(row('Keywords tracked').map((v) => (v === false ? 0 : Number(v))))
  })

  it('finds the plan that unlocks a feature', () => {
    expect(planFor('keywords').id).toBe('starter')
    expect(planFor('content').id).toBe('plus')
    expect(planFor('aiVisibility').id).toBe('authority')
    expect(hasFeature('free', 'analytics')).toBe(false)
    expect(upgradeFor('free', 'competitors')?.id).toBe('starter')
    expect(upgradeFor('authority', 'keywords')).toBeNull()
  })
})
