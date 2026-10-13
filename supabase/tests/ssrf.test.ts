import { describe, expect, it } from 'vitest'
import { assertSafeUrl, isBlockedIp, SsrfError } from '../functions/_shared/ssrf.ts'
import { createFetcher } from '../functions/_shared/safe-fetch.ts'

const publicResolver = async () => ['93.184.216.34']

describe('isBlockedIp', () => {
  it.each([
    '0.0.0.0', '10.1.2.3', '127.0.0.1', '127.255.255.254', '169.254.169.254', '172.16.0.1', '172.31.255.255',
    '192.168.1.1', '100.64.0.1', '100.100.100.200', '192.0.2.5', '198.18.0.1', '224.0.0.1', '255.255.255.255',
    '::', '::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:169.254.169.254', 'fe80::1', 'fc00::1', 'fd00:ec2::254',
    'ff02::1', '2001:db8::1', '64:ff9b::7f00:1', '2002:7f00:1::', '2001:0:4136:e378:8000:63bf:3fff:fdd2', 'not-an-ip', '1.2.3',
  ])('blocks %s', (ip) => {
    expect(isBlockedIp(ip)).toBe(true)
  })

  it.each(['93.184.216.34', '8.8.8.8', '172.32.0.1', '100.63.255.255', '2606:4700:4700::1111', '2a00:1450:4001:81b::200e', '::ffff:8.8.8.8'])('allows %s', (ip) => {
    expect(isBlockedIp(ip)).toBe(false)
  })
})

describe('assertSafeUrl', () => {
  const bad = [
    'http://localhost/', 'http://127.0.0.1/', 'http://2130706433/', 'http://0x7f.1/', 'http://0177.0.0.1/', 'http://[::1]/',
    'http://169.254.169.254/latest/meta-data/', 'http://metadata.google.internal/', 'http://foo.internal/', 'http://example.com:8080/',
    'http://example.com:22/', 'ftp://example.com/', 'file:///etc/passwd', 'http://user:pw@example.com/', 'gopher://example.com/',
  ]
  it.each(bad)('rejects %s', async (u) => {
    await expect(assertSafeUrl(u, publicResolver)).rejects.toBeInstanceOf(SsrfError)
  })

  it('rejects a name that resolves to a private address', async () => {
    await expect(assertSafeUrl('http://evil.example/', async () => ['10.0.0.5'])).rejects.toMatchObject({ code: 'blocked_ip' })
  })
  it('rejects when any resolved address is private', async () => {
    await expect(assertSafeUrl('https://mixed.example/', async () => ['93.184.216.34', '127.0.0.1'])).rejects.toMatchObject({ code: 'blocked_ip' })
  })
  it('rejects when DNS fails or returns nothing', async () => {
    await expect(assertSafeUrl('https://nx.example/', async () => [])).rejects.toMatchObject({ code: 'dns_failed' })
    await expect(
      assertSafeUrl('https://nx.example/', async () => {
        throw new Error('x')
      }),
    ).rejects.toMatchObject({ code: 'dns_failed' })
  })
  it('allows ports 80 and 443 and public hosts', async () => {
    await expect(assertSafeUrl('https://example.com/', publicResolver)).resolves.toBeInstanceOf(URL)
    await expect(assertSafeUrl('http://example.com:80/', publicResolver)).resolves.toBeInstanceOf(URL)
    await expect(assertSafeUrl('https://example.com:443/x', publicResolver)).resolves.toBeInstanceOf(URL)
  })
})

describe('safe fetcher', () => {
  const mk = (handler: (url: string, init?: RequestInit) => Response | Promise<Response>, resolve = publicResolver) =>
    createFetcher({ resolve, fetchImpl: (async (u: string, i?: RequestInit) => handler(String(u), i)) as unknown as typeof fetch })

  const notFoundRobots = (url: string) => (url.endsWith('/robots.txt') ? new Response('', { status: 404 }) : null)

  it('sends a clear user agent and returns the body', async () => {
    let ua = ''
    const f = mk((url, init) => {
      const r = notFoundRobots(url)
      if (r) return r
      ua = new Headers(init?.headers).get('user-agent') ?? ''
      return new Response('<html>hi</html>', { status: 200, headers: { 'content-type': 'text/html' } })
    })
    const r = await f.get('https://example.com/')
    expect(r.ok).toBe(true)
    expect(r.body).toContain('hi')
    expect(ua).toMatch(/^AmplibeeBot\//)
  })

  it('re-checks every redirect hop and blocks a redirect to a private address', async () => {
    const f = mk((url) => {
      const r = notFoundRobots(url)
      if (r) return r
      return new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data/' } })
    })
    const r = await f.get('https://example.com/')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('blocked_ip')
  })

  it('follows at most 3 redirects', async () => {
    let n = 0
    const f = mk((url) => {
      const r = notFoundRobots(url)
      if (r) return r
      n++
      return new Response(null, { status: 301, headers: { location: `https://example.com/${n}` } })
    })
    const r = await f.get('https://example.com/')
    expect(r.error?.code).toBe('too_many_redirects')
    expect(n).toBe(4)
  })

  it('caps the body at 2 MB', async () => {
    const big = 'a'.repeat(3 * 1024 * 1024)
    const f = mk((url) => notFoundRobots(url) ?? new Response(big, { status: 200 }))
    const r = await f.get('https://example.com/')
    expect(r.truncated).toBe(true)
    expect(r.bytes).toBe(2 * 1024 * 1024)
  })

  it('respects robots.txt', async () => {
    const f = mk((url) => (url.endsWith('/robots.txt') ? new Response('User-agent: AmplibeeBot\nDisallow: /private', { status: 200 }) : new Response('ok', { status: 200 })))
    expect((await f.get('https://example.com/private/page')).blockedByRobots).toBe(true)
    expect((await f.get('https://example.com/public')).ok).toBe(true)
  })

  it('treats a robots.txt server error as a disallow', async () => {
    const f = mk((url) => (url.endsWith('/robots.txt') ? new Response('', { status: 503 }) : new Response('ok')))
    expect((await f.get('https://example.com/')).blockedByRobots).toBe(true)
  })

  it('reports a timeout as an error result instead of throwing', async () => {
    const f = mk((url) => {
      if (url.endsWith('/robots.txt')) return new Response('', { status: 404 })
      const e = new Error('t')
      e.name = 'TimeoutError'
      throw e
    })
    const r = await f.get('https://example.com/')
    expect(r.error?.code).toBe('timeout')
  })
})
