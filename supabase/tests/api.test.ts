import { describe, expect, it } from 'vitest'
import { corsHeaders, fail, ok, rateHeaders, withHeaders } from '../functions/_shared/envelope.ts'

describe('API envelope', () => {
  it('wraps success as { ok, data, error }', async () => {
    const res = ok({ job_id: 'abc' }, { status: 201 })
    expect(res.status).toBe(201)
    expect(res.headers.get('content-type')).toContain('application/json')
    expect(await res.json()).toEqual({ ok: true, data: { job_id: 'abc' }, error: null })
  })

  it('wraps failure with a code and message', async () => {
    const res = fail('rate_limited', 'Too many checks today.', { status: 429 })
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ ok: false, data: null, error: { code: 'rate_limited', message: 'Too many checks today.' } })
  })

  it('adds rate limit headers', () => {
    const res = ok({}, { rate: { limit: 3, remaining: 2, reset: 1700000000 } })
    expect(res.headers.get('x-ratelimit-limit')).toBe('3')
    expect(res.headers.get('x-ratelimit-remaining')).toBe('2')
    expect(res.headers.get('x-ratelimit-reset')).toBe('1700000000')
    expect(rateHeaders({ limit: 3, remaining: -1, reset: 1 })['x-ratelimit-remaining']).toBe('0')
  })

  it('limits CORS to the allowed origins', () => {
    const allowed = ['https://amplibee.example']
    expect(corsHeaders('https://amplibee.example', allowed)['access-control-allow-origin']).toBe('https://amplibee.example')
    expect(corsHeaders('https://evil.example', allowed)['access-control-allow-origin']).toBeUndefined()
    expect(corsHeaders(null, allowed)['access-control-allow-origin']).toBeUndefined()
  })

  it('keeps the body when headers are added', async () => {
    const res = withHeaders(ok({ a: 1 }), { 'access-control-allow-origin': 'https://x.example' })
    expect(res.headers.get('access-control-allow-origin')).toBe('https://x.example')
    expect((await res.json()).data).toEqual({ a: 1 })
  })
})
