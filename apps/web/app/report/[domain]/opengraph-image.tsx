import { api } from '../../../lib/api.ts'
import { OG_SIZE, ogCard } from '../../../lib/og.tsx'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Amplibee visibility score'

export default async function Image({ params }: { params: Promise<{ domain: string }> }) {
  const domain = decodeURIComponent((await params).domain)
  let score: string | undefined
  try {
    const r = await api.report(domain)
    if (r.report.score !== null) score = String(r.report.score)
  } catch {
    // no public report: render the card without a score
  }
  return ogCard({ kicker: 'Visibility report', title: domain, big: score, foot: score ? undefined : 'Visibility report' })
}
