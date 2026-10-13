// Tolerant HTML reader. No dependencies: a linear tag scanner that respects quoted attribute values.

export interface ParsedPage {
  lang: string | null
  title: string | null
  metaDescription: string | null
  canonical: string | null
  robotsMeta: string | null
  viewport: string | null
  og: Record<string, string>
  twitter: Record<string, string>
  headings: { level: number; text: string }[]
  jsonLdTypes: string[]
  jsonLdBlocks: number
  links: string[]
  imgCount: number
  imgNoAlt: number
  firstParagraph: string | null
}

interface Tag {
  name: string
  attrs: Record<string, string>
  closing: boolean
  end: number // index just after '>'
}

function readTag(html: string, start: number): Tag | null {
  let i = start + 1
  const closing = html[i] === '/'
  if (closing) i++
  const nameStart = i
  while (i < html.length && /[A-Za-z0-9:-]/.test(html[i])) i++
  if (i === nameStart) return null
  const name = html.slice(nameStart, i).toLowerCase()
  const attrs: Record<string, string> = {}

  while (i < html.length) {
    while (i < html.length && /[\s/]/.test(html[i])) i++
    if (html[i] === '>') return { name, attrs, closing, end: i + 1 }
    const aStart = i
    while (i < html.length && !/[\s=>/]/.test(html[i])) i++
    const key = html.slice(aStart, i).toLowerCase()
    if (i === aStart) {
      i++
      continue
    }
    while (i < html.length && /\s/.test(html[i])) i++
    let value = ''
    if (html[i] === '=') {
      i++
      while (i < html.length && /\s/.test(html[i])) i++
      const q = html[i]
      if (q === '"' || q === "'") {
        const close = html.indexOf(q, i + 1)
        if (close < 0) return null
        value = html.slice(i + 1, close)
        i = close + 1
      } else {
        const vStart = i
        while (i < html.length && !/[\s>]/.test(html[i])) i++
        value = html.slice(vStart, i)
      }
    }
    if (!(key in attrs)) attrs[key] = decodeEntities(value)
  }
  return null
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function safeChar(n: number): string {
  try {
    return String.fromCodePoint(n)
  } catch {
    return ''
  }
}

function plainText(fragment: string): string {
  return decodeEntities(fragment.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function collectTypes(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) return node.forEach((n) => collectTypes(n, out))
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>
  const t = obj['@type']
  if (typeof t === 'string') out.add(t)
  else if (Array.isArray(t)) t.forEach((x) => typeof x === 'string' && out.add(x))
  for (const v of Object.values(obj)) if (v && typeof v === 'object') collectTypes(v, out)
}

export function parseHtml(html: string, baseUrl: string): ParsedPage {
  const lower = html.toLowerCase()
  const page: ParsedPage = {
    lang: null, title: null, metaDescription: null, canonical: null, robotsMeta: null, viewport: null,
    og: {}, twitter: {}, headings: [], jsonLdTypes: [], jsonLdBlocks: 0, links: [], imgCount: 0, imgNoAlt: 0, firstParagraph: null,
  }
  const types = new Set<string>()
  const links = new Set<string>()

  let i = 0
  while (i < html.length) {
    const lt = html.indexOf('<', i)
    if (lt < 0) break
    if (html.startsWith('<!--', lt)) {
      const e = html.indexOf('-->', lt + 4)
      i = e < 0 ? html.length : e + 3
      continue
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const e = html.indexOf('>', lt)
      i = e < 0 ? html.length : e + 1
      continue
    }
    const tag = readTag(html, lt)
    if (!tag) {
      i = lt + 1
      continue
    }
    i = tag.end
    if (tag.closing) continue
    const { name, attrs } = tag

    if (name === 'script' || name === 'style' || name === 'noscript' || name === 'template') {
      const close = lower.indexOf('</' + name, i)
      const end = close < 0 ? html.length : close
      if (name === 'script' && (attrs.type ?? '').toLowerCase().includes('ld+json')) {
        page.jsonLdBlocks++
        try {
          collectTypes(JSON.parse(html.slice(i, end)), types)
        } catch {
          // invalid JSON-LD still counts as a block, but yields no types
        }
      }
      i = end
      continue
    }

    switch (name) {
      case 'html':
        page.lang = attrs.lang || null
        break
      case 'title': {
        if (page.title === null) {
          const close = lower.indexOf('</title', i)
          page.title = plainText(html.slice(i, close < 0 ? i + 300 : close)) || ''
        }
        break
      }
      case 'meta': {
        const key = (attrs.name ?? attrs.property ?? '').toLowerCase()
        const content = (attrs.content ?? '').trim()
        if (key === 'description' && page.metaDescription === null) page.metaDescription = content
        else if (key === 'robots') page.robotsMeta = content
        else if (key === 'viewport') page.viewport = content
        else if (key.startsWith('og:') && !(key in page.og)) page.og[key] = content
        else if (key.startsWith('twitter:') && !(key in page.twitter)) page.twitter[key] = content
        break
      }
      case 'link':
        if ((attrs.rel ?? '').toLowerCase().split(/\s+/).includes('canonical') && page.canonical === null) page.canonical = attrs.href ?? ''
        break
      case 'a':
        if (attrs.href && links.size < 400) {
          try {
            const u = new URL(attrs.href, baseUrl)
            if (u.protocol === 'http:' || u.protocol === 'https:') links.add(u.toString())
          } catch {
            // ignore malformed hrefs
          }
        }
        break
      case 'img':
        page.imgCount++
        if (attrs.alt === undefined || attrs.alt.trim() === '') page.imgNoAlt++
        break
      case 'p':
        if (page.firstParagraph === null) {
          const close = lower.indexOf('</p', i)
          const text = plainText(html.slice(i, close < 0 ? i + 600 : Math.min(close, i + 1500)))
          if (text.length >= 40) page.firstParagraph = text.slice(0, 300)
        }
        break
      default:
        if (/^h[1-6]$/.test(name) && page.headings.length < 200) {
          const close = lower.indexOf('</' + name, i)
          const text = plainText(html.slice(i, close < 0 ? i + 400 : Math.min(close, i + 2000))).slice(0, 200)
          page.headings.push({ level: Number(name[1]), text })
        }
    }
  }

  page.jsonLdTypes = [...types]
  page.links = [...links]
  return page
}

const RESERVED_X = new Set(['intent', 'share', 'home', 'i', 'search', 'hashtag', 'login', 'signup', 'explore', 'settings', 'privacy', 'tos'])

/** Links to LinkedIn people or companies, and X or Twitter profiles. Share and intent links are skipped. */
export function profileLinks(links: string[]): string[] {
  const out = new Set<string>()
  for (const l of links) {
    let u: URL
    try {
      u = new URL(l)
    } catch {
      continue
    }
    const host = u.hostname.replace(/^www\./, '')
    const seg = u.pathname.split('/').filter(Boolean)
    if (host === 'linkedin.com' && (seg[0] === 'in' || seg[0] === 'company') && seg[1]) out.add(`https://linkedin.com/${seg[0]}/${seg[1]}`)
    if ((host === 'x.com' || host === 'twitter.com') && seg[0] && !RESERVED_X.has(seg[0].toLowerCase()) && seg.length === 1) out.add(`https://x.com/${seg[0]}`)
  }
  return [...out]
}
