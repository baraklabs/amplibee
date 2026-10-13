import { describe, expect, it } from 'vitest'
import { categoryPhrase, categoryQueries } from '../functions/_shared/pipeline.ts'

describe('categoryPhrase', () => {
  it('keeps what a no-website answer says it sells', () => {
    expect(categoryPhrase({ sells: 'Invoicing software for freelance designers' })).toBe('Invoicing software for freelance designers')
  })
  it('cuts a description at the first feature list', () => {
    expect(categoryPhrase({ description: 'Open-source screen recorder with camera overlay, diarized transcripts, AI summaries' })).toBe('Open-source screen recorder')
  })
  it('drops the brand and verb from "X is the ..."', () => {
    expect(categoryPhrase({ description: 'Cap is the free, open-source screen recorder for teams. Record and share in seconds.' })).toBe('free open-source screen recorder for teams')
  })
  it('drops a trailing "tool"', () => {
    expect(categoryPhrase({ sells: 'screen recording tool' })).toBe('screen recording')
  })
  it('returns null when only a brand name is known', () => {
    expect(categoryPhrase({ title: 'Doculigent — record, edit, share' })).toBeNull()
    expect(categoryPhrase({})).toBeNull()
  })
})

describe('categoryQueries', () => {
  it('searches the named product when the text says "alternative to X"', () => {
    expect(categoryQueries({ description: 'Cap is the open source alternative to Loom. Lightweight and fast.' })).toEqual(['Loom alternatives'])
  })
  it('searches the category otherwise', () => {
    expect(categoryQueries({ sells: 'screen recording tool' })).toEqual(['best screen recording tools'])
  })
})
