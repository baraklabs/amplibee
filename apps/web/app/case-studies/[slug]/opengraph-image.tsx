import { ImageResponse } from 'next/og'
import { CASE_STUDIES, caseTone, getCaseStudy } from '../../../lib/content/case-studies.ts'
import { OG_SIZE } from '../../../lib/og.tsx'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Case study'

export function generateStaticParams() {
  return CASE_STUDIES.map((s) => ({ slug: s.slug }))
}

/** The share image for a study without a screenshot: the product's name and what it is, centered on its own dark color. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const s = getCaseStudy((await params).slug)
  const bg = s ? caseTone(s) : '#1d1d1b'
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: bg, color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 120, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2 }}>{s?.domain ?? 'Case study'}</div>
        {s?.tagline ? <div style={{ fontSize: 46, lineHeight: 1.3, marginTop: 28, opacity: 0.78 }}>{s.tagline}</div> : null}
      </div>
    ),
    OG_SIZE,
  )
}
