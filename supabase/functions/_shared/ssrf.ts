// SSRF guard. Every user-supplied URL goes through assertSafeUrl before any request is made,
// and again for every redirect hop.

export class SsrfError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'SsrfError'
    this.code = code
  }
}

export type Resolver = (hostname: string) => Promise<string[]>

export function parseIPv4(s: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s)
  if (!m) return null
  const p = m.slice(1).map(Number)
  return p.some((n) => n > 255) ? null : p
}

function v4Blocked(p: number[]): boolean {
  const [a, b, c] = p
  if (a === 0 || a === 10 || a === 127) return true
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT, includes 100.100.100.200
  if (a === 169 && b === 254) return true // link-local, includes 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true
  if (a === 192 && b === 88 && c === 99) return true
  if (a === 192 && b === 168) return true
  if (a === 198 && (b === 18 || b === 19)) return true
  if (a === 198 && b === 51 && c === 100) return true
  if (a === 203 && b === 0 && c === 113) return true
  if (a >= 224) return true // multicast, reserved, broadcast
  return false
}

/** Parse an IPv6 literal into eight 16-bit groups. */
export function parseIPv6(input: string): number[] | null {
  let s = input.trim()
  if (s.startsWith('[') && s.endsWith(']')) s = s.slice(1, -1)
  const zone = s.indexOf('%')
  if (zone >= 0) s = s.slice(0, zone)
  if (!s.includes(':')) return null

  let tail: number[] = []
  if (s.includes('.')) {
    const cut = s.lastIndexOf(':')
    const v4 = parseIPv4(s.slice(cut + 1))
    if (!v4) return null
    tail = [(v4[0] << 8) | v4[1], (v4[2] << 8) | v4[3]]
    s = s.slice(0, cut + 1) + '0:0'
  }

  const halves = s.split('::')
  if (halves.length > 2) return null
  const toGroups = (part: string) => (part === '' ? [] : part.split(':'))
  const head = toGroups(halves[0])
  const rest = halves.length === 2 ? toGroups(halves[1]) : []
  const all = [...head, ...rest]
  if (!all.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return null
  let groups: number[]
  if (halves.length === 2) {
    const fill = 8 - head.length - rest.length
    if (fill < 1) return null
    groups = [...head.map((g) => parseInt(g, 16)), ...Array(fill).fill(0), ...rest.map((g) => parseInt(g, 16))]
  } else {
    if (head.length !== 8) return null
    groups = head.map((g) => parseInt(g, 16))
  }
  if (tail.length) {
    groups[6] = tail[0]
    groups[7] = tail[1]
  }
  return groups.length === 8 ? groups : null
}

function embeddedV4(hi: number, lo: number): number[] {
  return [hi >> 8, hi & 255, lo >> 8, lo & 255]
}

function v6Blocked(g: number[]): boolean {
  const zeros = (from: number, to: number) => g.slice(from, to).every((x) => x === 0)
  // ::ffff:a.b.c.d (IPv4-mapped): judge the embedded IPv4 address
  if (zeros(0, 5) && g[5] === 0xffff) return v4Blocked(embeddedV4(g[6], g[7]))
  // ::, ::1 and the deprecated IPv4-compatible range
  if (zeros(0, 6)) return true
  // 64:ff9b::/96 NAT64: judge the embedded IPv4 address
  if (g[0] === 0x64 && g[1] === 0xff9b && zeros(2, 6)) return v4Blocked(embeddedV4(g[6], g[7]))
  if (g[0] === 0x64 && g[1] === 0xff9b) return true // local-use NAT64
  // 2002::/16 6to4: judge the embedded IPv4 address
  if (g[0] === 0x2002) return v4Blocked(embeddedV4(g[1], g[2]))
  if (g[0] === 0x2001 && g[1] === 0) return true // Teredo
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true // documentation
  // Everything outside global unicast 2000::/3 is refused (unique local, link-local, multicast, discard).
  return (g[0] & 0xe000) !== 0x2000
}

/** True when the address is not a safe public destination. Anything unparseable counts as blocked. */
export function isBlockedIp(ip: string): boolean {
  const v4 = parseIPv4(ip)
  if (v4) return v4Blocked(v4)
  const v6 = parseIPv6(ip)
  if (v6) return v6Blocked(v6)
  return true
}

const BLOCKED_NAMES = new Set(['localhost', 'metadata', 'metadata.google.internal', 'instance-data'])
const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.localdomain', '.lan', '.home.arpa']

export async function assertSafeUrl(input: string | URL, resolve: Resolver): Promise<URL> {
  let url: URL
  try {
    url = new URL(String(input))
  } catch {
    throw new SsrfError('bad_url', 'The address is not a valid URL.')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SsrfError('bad_scheme', 'Only http and https addresses are allowed.')
  }
  if (url.username || url.password) throw new SsrfError('credentials', 'Addresses with credentials are not allowed.')

  const port = url.port === '' ? (url.protocol === 'https:' ? 443 : 80) : Number(url.port)
  if (port !== 80 && port !== 443) throw new SsrfError('bad_port', 'Only ports 80 and 443 are allowed.')

  let host = url.hostname.toLowerCase().replace(/\.$/, '')
  if (host.startsWith('[') && host.endsWith(']')) host = host.slice(1, -1)
  if (!host) throw new SsrfError('bad_url', 'The address has no host.')
  if (BLOCKED_NAMES.has(host) || BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new SsrfError('blocked_host', 'That host name is not allowed.')
  }

  // IP literal (the URL parser has already turned decimal, hex and octal forms into dotted form)
  if (parseIPv4(host) || host.includes(':')) {
    if (isBlockedIp(host)) throw new SsrfError('blocked_ip', 'That address points to a private or reserved network.')
    return url
  }

  let ips: string[]
  try {
    ips = await resolve(host)
  } catch {
    throw new SsrfError('dns_failed', `Could not resolve ${host}.`)
  }
  if (!ips.length) throw new SsrfError('dns_failed', `Could not resolve ${host}.`)
  for (const ip of ips) {
    if (isBlockedIp(ip)) throw new SsrfError('blocked_ip', `${host} resolves to a private or reserved network.`)
  }
  return url
}
