// Case studies at /case-studies and /case-studies/<slug>.
// Each one is a real Amplibee check of a well-known product, from data/examples.json. Every number is read from that
// file, so a story can never disagree with the data. The product's name is left out on purpose: each study is
// described by its use case instead, and the page says it is a real check of a well-known product, not a customer.

import examplesData from '../../data/examples.json'
import { dateLabel, firstSentence, num } from '../format.ts'

export interface CaseStat {
  value: string
  label: string
}

export interface CaseStudy {
  slug: string
  /** The checked site in data/examples.json. Used only to look up the numbers; never shown. */
  domain: string
  /** The use case, shown as the study's name. */
  name: string
  /** Shown under the name on the generated thumbnail and share image. */
  tagline: string
  /** One line for the card and the page heading. */
  headline: string
  /** Two sentences for the card and the meta description. */
  summary: string
  /** YYYY-MM-DD */
  updated: string
  sections: { h: string; body: string[]; bullets?: string[] }[]
  /** Optional thumbnail and share image paths (1200x630 ratio). Without them the card draws one from the name and tagline. */
  thumb?: string
  image?: string
}

/** What a card or page shows about a study. */
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

/** The use case for each checked product: its name as a title, as a slug, and as a phrase in a sentence. */
const USE_CASES: Record<string, { name: string; slug: string; noun: string }> = {
  'linear.app': { name: 'Project management', slug: 'project-management', noun: 'project management tool' },
  'plausible.io': { name: 'Website analytics', slug: 'website-analytics', noun: 'website analytics tool' },
  'resend.com': { name: 'Developer email', slug: 'developer-email', noun: 'email service for developers' },
  'posthog.com': { name: 'Product analytics', slug: 'product-analytics', noun: 'product analytics platform' },
  'vercel.com': { name: 'App hosting', slug: 'app-hosting', noun: 'app hosting platform' },
  'supabase.com': { name: 'Backend platform', slug: 'backend-platform', noun: 'backend platform' },
  'cal.com': { name: 'Scheduling', slug: 'scheduling', noun: 'scheduling tool' },
  'clerk.com': { name: 'User sign-in', slug: 'user-sign-in', noun: 'sign-in and user management service' },
}

/** Each study gets its own dark color for its generated thumbnail and share image. */
export const TONES = ['#0f3d33', '#4a3410', '#1f2a5c', '#4d1f2e', '#0e3f4a', '#3b1f5c', '#27303f', '#3a4010']
export const caseTone = (s: CaseStudy) => TONES[Math.max(0, CASE_STUDIES.indexOf(s)) % TONES.length]

const SUB_LABEL: Record<string, string> = { discoverability: 'Discoverability', buzz: 'Buzz', trust: 'Trust', technical: 'Technical' }
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function exampleStudy(e: Example): CaseStudy {
  const use = USE_CASES[e.domain] ?? { name: 'Software product', slug: e.domain.replace(/[^a-z0-9]+/g, '-'), noun: 'software product' }
  const score = e.score === null ? 'no score' : `${e.score} out of 100`
  const gaps = `${e.gap_total} ${plural(e.gap_total, 'gap', 'gaps')}`
  const found: string[] = []
  if (e.tech_passed !== null && e.tech_total !== null) found.push(`${e.tech_passed} of ${e.tech_total} page checks passed`)
  found.push(e.rank ? `Domain rank ${num(e.rank)}` : 'Not in the top 100,000 sites')
  if (e.hn !== null) found.push(`${num(e.hn)} Hacker News ${plural(e.hn, 'story', 'stories')}`)
  if (e.github !== null) found.push(`${num(e.github)} GitHub ${plural(e.github, 'mention', 'mentions')}`)
  found.push(`${gaps} left to fix`)

  const sections: CaseStudy['sections'] = [
    {
      h: 'What this is',
      body: [
        `This is a real check of a well-known public product, not a customer story. We ran the same Amplibee check you would run on your own product on ${dateLabel(examples.taken_at)}, and left the product’s name out.`,
        'Search and speed checks needed API keys that were not set for these runs, so the score rests on the page, directory, rank and mention checks only.',
      ],
    },
    {
      h: 'The score',
      body: [`This ${use.noun} scored ${score}. The score is made of four parts.`],
      bullets: Object.entries(SUB_LABEL).map(([k, label]) => `${label}: ${e.sub_scores[k] ?? '-'} of 100`),
    },
    { h: 'What the check found', body: [], bullets: found },
  ]
  if (e.top_gap) sections.push({ h: 'The largest gap', body: [e.top_gap] })

  const largest = e.top_gap ? ` The largest: ${firstSentence(e.top_gap).replace(/^We /, 'we ')}` : ''
  return {
    slug: use.slug,
    domain: e.domain,
    name: use.name,
    tagline: e.score === null ? 'Visibility check' : `Visibility check: ${e.score} out of 100`,
    headline: `${cap(/^[aeiou]/.test(use.noun) ? 'an' : 'a')} ${use.noun} scored ${score} with ${gaps} left to fix`,
    summary: `A well-known ${use.noun} went through the same visibility check you can run on your own product. It scored ${score} and has ${gaps} left.${largest}`,
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
  return { name: s.name, sub: 'Case study', stats }
}

export const getCaseStudy = (slug: string) => CASE_STUDIES.find((s) => s.slug === slug)

/** A real screenshot, when the study has one. Without it the list draws a card from the name and tagline. */
export const caseThumb = (s: CaseStudy) => s.thumb
/** The share image: the study's own, or the generated card at /case-studies/<slug>/opengraph-image. */
export const caseImage = (s: CaseStudy) => s.image ?? `/case-studies/${s.slug}/opengraph-image`
