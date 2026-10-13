import { describe, expect, it } from 'vitest'
import { brandSlug, InputError, normalizeDomain } from '../functions/_shared/domain.ts'

describe('normalizeDomain', () => {
  it.each([
    ['example.com', 'example.com'],
    ['  Example.COM  ', 'example.com'],
    ['https://www.example.com/pricing?x=1#top', 'example.com'],
    ['http://example.com:8080/', 'example.com'],
    ['example.com.', 'example.com'],
    ['app.example.co.uk/path', 'app.example.co.uk'],
    ['www.com', 'www.com'],
    ['https://user:pw@example.com/', 'example.com'],
    ['bücher.de', 'xn--bcher-kva.de'],
  ])('accepts %s', (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected)
  })

  it.each([
    '', '   ', 'localhost', 'example', 'foo.local', 'foo.internal', 'my site.com', '127.0.0.1', '0x7f.1', '2130706433',
    '[::1]', 'http://[::1]/', 'ftp://example.com', 'javascript:alert(1)', 'a'.repeat(64) + '.com', '-bad.com', 'bad-.com', 'foo.123',
  ])('rejects %j', (input) => {
    expect(() => normalizeDomain(input)).toThrow(InputError)
  })

  it('rejects non-strings', () => {
    expect(() => normalizeDomain(42)).toThrow(InputError)
    expect(() => normalizeDomain(null)).toThrow(InputError)
  })
})

describe('brandSlug', () => {
  it('returns the brand label', () => {
    expect(brandSlug('example.com')).toBe('example')
    expect(brandSlug('app.example.com')).toBe('example')
    expect(brandSlug('example.co.uk')).toBe('example')
  })
})
