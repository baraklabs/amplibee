// Case studies at /case-studies and /case-studies/<slug>.
// Each one is a real Amplibee check of a well-known product, from data/examples.json. Every number is read from that
// file, so a story can never disagree with the data. These are not customers and are labeled that way.

import examplesData from '../../data/examples.json'
import { dateLabel, firstSentence, num } from '../format.ts'

export interface CaseStat {
  value: string
  label: string
}

export interface CaseStudy {
  slug: string
  /** The checked site, as written in data/examples.json. */
  domain: string
  /** What the checked product is, in a few words. Shown under the name on the generated thumbnail and share image. */
  tagline: string
  /** One line for the row and the page heading. */
  headline: string
  /** Two sentences for the row and the meta description. */
  summary: string
  /** YYYY-MM-DD */
  updated: string
  sections: { h: string; body: string[]; bullets?: string[] }[]
  /** Optional thumbnail and share image paths (1200x630 ratio). Without them the row is text only. */
  thumb?: string
  image?: string
}

/** What a row or page shows about who a study is about. */
export interface CaseFacts {
  name: string
  sub: string
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

const examples = examplesData as unknown as { taken_at: string; items: Example[] }

/** A few plain words on what each checked product is. A product missing here just shows no line. */
const PRODUCT_LINE: Record<string, string> = {
  'linear.app': 'Issue tracking for software teams',
  'plausible.io': 'Privacy-friendly website analytics',
  'resend.com': 'Email API for developers',
  'posthog.com': 'Open-source product analytics',
}

/** Each study gets its own color: a light one for its block in the list and a dark one for its generated image. */
export const TONES = [
  { light: '#dbf5ec', dark: '#0f3d33' },
  { light: '#fbeed0', dark: '#4a3410' },
  { light: '#e3e8fb', dark: '#1f2a5c' },
  { light: '#f8e1e6', dark: '#4d1f2e' },
]
export const caseTone = (s: CaseStudy) => TONES[Math.max(0, CASE_STUDIES.indexOf(s)) % TONES.length]

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
    tagline: PRODUCT_LINE[e.domain] ?? '',
    headline: `What an Amplibee check found on ${e.domain}`,
    summary: `${e.domain} scored ${score} in an example check and has ${e.gap_total} ${plural(e.gap_total, 'gap', 'gaps')} left.${largest}`,
    updated: examples.taken_at,
    sections,
  }
}

export const CASE_STUDIES: CaseStudy[] = examples.items.map(exampleStudy)

export function getFacts(s: CaseStudy): CaseFacts {
  const e = examples.items.find((x) => x.domain === s.domain)
  if (!e) throw new Error(`case study ${s.slug}: no example for ${s.domain} in data/examples.json`)
  const stats: CaseStat[] = [
    { value: e.score === null ? '-' : String(e.score), label: 'visibility score out of 100' },
    { value: String(e.gap_total), label: plural(e.gap_total, 'gap found', 'gaps found') },
  ]
  if (e.tech_passed !== null && e.tech_total !== null) stats.push({ value: `${e.tech_passed}/${e.tech_total}`, label: 'page checks passed' })
  return { name: e.domain, sub: 'Example check', stats }
}

export const getCaseStudy = (slug: string) => CASE_STUDIES.find((s) => s.slug === slug)
/** A real screenshot, when the study has one. Without it the list draws a card from the app name and title. */
export const caseThumb = (s: CaseStudy) => s.thumb
/** The share image: the study's own, or the generated card at /case-studies/<slug>/opengraph-image. */
export const caseImage = (s: CaseStudy) => s.image ?? `/case-studies/${s.slug}/opengraph-image`
