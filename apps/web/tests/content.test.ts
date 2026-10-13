import { describe, expect, it } from 'vitest'
import { FAQ } from '../lib/content/faq.ts'
import { GUIDES } from '../lib/content/guides.ts'
import { PROCESS_STEPS } from '../lib/content/steps.ts'
import { DIRECTORIES } from '../lib/directories.ts'
import { stripLinks, wordCount } from '../lib/format.ts'

describe('answer-first copy', () => {
  it.each(FAQ.map((f) => [f.q, f.a]))('FAQ answer is 40 to 60 words: %s', (_q, a) => {
    const n = wordCount(stripLinks(a))
    expect(n, `${n} words`).toBeGreaterThanOrEqual(40)
    expect(n, `${n} words`).toBeLessThanOrEqual(60)
  })

  for (const g of GUIDES) {
    it.each(g.sections.map((s) => [s.q, s.a]))(`guide ${g.slug} answer is 40 to 60 words: %s`, (_q, a) => {
      const n = wordCount(stripLinks(a))
      expect(n, `${n} words`).toBeGreaterThanOrEqual(40)
      expect(n, `${n} words`).toBeLessThanOrEqual(60)
    })
  }


  it('every guide has a dated update line and at least one source', () => {
    for (const g of GUIDES) {
      expect(g.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(g.sources.length).toBeGreaterThan(0)
    }
  })

  it('has the four required guides', () => {
    const slugs = GUIDES.map((g) => g.slug)
    expect(slugs).toEqual(expect.arrayContaining(['where-to-list-a-new-saas', 'first-mentions', 'what-an-og-image-is', 'how-answer-engines-pick-products']))
  })

  it('has six process steps', () => {
    expect(PROCESS_STEPS).toHaveLength(6)
  })
})

describe('directories seed', () => {
  it('has unique slugs and https addresses only', () => {
    const slugs = new Set(DIRECTORIES.map((d) => d.slug))
    expect(slugs.size).toBe(DIRECTORIES.length)
    for (const d of DIRECTORIES) {
      expect(d.url).toMatch(/^https:\/\//)
      if (d.submit_url) expect(d.submit_url).toMatch(/^https:\/\//)
    }
  })
  it('only claims a slug_url check when a template is present', () => {
    for (const d of DIRECTORIES) if (d.check_method === 'slug_url') expect(d.check_url_template).toBeTruthy()
  })
})
