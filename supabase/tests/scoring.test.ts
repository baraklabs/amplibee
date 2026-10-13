import { describe, expect, it } from 'vitest'
import { buildGaps } from '../functions/_shared/gaps.ts'
import { parseHtml, profileLinks } from '../functions/_shared/html.ts'
import { parseRobots, isAllowed, blocksEverything } from '../functions/_shared/robots.ts'
import { SCORING } from '../functions/_shared/scoring.config.ts'
import { rankValue, scanToMetrics, scoreMetrics, scoreScan, weighted } from '../functions/_shared/scoring.ts'
import { analyzeTechnical } from '../functions/_shared/technical.ts'
import type { TargetScan } from '../functions/_shared/types.ts'

const HTML = `<!doctype html><html lang="en"><head>
<title>Acme | Invoicing for freelancers</title>
<meta name="description" content="Acme sends invoices, tracks payments and chases late clients so freelancers get paid on time.">
<link rel="canonical" href="https://acme.test/">
<meta property="og:title" content="Acme"><meta property="og:description" content="Invoicing"><meta property="og:url" content="https://acme.test/"><meta property="og:type" content="website">
<meta property="og:image" content="https://acme.test/og.png"><meta name="twitter:card" content="summary_large_image">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Acme"},{"@type":["SoftwareApplication","WebApplication"]}]}</script>
<script>var x = "<h1>not a heading</h1>"</script>
</head><body>
<!-- <h1>comment</h1> -->
<h1>Invoices that <em>chase</em> themselves</h1><p>Acme sends invoices and chases late payers for freelancers who would rather be working.</p>
<h2>How it works</h2><h3>Step one &amp; two</h3>
<a href="/about">About</a> <a href="https://www.linkedin.com/in/jane-doe/">Jane</a> <a href="https://twitter.com/intent/tweet?x=1">share</a> <a href="https://x.com/acme">X</a>
<img src="a.png" alt="x"><img src="b.png" alt="Dashboard">
</body></html>`

describe('parseHtml', () => {
  const p = parseHtml(HTML, 'https://acme.test/')
  it('reads head tags', () => {
    expect(p.lang).toBe('en')
    expect(p.title).toBe('Acme | Invoicing for freelancers')
    expect(p.metaDescription).toMatch(/^Acme sends invoices/)
    expect(p.canonical).toBe('https://acme.test/')
    expect(p.og['og:image']).toBe('https://acme.test/og.png')
    expect(p.twitter['twitter:card']).toBe('summary_large_image')
    expect(p.viewport).toContain('width=device-width')
  })
  it('collects JSON-LD types including graphs and arrays', () => {
    expect(p.jsonLdTypes.sort()).toEqual(['Organization', 'SoftwareApplication', 'WebApplication'])
  })
  it('ignores headings inside scripts and comments and decodes entities', () => {
    expect(p.headings.map((h) => [h.level, h.text])).toEqual([[1, 'Invoices that chase themselves'], [2, 'How it works'], [3, 'Step one & two']])
  })
  it('counts images without alt text and finds the first paragraph', () => {
    expect(p.imgCount).toBe(2)
    expect(p.imgNoAlt).toBe(0)
    expect(p.firstParagraph).toMatch(/^Acme sends invoices/)
  })
  it('finds profile links and skips share intents', () => {
    expect(profileLinks(p.links)).toEqual(['https://linkedin.com/in/jane-doe', 'https://x.com/acme'])
  })
  it('survives broken markup', () => {
    expect(() => parseHtml('<div <a href="x>< <meta name=description content="unterminated', 'https://a.test/')).not.toThrow()
  })
})

describe('robots', () => {
  it('uses the most specific group and longest match', () => {
    const rules = parseRobots('User-agent: *\nDisallow: /\n\nUser-agent: AmplibeeBot\nDisallow: /private\nAllow: /private/open', 'AmplibeeBot')
    expect(isAllowed(rules, '/pricing')).toBe(true)
    expect(isAllowed(rules, '/private/x')).toBe(false)
    expect(isAllowed(rules, '/private/open/y')).toBe(true)
  })
  it('supports wildcards and end anchors', () => {
    const rules = parseRobots('User-agent: *\nDisallow: /*.pdf$', '*')
    expect(isAllowed(rules, '/a/b.pdf')).toBe(false)
    expect(isAllowed(rules, '/a/b.pdf?x=1')).toBe(true)
  })
  it('detects a site-wide block', () => {
    expect(blocksEverything('User-agent: *\nDisallow: /')).toBe(true)
    expect(blocksEverything('User-agent: *\nDisallow:')).toBe(false)
  })
})

function goodTech() {
  return analyzeTechnical({
    finalUrl: 'https://acme.test/', status: 200, page: parseHtml(HTML, 'https://acme.test/'),
    sitemap: { status: 200, valid: true }, robots: { status: 200, text: 'User-agent: *\nAllow: /' },
    ogImage: { url: 'https://acme.test/og.png', status: 200 }, aboutLinks: [], aboutFound: true,
  })
}

describe('analyzeTechnical', () => {
  it('passes a well formed page', () => {
    const t = goodTech()
    expect(t.checks.filter((c) => !c.pass)).toEqual([])
    expect(t.passed).toBe(t.total)
  })
  it('flags a missing OG image and robots block', () => {
    const page = parseHtml('<html><head><title>Hi</title></head><body><p>x</p></body></html>', 'https://acme.test/')
    const t = analyzeTechnical({
      finalUrl: 'http://acme.test/', status: 200, page, sitemap: { status: 404, valid: false },
      robots: { status: 200, text: 'User-agent: *\nDisallow: /' }, ogImage: null, aboutLinks: [], aboutFound: false,
    })
    const failed = t.checks.filter((c) => !c.pass).map((c) => c.id)
    expect(failed).toEqual(expect.arrayContaining(['https', 'title', 'description', 'canonical', 'og_image', 'sitemap', 'robots', 'structured_data', 'headings', 'viewport', 'lang', 'og_type']))
    expect(t.checks.find((c) => c.id === 'robots')?.value).toBe('blocked')
  })
})

describe('scoring', () => {
  it('weights sum to 100', () => {
    expect(Object.values(SCORING.weights).reduce((a, b) => a + b, 0)).toBe(100)
  })
  it('weighted skips nulls and rescales', () => {
    expect(weighted([[1, 10], [null, 90]])).toBe(100)
    expect(weighted([[0.5, 1], [1, 1]])).toBe(75)
    expect(weighted([[null, 1]])).toBeNull()
  })
  it('scores rank on a log scale', () => {
    expect(rankValue(1000)).toBe(1)
    expect(rankValue(10_000)).toBe(1)
    expect(rankValue(1_000_000)).toBe(0)
    expect(rankValue(100_000)).toBeCloseTo(0.5, 5)
    expect(rankValue(null)).toBe(0)
    expect(rankValue(undefined)).toBeNull()
  })
  it('gives 100 when every measurement is at target', () => {
    const r = scoreMetrics({
      directories_listed: 5, indexed: 10, rank: 5000, tech: { https: true, title: true }, speed: 100, web: 10, hn: 5, github: 5, social: 10,
      profiles: true, structured: true, about: true, reviews: 5, competitors: [{ web: 10, hn: 5, github: 5, social: 10 }],
    })
    expect(r.total).toBe(100)
  })
  it('gives 0 when everything measured is empty', () => {
    const r = scoreMetrics({
      directories_listed: 0, indexed: 0, rank: null, tech: { https: false }, speed: 0, web: 0, hn: 0, github: 0, social: 0,
      profiles: false, structured: false, about: false, reviews: 0, competitors: [],
    })
    expect(r.total).toBe(0)
  })
  it('returns null when nothing was measured', () => {
    const r = scoreMetrics({ directories_listed: null, indexed: null, rank: undefined, tech: null, speed: null, web: null, hn: null, github: null, social: null, profiles: null, structured: null, about: null, reviews: null, competitors: [] })
    expect(r.total).toBeNull()
  })
  it('compares buzz with competitors, and a full-marks benchmark when there are none', () => {
    const me: TargetScan = { domain: 'me.test', hn: { count: 3, top: [] }, github: { count: 3, top: [] } }
    const weak: TargetScan = { domain: 'weak.test', hn: { count: 1, top: [] }, github: { count: 1, top: [] } }
    const strong: TargetScan = { domain: 'strong.test', hn: { count: 5, top: [] }, github: { count: 5, top: [] } }
    const alone = scoreScan(me, []).sub.buzz as number
    expect(scoreScan(me, [weak]).sub.buzz).toBeGreaterThan(alone)
    expect(scoreScan(me, [strong]).sub.buzz).toBe(alone)
  })
  it('compares only the mention types measured on both sides', () => {
    const me: TargetScan = { domain: 'me.test', hn: { count: 5, top: [] }, github: { count: 5, top: [] }, web: { count: 0, top: [] } }
    const rival: TargetScan = { domain: 'rival.test', hn: { count: 5, top: [] }, github: { count: 5, top: [] } }
    const m = scanToMetrics(me, [rival])
    expect(m.competitors[0].web).toBeNull()
    expect(scoreMetrics(m).sub.buzz).toBeGreaterThan(0)
  })
})

describe('buildGaps', () => {
  const self: TargetScan = {
    domain: 'acme.test',
    technical: { ...goodTech(), checks: goodTech().checks.map((c) => (c.id === 'og_image' ? { ...c, pass: false, value: null } : c)) },
    hn: { count: 0, top: [] }, github: { count: 3, top: [] }, web: { count: 2, top: [] },
    indexing: { count: 0, provider: 'brave', query: 'site:acme.test' }, rank: { rank: null },
  }
  const rival: TargetScan = { domain: 'rival.test', hn: { count: 4, top: [] }, github: { count: 2, top: [] }, web: { count: 9, top: [] } }
  const gaps = buildGaps({ self, competitors: [rival], directories: [], oneLiner: 'Invoicing for freelancers.' })

  it('writes messages with real numbers', () => {
    expect(gaps.find((g) => g.id === 'og_image')?.message).toBe('Your homepage has no OG image, so links look blank on LinkedIn and X.')
    expect(gaps.find((g) => g.id === 'web_mentions')?.message).toContain('2 pages')
    expect(gaps.find((g) => g.id === 'behind_competitor')?.message).toContain('rival.test has 15')
  })
  it('estimates impact as the point gain from fixing the gap', () => {
    const before = scoreScan(self, [rival]).total as number
    const og = gaps.find((g) => g.id === 'og_image')!
    expect(og.impact).toBeGreaterThan(0)
    expect(og.impact).toBeLessThanOrEqual(100 - before)
  })
  it('puts high severity first and attaches Oyekool prefill only to campaign gaps', () => {
    expect(gaps[0].severity).toBe('high')
    for (const g of gaps) if (g.fix_type === 'oyekool_campaign') expect(g.oyekool?.brief).toBeTruthy()
    expect(gaps.filter((g) => g.oyekool).every((g) => g.fix_type === 'oyekool_campaign' || g.fix_type === 'review_collection')).toBe(true)
  })
  it('never writes banned words or dashes into messages', () => {
    for (const g of gaps) expect(g.message).not.toMatch(/—|!|leverage|seamless|AI-powered/i)
  })
  it('scanToMetrics treats unmeasured fields as null', () => {
    const m = scanToMetrics({ domain: 'x.test' })
    expect(m.indexed).toBeNull()
    expect(m.rank).toBeUndefined()
    expect(m.tech).toBeNull()
  })
})
