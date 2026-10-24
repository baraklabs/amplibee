// Case studies at /case-studies and /case-studies/<slug>.
// Everything here comes from what the customer said in their own post, the results they reported, and the
// product's own launch page. Do not add a claim that none of those support. Update `updated` when you change an entry.

import customersData from '../../data/customers.json'

export interface CaseStat {
  value: string
  label: string
}

export interface CaseStudy {
  slug: string
  /** The person, as written in data/customers.json. */
  customer: string
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
  sections: { h: string; body: string[] }[]
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

export const CASE_STUDIES: CaseStudy[] = [
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

const customers = customersData as Customer[]

export function getCustomer(s: CaseStudy): Customer {
  const c = customers.find((x) => x.name === s.customer)
  if (!c) throw new Error(`case study ${s.slug}: no customer named ${s.customer} in data/customers.json`)
  return c
}

export const getCaseStudy = (slug: string) => CASE_STUDIES.find((s) => s.slug === slug)

/** The thumbnail is optional: only studies whose product has a launch page get one. */
export const caseThumb = (s: CaseStudy) => (s.launchSlug ? `/launches/${s.launchSlug}-thumb.webp` : undefined)
export const caseImage = (s: CaseStudy) => (s.launchSlug ? `/launches/${s.launchSlug}-og.jpg` : undefined)
