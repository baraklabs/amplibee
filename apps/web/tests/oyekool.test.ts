import { describe, expect, it } from 'vitest'
import { buildOyekoolUrl, PREFILL_PARAMS } from '../lib/oyekool.ts'

describe('buildOyekoolUrl', () => {
  const prefill = { task: 'write' as const, brief: 'Write about example.com.', price_usd: 60 }

  it('points at the sign-up page with UTM tags', () => {
    const u = new URL(buildOyekoolUrl({ gapId: 'web_mentions', domain: 'example.com' }))
    expect(u.origin + u.pathname).toBe('https://oyekool.com/login')
    expect(u.searchParams.get('mode')).toBe('signup')
    expect(u.searchParams.get('utm_source')).toBe('amplibee')
    expect(u.searchParams.get('utm_content')).toBe('web_mentions')
    expect(u.searchParams.get('utm_term')).toBe('example.com')
  })

  it('adds prefill parameters when given', () => {
    const u = new URL(buildOyekoolUrl({ gapId: 'web_mentions', domain: 'example.com', prefill }))
    expect(u.searchParams.get(PREFILL_PARAMS.task)).toBe('write')
    expect(u.searchParams.get(PREFILL_PARAMS.price)).toBe('60')
    expect(u.searchParams.get(PREFILL_PARAMS.brief)).toBe('Write about example.com.')
  })

  it('caps the brief at 500 characters', () => {
    const u = new URL(buildOyekoolUrl({ gapId: 'x', domain: 'example.com', prefill: { ...prefill, brief: 'a'.repeat(900) } }))
    expect(u.searchParams.get(PREFILL_PARAMS.brief)).toHaveLength(500)
  })
})
