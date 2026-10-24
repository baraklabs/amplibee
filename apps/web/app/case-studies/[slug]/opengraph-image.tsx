import { CASE_STUDIES, getCaseStudy, getFacts } from '../../../lib/content/case-studies.ts'
import { OG_SIZE, ogCard } from '../../../lib/og.tsx'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Amplibee case study'

export function generateStaticParams() {
  return CASE_STUDIES.map((s) => ({ slug: s.slug }))
}

/** The share image for a study without a screenshot: the app name, the title and the score. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const s = getCaseStudy((await params).slug)
  if (!s) return ogCard({ kicker: 'Case study', title: 'Case study' })
  const score = getFacts(s).stats[0]?.value
  return ogCard({ kicker: 'Case study', title: s.domain, foot: s.headline, ...(score && score !== '-' ? { big: score } : {}) })
}
