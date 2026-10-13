// Every gap message is a hand-written template filled with real numbers from the scan.

import { OYEKOOL_PRICE_USD } from './fixes.config.ts'
import { SCORING } from './scoring.config.ts'
import { type Metrics, scanToMetrics, scoreMetrics } from './scoring.ts'
import type { DirectoryRow, Gap, OyekoolTask, PlanItem, TargetScan } from './types.ts'

interface Ctx {
  self: TargetScan
  competitors: TargetScan[]
  directories: DirectoryRow[]
  oneLiner: string
}

type Draft = Omit<Gap, 'impact' | 'severity'> & { fix: (m: Metrics) => Metrics; baseSeverity?: Gap['severity'] }

const withTech = (id: string) => (m: Metrics): Metrics => ({ ...m, tech: m.tech ? { ...m.tech, [id]: true } : m.tech })

function oyekool(task: OyekoolTask, brief: string) {
  return { task, brief, price_usd: OYEKOOL_PRICE_USD[task] }
}

const n = (v: number) => v.toLocaleString('en-US')

export function buildGaps(ctx: Ctx): Gap[] {
  const { self, competitors, oneLiner } = ctx
  const d = self.domain
  const drafts: Draft[] = []
  const t = self.technical

  if (t && !t.reachable) {
    drafts.push({
      id: 'site_unreachable', category: 'technical', baseSeverity: 'high', fix_type: 'free_guide', fix_ref: 'technical-basics',
      message: `We could not load https://${d}/ (${t.error ?? 'no response'}). Nothing on the page could be checked until it loads.`,
      fix: (m) => m,
    })
  }

  if (t && t.reachable) {
    for (const c of t.checks) {
      if (c.pass) continue
      const v = c.value
      const base = { category: 'technical' as const, fix: withTech(c.id), fix_type: 'free_guide' as const }
      switch (c.id) {
        case 'https':
          drafts.push({ ...base, id: 'https', baseSeverity: 'high', fix_ref: 'technical-basics', message: `Your site loads over plain HTTP at ${t.final_url}. Browsers show a warning and search engines prefer the secure version.` })
          break
        case 'title':
          drafts.push({ ...base, id: 'title', fix_ref: 'technical-basics', message: v === 0 ? 'Your homepage has no title tag, so search results show a bare URL.' : `Your homepage title is ${n(Number(v))} characters. Search results cut titles near 65, and under 10 says little about the product.` })
          break
        case 'description':
          drafts.push({ ...base, id: 'description', fix_ref: 'technical-basics', message: v === 0 ? 'Your homepage has no meta description, so search engines pick a snippet from the page text.' : `Your meta description is ${n(Number(v))} characters. Aim for 50 to 160 so it is not cut off or ignored.` })
          break
        case 'canonical':
          drafts.push({ ...base, id: 'canonical', fix_ref: 'technical-basics', message: 'Your homepage declares no canonical URL, so duplicate versions of it can split ranking signals.' })
          break
        case 'og_tags':
          drafts.push({ ...base, id: 'og_tags', fix_ref: 'what-an-og-image-is', message: `Your homepage is missing ${(v as string[]).length === 1 ? 'this Open Graph tag' : 'these Open Graph tags'}: ${(v as string[]).join(', ')}. Shared links show less than they could.` })
          break
        case 'og_image':
          drafts.push({ ...base, id: 'og_image', fix_ref: 'what-an-og-image-is', message: 'Your homepage has no OG image, so links look blank on LinkedIn and X.' })
          break
        case 'og_image_reachable':
          drafts.push({ ...base, id: 'og_image_reachable', fix_ref: 'what-an-og-image-is', message: `Your OG image returned status ${n(Number(v))} when we requested it, so shared links will look blank.` })
          break
        case 'twitter_card':
          drafts.push({ ...base, id: 'twitter_card', fix_ref: 'what-an-og-image-is', message: 'Your homepage has no twitter:card tag, so X shows a small default preview.' })
          break
        case 'sitemap':
          drafts.push({ ...base, id: 'sitemap', fix_ref: 'technical-basics', message: `No sitemap.xml was found at https://${d}/sitemap.xml (status ${n(Number(v))}). Crawlers find new pages more slowly without one.` })
          break
        case 'robots':
          if (v === 'blocked') drafts.push({ ...base, id: 'robots_blocked', baseSeverity: 'high', fix_ref: 'technical-basics', message: 'Your robots.txt disallows every crawler from /, so search engines are told not to index the site.' })
          else drafts.push({ ...base, id: 'robots', fix_ref: 'technical-basics', message: `No robots.txt was found at https://${d}/robots.txt (status ${n(Number(v))}). Add one so crawlers know what they may read and where the sitemap is.` })
          break
        case 'structured_data':
          drafts.push({ ...base, id: 'structured_data', fix_ref: 'technical-basics', message: 'Your homepage has no JSON-LD structured data, so search engines and answer engines get no machine-readable facts about the product.' })
          break
        case 'headings':
          drafts.push({ ...base, id: 'headings', fix_ref: 'technical-basics', message: typeof v === 'string' ? `Your homepage heading levels jump from ${v}, skipping a level. Screen readers and crawlers use the order to read the page.` : Number(v) === 0 ? 'Your homepage has no h1 heading, so the main topic of the page is not marked.' : `Your homepage has ${n(Number(v))} h1 headings. Use one, and nest the rest below it.` })
          break
        case 'lang':
          drafts.push({ ...base, id: 'lang', fix_ref: 'technical-basics', message: 'Your homepage html tag has no lang attribute, so screen readers and search engines have to guess the language of the page.' })
          break
        case 'image_alt':
          drafts.push({ ...base, id: 'image_alt', fix_ref: 'technical-basics', message: `${n(Number(v))} ${Number(v) === 1 ? 'image' : 'images'} on your homepage ${Number(v) === 1 ? 'has' : 'have'} no alt text, so screen readers skip them and image search cannot read them.` })
          break
        case 'indexable':
          drafts.push({ ...base, id: 'indexable', baseSeverity: 'high', fix_ref: 'technical-basics', message: 'Your homepage has a noindex robots tag, so search engines are told to leave it out of results.' })
          break
        case 'og_type':
          drafts.push({ ...base, id: 'og_type', fix_ref: 'what-an-og-image-is', message: 'Your homepage has no og:type tag, so link previews cannot tell whether it is a website or an article.' })
          break
        case 'viewport':
          drafts.push({ ...base, id: 'viewport', fix_ref: 'technical-basics', message: 'Your homepage has no viewport meta tag, so phones render it as a shrunken desktop page.' })
          break
      }
    }
  }

  if (self.speed && self.speed.score < 90) {
    const s = self.speed
    const lcp = s.lcp_ms === null ? '' : ` Largest content paints at ${(s.lcp_ms / 1000).toFixed(1)} s.`
    drafts.push({
      id: 'speed', category: 'technical', fix_type: 'free_guide', fix_ref: 'technical-basics', baseSeverity: s.score < 50 ? 'high' : undefined,
      message: `Your mobile performance score is ${n(s.score)} of 100.${lcp} Slow pages lose visitors before they read anything.`,
      fix: (m) => ({ ...m, speed: 100 }),
    })
  }

  // Discoverability
  if (self.directories) {
    const k = self.directories
    const target = SCORING.discoverability.directoriesTarget
    if (k.listed.length < target) {
      const unlisted = ctx.directories.filter((x) => !k.listed.includes(x.slug) && x.submit_url).sort((a, b) => a.priority - b.priority).slice(0, 3).map((x) => x.slug)
      drafts.push({
        id: 'directories', category: 'discoverability', fix_type: 'directory_submission', fix_ref: unlisted.join(','),
        message: `We confirmed ${n(k.listed.length)} listings across the ${n(k.checked)} directories we looked at${k.unknown.length ? `. ${n(k.unknown.length)} of them could not be confirmed automatically, so they may hold a listing we did not see` : ''}.${competitors.length ? competitorDirNote(self, competitors) : ''} Listings give buyers and crawlers a second place to find you.`,
        fix: (m) => ({ ...m, directories_listed: Math.max(m.directories_listed ?? 0, target) }),
      })
    }
  }
  if (self.indexing) {
    const c = self.indexing.count
    const target = SCORING.discoverability.indexingTarget
    if (c < target) {
      drafts.push({
        id: 'indexing', category: 'discoverability', fix_type: 'free_guide', fix_ref: 'technical-basics', baseSeverity: c === 0 ? 'high' : undefined,
        message: c === 0 ? `Search returned no results for site:${d}, so the site may not be indexed yet. Submit the sitemap in Google Search Console.` : `Search returned ${n(c)} results for site:${d}. The check reads up to ${n(target)}, so more pages may need to be found.`,
        fix: (m) => ({ ...m, indexed: target }),
      })
    }
  }
  if (self.rank && self.rank.rank === null) {
    drafts.push({
      id: 'rank', category: 'discoverability', fix_type: 'content', fix_ref: 'first-mentions', baseSeverity: 'low',
      message: `${d} is not in the top 100,000 sites. That is normal for a new product. It means few other sites link to you yet.`,
      fix: (m) => ({ ...m, rank: 100_000 }),
    })
  }

  // Buzz
  if (self.web && self.web.count < 5) {
    drafts.push({
      id: 'web_mentions', category: 'buzz', fix_type: 'oyekool_campaign', fix_ref: 'first-mentions',
      message: `Search found ${n(self.web.count)} pages outside your own site that mention ${d}.`,
      oyekool: oyekool('write', `Write an article or post about ${d}. ${oneLiner} Link to https://${d}/ and describe what the product does and who it is for.`),
      fix: (m) => ({ ...m, web: Math.max(m.web ?? 0, SCORING.buzz.caps.web) }),
    })
  }
  if (self.hn && self.hn.count === 0) {
    drafts.push({
      id: 'hn', category: 'buzz', fix_type: 'free_guide', fix_ref: 'first-mentions',
      message: `No Hacker News stories link to ${d}. A Show HN post is a free way to start.`,
      fix: (m) => ({ ...m, hn: 1 }),
    })
  }
  if (self.github && self.github.count === 0) {
    drafts.push({
      id: 'github', category: 'buzz', fix_type: 'free_guide', fix_ref: 'first-mentions', baseSeverity: 'low',
      message: `No public GitHub repositories mention ${d} in their README. Developer tools usually show up there first.`,
      fix: (m) => ({ ...m, github: 1 }),
    })
  }
  const social: [keyof TargetScan, string, string, OyekoolTask][] = [
    ['reddit', 'reddit', 'Reddit threads', 'post'],
    ['linkedin', 'linkedin', 'LinkedIn posts', 'post'],
    ['x', 'x', 'X posts', 'post'],
  ]
  for (const [key, id, label, task] of social) {
    const s = self[key] as { count: number } | undefined
    if (s && s.count === 0) {
      drafts.push({
        id: `${id}_mentions`, category: 'buzz', fix_type: 'oyekool_campaign', fix_ref: 'first-mentions',
        message: `Search found no ${label} that mention ${d}.`,
        oyekool: oyekool(task, `Post about ${d} on ${id === 'x' ? 'X' : id === 'linkedin' ? 'LinkedIn' : 'Reddit'}. ${oneLiner} Share one concrete use of the product and link to https://${d}/.`),
        fix: (m) => ({ ...m, social: Math.max(m.social ?? 0, SCORING.buzz.caps.social) }),
      })
    }
  }
  const strongest = strongestCompetitor(competitors)
  if (strongest) {
    const mine = totalMentions(self)
    drafts.push({
      id: 'behind_competitor', category: 'buzz', fix_type: 'oyekool_campaign', fix_ref: 'first-mentions',
      message: `${strongest.domain} has ${n(strongest.total)} Hacker News, GitHub and web mentions combined. ${d} has ${n(mine)}.`,
      oyekool: oyekool('write', `Write a comparison or use-case post that puts ${d} next to alternatives such as ${strongest.domain}. ${oneLiner} Link to https://${d}/.`),
      fix: (m) => ({ ...m, hn: Math.max(m.hn ?? 0, 1), web: Math.max(m.web ?? 0, 5) }),
    })
  }

  // Trust
  if (self.reviews && self.reviews.count === 0) {
    drafts.push({
      id: 'reviews', category: 'trust', fix_type: 'review_collection', fix_ref: 'first-mentions',
      message: `Search found no review-site pages (G2, Trustpilot, Capterra, Product Hunt) that mention ${d}.`,
      oyekool: oyekool('engage', `Try ${d} and leave an honest review on a public review site. ${oneLiner}`),
      fix: (m) => ({ ...m, reviews: SCORING.trust.reviewsTarget }),
    })
  }
  if (t && t.reachable && t.profile_links.length === 0) {
    drafts.push({
      id: 'profiles', category: 'trust', fix_type: 'content', fix_ref: 'first-mentions',
      message: 'Your homepage and about page link to no LinkedIn or X profile, so visitors cannot see who is behind the product.',
      fix: (m) => ({ ...m, profiles: true }),
    })
  }
  if (t && t.reachable && !t.about_found) {
    drafts.push({
      id: 'about', category: 'trust', fix_type: 'content', fix_ref: 'first-mentions',
      message: `No about page was found at https://${d}/about and the homepage links to none. Buyers look for who runs a product before they pay.`,
      fix: (m) => ({ ...m, about: true }),
    })
  }

  // Estimate impact by re-scoring with the gap fixed.
  const base = scanToMetrics(self, competitors)
  const before = scoreMetrics(base).exact ?? 0
  const gaps: Gap[] = drafts.map(({ fix, baseSeverity, ...g }) => {
    const after = scoreMetrics(fix(base)).exact ?? before
    const impact = Math.max(0, Math.round((after - before) * 10) / 10)
    const severity = baseSeverity ?? (impact >= SCORING.severity.high ? 'high' : impact >= SCORING.severity.medium ? 'medium' : 'low')
    return { ...g, severity, impact }
  })

  const rank = { high: 0, medium: 1, low: 2 }
  // A gap whose fix changes nothing (the measure is already at its cap) is noise, unless it blocks everything.
  return gaps.filter((x) => x.impact > 0 || x.severity === 'high').sort((a, b) => rank[a.severity] - rank[b.severity] || b.impact - a.impact)
}

function totalMentions(s: TargetScan): number {
  return (s.hn?.count ?? 0) + (s.github?.count ?? 0) + (s.web?.count ?? 0)
}

function strongestCompetitor(cs: TargetScan[]): { domain: string; total: number } | null {
  let best: { domain: string; total: number } | null = null
  for (const c of cs) {
    const total = totalMentions(c)
    if (!best || total > best.total) best = { domain: c.domain, total }
  }
  return best && best.total > 0 ? best : null
}

function competitorDirNote(self: TargetScan, cs: TargetScan[]): string {
  const counts = cs.filter((c) => c.directories).map((c) => c.directories!.listed.length)
  if (!counts.length) return ''
  const avg = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)
  return ` Your competitors average ${n(avg)}.`
}

/** One plan item per gap, pointing at a guide, a directory page or an Oyekool campaign. */
export function buildPlan(gaps: Gap[]): PlanItem[] {
  return gaps.map((g) => {
    const href = g.fix_type === 'directory_submission' ? undefined : g.fix_ref ? `/blog/${g.fix_ref}` : undefined
    return { gap_id: g.id, title: planTitle(g), fix_type: g.fix_type, href: href ? href : undefined, oyekool: g.oyekool }
  })
}

const TITLES: Record<string, string> = {
  site_unreachable: 'Make the homepage load for crawlers',
  https: 'Serve the site over HTTPS',
  title: 'Write a title tag of 10 to 65 characters',
  description: 'Write a meta description of 50 to 160 characters',
  canonical: 'Add a canonical link',
  og_tags: 'Add the missing Open Graph tags',
  og_image: 'Add an OG image of 1200 by 630 pixels',
  og_image_reachable: 'Fix the OG image address',
  twitter_card: 'Add a twitter:card tag',
  sitemap: 'Publish sitemap.xml and submit it',
  robots: 'Publish robots.txt with a sitemap line',
  robots_blocked: 'Remove the site-wide Disallow from robots.txt',
  structured_data: 'Add JSON-LD for the organization and product',
  headings: 'Use one h1 and keep heading levels in order',
  viewport: 'Add the viewport meta tag',
  lang: 'Set the lang attribute on the html tag',
  image_alt: 'Add alt text to every image',
  indexable: 'Remove the noindex tag from the homepage',
  og_type: 'Add an og:type tag',
  speed: 'Fix the slowest mobile page elements',
  directories: 'Submit to the directories listed below',
  indexing: 'Submit the sitemap in Google Search Console',
  rank: 'Earn links from sites that already rank',
  web_mentions: 'Get written about outside your own site',
  hn: 'Post a Show HN',
  github: 'Mention the product in a public README',
  reddit_mentions: 'Start a Reddit thread that fits the community rules',
  linkedin_mentions: 'Publish a LinkedIn post',
  x_mentions: 'Publish a post on X',
  behind_competitor: 'Close the mention gap with a comparison post',
  reviews: 'Collect your first public reviews',
  profiles: 'Link founder or company profiles from the site',
  about: 'Publish an about page',
}

function planTitle(g: Gap): string {
  return TITLES[g.id] ?? g.message
}

/** Launch checklist for people without a website. The inputs are the three fields they filled in. */
export function launchChecklist(input: { sells: string; customer?: string; markets?: string }): string[] {
  const customer = input.customer || 'your ideal customers'
  return [
    `Buy a domain and put up one page that says what you sell: ${input.sells}.`,
    `Write the one-line pitch for ${customer} and use it as the page title and meta description.`,
    `Set up HTTPS, a sitemap.xml, a robots.txt and an OG image before you share the link.`,
    `Submit to the directories in the plan below, starting with the first three.`,
    `Post a Show HN or a community post that fits the rules where ${customer} already spend time.`,
    `Add links to your own LinkedIn or X profile on the site so buyers see who is behind it.`,
    input.markets
      ? `List the markets you want (${input.markets}) on the page in plain words, and add the matching currency and legal pages.`
      : `Decide which markets you want to sell in and list them on the page in plain words.`,
    `Run Amplibee again once the site is live to get a score.`,
  ]
}
