export class InputError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'InputError'
    this.code = code
  }
}

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/
const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/
const TLD = /^([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/
const RESERVED_TLDS = new Set([
  'localhost', 'local', 'internal', 'test', 'invalid', 'example', 'lan', 'home',
  'corp', 'onion', 'arpa', 'intranet', 'private',
])

const BAD = 'Enter your website address, for example example.com.'

/** Reduce user input to a lowercase hostname without scheme, path, port, credentials or leading www. */
export function normalizeDomain(input: unknown): string {
  if (typeof input !== 'string') throw new InputError('invalid_domain', BAD)
  let s = input.trim()
  if (!s || s.length > 300 || /\s/.test(s)) throw new InputError('invalid_domain', BAD)

  const scheme = /^([a-z][a-z0-9+.-]*):\/\//i.exec(s)
  if (scheme) {
    if (!['http', 'https'].includes(scheme[1].toLowerCase())) {
      throw new InputError('invalid_domain', 'Only http and https addresses are supported.')
    }
  } else {
    s = 'http://' + s
  }

  let u: URL
  try {
    u = new URL(s)
  } catch {
    throw new InputError('invalid_domain', BAD)
  }

  let host = u.hostname.toLowerCase().replace(/\.$/, '')
  if (host.startsWith('[') || host.includes(':') || IPV4.test(host)) {
    throw new InputError('ip_not_allowed', 'Enter a domain name, not an IP address.')
  }
  if (host.startsWith('www.') && host.split('.').length > 2) host = host.slice(4)

  if (host.length > 253) throw new InputError('invalid_domain', BAD)
  const labels = host.split('.')
  if (labels.length < 2 || !labels.every((l) => LABEL.test(l))) {
    throw new InputError('invalid_domain', BAD)
  }
  const tld = labels[labels.length - 1]
  if (!TLD.test(tld) || RESERVED_TLDS.has(tld)) {
    throw new InputError('invalid_domain', 'That does not look like a public domain.')
  }
  return host
}

const SECOND_LEVEL = new Set(['co', 'com', 'org', 'net', 'gov', 'ac', 'edu'])

/** The brand label of a domain, used to guess directory profile addresses. app.foo.com -> foo, foo.co.uk -> foo. */
export function brandSlug(domain: string): string {
  const l = domain.split('.')
  if (l.length >= 3 && l[l.length - 1].length === 2 && SECOND_LEVEL.has(l[l.length - 2])) return l[l.length - 3]
  return l[Math.max(0, l.length - 2)]
}

export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}
