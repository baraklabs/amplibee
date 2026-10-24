// Case studies at /case-studies and /case-studies/<slug>. There are two kinds:
// - customer stories: what the customer said in their own post, the results they reported, and the product's own
//   launch page. Do not add a claim that none of those support.
// - example checks: real Amplibee checks of well-known products from data/examples.json. Every number is read from
//   that file, so a story can never disagree with the data. These are not customers and are labeled that way.
// Update `updated` when you change an entry.

import customersData from '../../data/customers.json'
import examplesData from '../../data/examples.json'
import { dateLabel, firstSentence, num } from '../format.ts'

export interface CaseStat {
  value: string
  label: string
}

export interface CaseStudy {
  slug: string
  /** The person, as written in data/customers.json. Set for a customer story. */
  customer?: string
  /** The checked site. Set for an example check. */
  domain?: string
  /** The product they work on, when they named one. */
  product?: string
  /** The matching page under /launches, when the product is listed there. It also supplies the thumbnail. */
  launchSlug?: string
  /** One line for the card and the page heading. */
  headline: string
  /** Two sentences for the card and the meta description. */
  summary: string
  /** YYYY-MM-DD */
  updated: string
  sections: { h: string; body: string[]; bullets?: string[] }[]
}

/** What a card or page needs to show about who a study is about, whichever kind it is. */
export interface CaseFacts {
  name: string
  sub: string
  avatar?: string
  stats: CaseStat[]
  quote?: string
  url?: string
  platform?: 'linkedin' | 'x'
  /** True for an example check, which is not a customer. */
  example: boolean
}

interface Customer {
  name: string
  company: string
  quote: string
  url?: string
  platform?: 'linkedin' | 'x'
  avatar?: string
  stats: CaseStat[]
}

interface Example {
  domain: string
  score: number | null
  sub_scores: Record<string, number | null>
  gap_total: number
  top_gap: string | null
  rank: number | null
  hn: number | null
  github: number | null
  tech_passed: number | null
  tech_total: number | null
}

const customers = customersData as Customer[]
const examples = examplesData as unknown as { taken_at: string; items: Example[] }

const CUSTOMER_STORIES: CaseStudy[] = [
  {
    slug: 'indiecrew',
    customer: 'Ethical Daddy',
    product: 'IndieCrew',
    launchSlug: 'indiecrew',
    headline: 'IndieCrew went from 2 of the top 10 directories to 8 more submitted',
    summary: 'IndieCrew was listed on only 2 of the top 10 directories. Amplibee listed the ones it was missing, 8 directories were submitted, and its flow of clients went up.',
    updated: '2026-10-24',
    sections: [
      {
        h: 'The starting point',
        body: ['IndieCrew is a community where indie founders help each other win customers. When its founder checked it, the product was present on only 2 of the top 10 directories.'],
      },
      {
        h: 'What changed',
        body: [
          'Amplibee listed the directories that IndieCrew was missing, with a submission page for each one. The founder worked through that list and submitted to 8 directories.',
          'In the founder’s words, that increased IndieCrew’s flow of clients.',
        ],
      },
    ],
  },
  {
    slug: 'nativeship',
    customer: 'Bhavy Shekhaliya',
    product: 'NativeShip',
    launchSlug: 'nativeship',
    headline: 'NativeShip found a blocked folder and a missing sitemap before launch day',
    summary: 'A robots.txt rule blocked a folder by mistake and NativeShip had no sitemap. The Amplibee check found both before launch day instead of after.',
    updated: '2026-10-24',
    sections: [
      {
        h: 'The starting point',
        body: ['NativeShip helps SaaS products ship an official n8n integration. Ahead of its launch, the team ran its site through an Amplibee check.'],
      },
      {
        h: 'What the check found',
        body: [
          'Two technical issues that search engines and answer engines would have run into: a robots.txt rule that blocked a folder by mistake, and no sitemap.',
          'Both were found before launch day instead of after. The founder also said the log of requests made the result easy to trust.',
        ],
      },
    ],
  },
  {
    slug: 'edgevolume',
    customer: 'Prayag B',
    product: 'EdgeVolume',
    launchSlug: 'edgevolume',
    headline: 'EdgeVolume fixed 3 gaps and submitted 2 directory listings',
    summary: 'EdgeVolume picked two directory listings and fixed three of the gaps that Amplibee suggested.',
    updated: '2026-10-24',
    sections: [
      {
        h: 'The starting point',
        body: ['EdgeVolume is a Mac utility that changes the volume from the edge of the trackpad. Its maker ran an Amplibee check to see where the product was easy to miss.'],
      },
      {
        h: 'What changed',
        body: ['The check listed the gaps and the directories to submit to. The maker chose two directory listings and fixed three of the gaps Amplibee suggested.'],
      },
    ],
  },
  {
    slug: 'stas',
    customer: 'Stas',
    headline: 'Stas located local competitors and fixed 4 gaps',
    summary: 'Amplibee helped Stas find the local competitors that matter, and the SEO and other details were updated to match. Four gaps were fixed.',
    updated: '2026-10-24',
    sections: [
      {
        h: 'The starting point',
        body: ['Stas needed to know who the local competitors were before deciding what to change on the site.'],
      },
      {
        h: 'What changed',
        body: ['Amplibee mapped where those competitors are listed and talked about. Using that, Stas updated the SEO and other details and fixed 4 gaps.'],
      },
    ],
  },
]

const SUB_LABEL: Record<string, string> = { discoverability: 'Discoverability', buzz: 'Buzz', trust: 'Trust', technical: 'Technical' }
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

function exampleStudy(e: Example): CaseStudy {
  const score = e.score === null ? 'no score' : `${e.score} out of 100`
  const found: string[] = []
  if (e.tech_passed !== null && e.tech_total !== null) found.push(`${e.tech_passed} of ${e.tech_total} page checks passed`)
  found.push(e.rank ? `Domain rank ${num(e.rank)}` : 'Not in the top 100,000 sites')
  if (e.hn !== null) found.push(`${num(e.hn)} Hacker News ${plural(e.hn, 'story', 'stories')}`)
  if (e.github !== null) found.push(`${num(e.github)} GitHub ${plural(e.github, 'mention', 'mentions')}`)
  found.push(`${e.gap_total} ${plural(e.gap_total, 'gap', 'gaps')} left to fix`)

  const sections: CaseStudy['sections'] = [
    {
      h: 'What this is',
      body: [
        `This is an example check, not a customer. We ran the same Amplibee check you would run on ${e.domain}, a well-known public product, on ${dateLabel(examples.taken_at)}.`,
        'Search and speed checks needed API keys that were not set for these runs, so the score rests on the page, directory, rank and mention checks only.',
      ],
    },
    {
      h: 'The score',
      body: [`${e.domain} scored ${score}. The score is made of four parts.`],
      bullets: Object.entries(SUB_LABEL).map(([k, label]) => `${label}: ${e.sub_scores[k] ?? '-'} of 100`),
    },
    { h: 'What the check found', body: [], bullets: found },
  ]
  if (e.top_gap) sections.push({ h: 'The largest gap', body: [e.top_gap] })

  const largest = e.top_gap ? ` The largest: ${firstSentence(e.top_gap).replace(/^We /, 'we ')}` : ''
  return {
    slug: `check-${e.domain.replace(/[^a-z0-9]+/g, '-')}`,
    domain: e.domain,
    headline: `What an Amplibee check found on ${e.domain}`,
    summary: `${e.domain} scored ${score} in an example check and has ${e.gap_total} ${plural(e.gap_total, 'gap', 'gaps')} left.${largest}`,
    updated: examples.taken_at,
    sections,
  }
}

/** Customer stories first, then the example checks. */
export const CASE_STUDIES: CaseStudy[] = [...CUSTOMER_STORIES, ...examples.items.map(exampleStudy)]

export function getFacts(s: CaseStudy): CaseFacts {
  if (s.domain) {
    const e = examples.items.find((x) => x.domain === s.domain)
    if (!e) throw new Error(`case study ${s.slug}: no example for ${s.domain} in data/examples.json`)
    const stats: CaseStat[] = [
      { value: e.score === null ? '-' : String(e.score), label: 'visibility score out of 100' },
      { value: String(e.gap_total), label: plural(e.gap_total, 'gap found', 'gaps found') },
    ]
    if (e.tech_passed !== null && e.tech_total !== null) stats.push({ value: `${e.tech_passed}/${e.tech_total}`, label: 'page checks passed' })
    return { name: e.domain, sub: 'Example check', stats, example: true }
  }
  const c = customers.find((x) => x.name === s.customer)
  if (!c) throw new Error(`case study ${s.slug}: no customer named ${s.customer} in data/customers.json`)
  return { name: c.name, sub: s.product ?? c.company, avatar: c.avatar, stats: c.stats, quote: c.quote, url: c.url, platform: c.platform, example: false }
}

export const getCaseStudy = (slug: string) => CASE_STUDIES.find((s) => s.slug === slug)

/** The thumbnail is optional: only studies whose product has a launch page get one. Same 1200x630 ratio as the share image. */
export const caseThumb = (s: CaseStudy) => (s.launchSlug ? `/launches/${s.launchSlug}-thumb.webp` : undefined)
export const caseImage = (s: CaseStudy) => (s.launchSlug ? `/launches/${s.launchSlug}-og.jpg` : undefined)
