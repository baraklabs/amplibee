import { GUIDES, getGuide } from '../../../lib/content/guides.ts'
import { OG_SIZE, ogCard } from '../../../lib/og.tsx'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Amplibee blog post'

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug)
  return ogCard({ kicker: 'Blog', title: g?.title ?? 'Blog', foot: g ? `Updated ${g.updated}` : undefined })
}
