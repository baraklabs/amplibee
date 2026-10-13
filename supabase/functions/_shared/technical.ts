import type { ParsedPage } from './html.ts'
import { profileLinks } from './html.ts'
import { blocksEverything } from './robots.ts'
import type { TechCheck, TechnicalResult } from './types.ts'

export interface TechInputs {
  finalUrl: string
  status: number
  page: ParsedPage
  sitemap: { status: number; valid: boolean }
  robots: { status: number; text: string | null }
  ogImage: { url: string; status: number } | null // null when the page declares none or the test was skipped
  aboutLinks: string[]
  aboutFound: boolean
}

export function headingProblem(h: { level: number }[]): { h1: number; skip: string | null } {
  const h1 = h.filter((x) => x.level === 1).length
  let prev = 0
  for (const x of h) {
    if (prev && x.level > prev + 1) return { h1, skip: `h${prev} to h${x.level}` }
    prev = x.level
  }
  return { h1, skip: null }
}

export function analyzeTechnical(i: TechInputs): TechnicalResult {
  const { page } = i
  const checks: TechCheck[] = []
  const add = (id: string, pass: boolean, detail: string, value?: TechCheck['value']) => checks.push({ id, pass, detail, value })

  add('https', i.finalUrl.startsWith('https:'), i.finalUrl.startsWith('https:') ? 'Served over HTTPS.' : `Served over plain HTTP at ${i.finalUrl}.`, i.finalUrl)

  const tl = (page.title ?? '').length
  add('title', tl >= 10 && tl <= 65, tl === 0 ? 'No title tag.' : `Title is ${tl} characters.`, tl)

  const dl = (page.metaDescription ?? '').length
  add('description', dl >= 50 && dl <= 160, dl === 0 ? 'No meta description.' : `Meta description is ${dl} characters.`, dl)

  add('canonical', !!page.canonical, page.canonical ? `Canonical is ${page.canonical}.` : 'No canonical link.', page.canonical)

  const missing = ['og:title', 'og:description', 'og:url'].filter((k) => !page.og[k])
  add('og_tags', missing.length === 0, missing.length ? `Missing ${missing.join(', ')}.` : 'og:title, og:description and og:url are set.', missing)

  const ogImg = page.og['og:image'] || ''
  add('og_image', !!ogImg, ogImg ? `og:image is ${ogImg}.` : 'No og:image.', ogImg || null)
  if (ogImg && i.ogImage) {
    const ok = i.ogImage.status >= 200 && i.ogImage.status < 300
    add('og_image_reachable', ok, ok ? 'The OG image loads.' : `The OG image returned status ${i.ogImage.status}.`, i.ogImage.status)
  }

  add('twitter_card', !!page.twitter['twitter:card'], page.twitter['twitter:card'] ? `twitter:card is ${page.twitter['twitter:card']}.` : 'No twitter:card.', page.twitter['twitter:card'] ?? null)

  add('sitemap', i.sitemap.status === 200 && i.sitemap.valid, i.sitemap.status === 200 && i.sitemap.valid ? 'sitemap.xml is present.' : `sitemap.xml returned status ${i.sitemap.status}.`, i.sitemap.status)

  const rtxt = i.robots.text
  const blocked = i.robots.status === 200 && rtxt !== null && blocksEverything(rtxt)
  add('robots', i.robots.status === 200 && !blocked, blocked ? 'robots.txt blocks all crawlers.' : i.robots.status === 200 ? 'robots.txt is present.' : `robots.txt returned status ${i.robots.status}.`, blocked ? 'blocked' : i.robots.status)

  add('structured_data', page.jsonLdTypes.length > 0, page.jsonLdTypes.length ? `JSON-LD types: ${page.jsonLdTypes.join(', ')}.` : 'No JSON-LD structured data.', page.jsonLdTypes)

  const hp = headingProblem(page.headings)
  add('headings', hp.h1 === 1 && !hp.skip, hp.h1 !== 1 ? `${hp.h1} h1 headings.` : hp.skip ? `Heading levels skip from ${hp.skip}.` : 'One h1 and no skipped levels.', hp.h1 !== 1 ? hp.h1 : hp.skip)

  add('viewport', !!page.viewport, page.viewport ? 'Viewport meta tag is set.' : 'No viewport meta tag.', page.viewport)

  add('lang', !!page.lang, page.lang ? `Page language is ${page.lang}.` : 'No lang attribute on the html tag.', page.lang)

  const missingAlt = page.imgNoAlt
  add('image_alt', missingAlt === 0, missingAlt === 0 ? (page.imgCount ? 'Every image has alt text.' : 'No images to check.') : `${missingAlt} of ${page.imgCount} images have no alt text.`, missingAlt)

  const noindex = /(^|[\s,])noindex([\s,]|$)/i.test(page.robotsMeta ?? '')
  add('indexable', !noindex, noindex ? 'A robots meta tag says noindex.' : 'No noindex tag.', noindex ? 'noindex' : null)

  add('og_type', !!page.og['og:type'], page.og['og:type'] ? `og:type is ${page.og['og:type']}.` : 'No og:type.', page.og['og:type'] ?? null)

  const links = [...page.links, ...i.aboutLinks]
  return {
    reachable: true,
    final_url: i.finalUrl,
    status: i.status,
    checks,
    passed: checks.filter((c) => c.pass).length,
    total: checks.length,
    profile_links: profileLinks(links).slice(0, 6),
    about_found: i.aboutFound,
    title: page.title,
    description: page.metaDescription,
  }
}

export function unreachable(finalUrl: string, status: number, error: string): TechnicalResult {
  return { reachable: false, error, final_url: finalUrl, status, checks: [], passed: 0, total: 0, profile_links: [], about_found: false, title: null, description: null }
}
