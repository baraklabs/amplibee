export interface Plan {
  id: 'free' | 'starter' | 'plus' | 'growth' | 'scale' | 'authority'
  name: string
  monthly: number // US dollars per month
  blurb: string
  includes?: string // "Everything in ..." line shown above the features
  features: string[]
}

/** Annual billing is twelve months for the price of ten: two months free. */
export const ANNUAL_PAID_MONTHS = 10

export const annualTotal = (monthly: number) => monthly * ANNUAL_PAID_MONTHS
/** What annual billing works out to per month, rounded to whole dollars. */
export const annualPerMonth = (monthly: number) => Math.round(annualTotal(monthly) / 12)

/** The comparison table. A string is shown as text, true as a tick and false as "not included". */
export type Cell = string | boolean
export const COMPARE: { label: string; values: [Cell, Cell, Cell, Cell, Cell, Cell] }[] = [
  { label: 'Gaps per check', values: ['3', '5', '10', '10', '10', '10'] },
  { label: 'Competitors to compare', values: ['3', '5', '10', '20', '50', '100'] },
  { label: 'Checks a day', values: ['2', '5', '10', '10', '10', '10'] },
  { label: 'Domain ranking', values: [true, true, true, true, true, true] },
  { label: 'Brand visibility score', values: [true, true, true, true, true, true] },
  { label: 'Extra checks: Reddit, LinkedIn, X and review sites', values: [false, false, false, true, true, true] },
  { label: 'Customised launch plan', values: [false, false, false, true, true, true] },
  { label: 'Directory submissions', values: [false, '3', '10', '50', '100', '150+'] },
  { label: 'Analytics', values: [false, '7 days', '7 days', '7 days', '7 days', '1 month, with tracking'] },
  { label: 'Keywords tracked', values: [false, '10', '20', '20', '50', '100'] },
  { label: 'AI visibility: Google Search, ChatGPT, Perplexity, Gemini and more', values: [false, false, false, false, false, true] },
  { label: 'Prompts tracked daily', values: [false, false, false, false, false, '50'] },
  { label: 'Team collaboration and admin', values: [false, false, false, false, true, true] },
  { label: 'Blog posts written', values: [false, false, '1', '4', '20, with images', '45 a month, with images'] },
]

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    blurb: 'See how visible your product is and where the first gaps are.',
    features: [
      '3 gaps per check',
      'Compare with 3 competitors',
      '2 checks a day',
      'Domain ranking',
      'Brand visibility score',
      'Live log of every request',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    monthly: 10,
    blurb: 'Keep an eye on your keywords and your closest competitors.',
    includes: 'Everything in Free, with',
    features: [
      '5 gaps per check',
      'Compare with 5 competitors',
      '5 checks a day',
      'Track 10 keywords',
      '3 directory submissions',
      '7 days of analytics',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    monthly: 40,
    blurb: 'Wider tracking, a full set of competitors and your first blog post.',
    includes: 'Everything in Starter, with',
    features: [
      '10 gaps per check',
      'Compare with 10 competitors',
      '10 checks a day',
      'Track 20 keywords',
      '10 directory submissions',
      '7 days of analytics',
      '1 blog post written',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    monthly: 90,
    blurb: 'Every check goes further, and the launch plan is built for your product.',
    includes: 'Everything in Free, with',
    features: [
      '10 gaps per check',
      'Compare with 20 competitors',
      '10 checks a day',
      'Track 20 keywords',
      'Extra checks: Reddit, LinkedIn, X and review sites',
      'Customised launch plan',
      '50 directory submissions',
      '7 days of analytics',
      '4 blog posts written',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    monthly: 240,
    blurb: 'More listings and more content, done for you.',
    features: [
      '10 gaps per check',
      'Compare with 50 competitors',
      '10 checks a day',
      'Track 50 keywords',
      'Extra checks: Reddit, LinkedIn, X and review sites',
      'Customised launch plan',
      '100 directory submissions',
      '7 days of analytics',
      '20 blog posts written, with images',
      'Team collaboration and admin',
    ],
  },
  {
    id: 'authority',
    name: 'Authority',
    monthly: 490,
    blurb: 'A full launch and a steady stream of content, with tracking.',
    features: [
      '10 gaps per check',
      'Compare with 100 competitors',
      '10 checks a day',
      'Track 100 keywords',
      'Extra checks: Reddit, LinkedIn, X and review sites',
      'Customised launch plan',
      '150+ directory submissions',
      '1 month of analytics and tracking',
      'AI visibility: Google Search, ChatGPT, Perplexity, Gemini and more',
      '50 prompts tracked daily',
      '45 blog posts a month, with images',
    ],
  },
]
