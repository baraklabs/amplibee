import { describe, expect, it } from 'vitest'
import { launchSchema } from '../functions/api/schemas.ts'

const valid = {
  name: 'TallyBook',
  tagline: 'Bookkeeping for small shops',
  category: 'Finance',
  pricing: 'Freemium',
  founder: 'Maya',
  email: 'maya@tallybook.test',
  turnstile_token: 'tok',
}

describe('launchSchema', () => {
  it('accepts the required fields and leaves the optional ones out', () => {
    const r = launchSchema.safeParse(valid)
    expect(r.success).toBe(true)
  })
  it('accepts every field at its limit', () => {
    const r = launchSchema.safeParse({
      ...valid, name: 'x'.repeat(30), tagline: 'x'.repeat(140), url: 'tallybook.test', description: 'x'.repeat(900),
      audience: 'x'.repeat(160), problem: 'x'.repeat(200), unique: 'x'.repeat(240), logo: 'https://tallybook.test/l.png', x: '@tally', github: 'https://github.com/tally',
    })
    expect(r.success).toBe(true)
  })
  it.each([
    ['empty name', { name: ' ' }],
    ['short tagline', { tagline: 'too short' }],
    ['unknown category', { category: 'Crypto' }],
    ['unknown pricing', { pricing: 'Pay what you want' }],
    ['bad email', { email: 'not-an-email' }],
    ['missing bot token', { turnstile_token: '' }],
    ['name over 30', { name: 'x'.repeat(31) }],
  ])('rejects %s', (_label, patch) => {
    expect(launchSchema.safeParse({ ...valid, ...patch }).success).toBe(false)
  })
})
