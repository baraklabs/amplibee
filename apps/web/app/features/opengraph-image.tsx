import { ImageResponse } from 'next/og'
import { OG_SIZE } from '../../lib/og.tsx'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Amplibee features'

/** The share image of the features page. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#0f3d33', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 120, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2 }}>Features</div>
        <div style={{ fontSize: 46, lineHeight: 1.3, marginTop: 28, opacity: 0.78 }}>Check, fix and grow your product’s visibility</div>
      </div>
    ),
    OG_SIZE,
  )
}
