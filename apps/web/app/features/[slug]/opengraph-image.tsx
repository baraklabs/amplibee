import { ImageResponse } from 'next/og'
import { FEATURES, getFeature } from '../../../lib/content/features.ts'
import { OG_SIZE } from '../../../lib/og.tsx'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Amplibee feature'

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }))
}

/** The share image of a feature: its name and a line about it, centered on its own dark color. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const f = getFeature((await params).slug)
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: f?.tone ?? '#1d1d1b', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 120, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2 }}>{f?.name ?? 'Features'}</div>
        {f?.tagline ? <div style={{ fontSize: 46, lineHeight: 1.3, marginTop: 28, opacity: 0.78 }}>{f.tagline}</div> : null}
      </div>
    ),
    OG_SIZE,
  )
}
