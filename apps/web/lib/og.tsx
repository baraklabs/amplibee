import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

const PAPER = '#f6f5f3'
const INK = '#1d1d1b'
const MUTED = '#62605a'
const HONEY = '#10b981'

let logoUri = ''
function logo(): string {
  if (!logoUri) {
    try {
      logoUri = `data:image/png;base64,${readFileSync(join(process.cwd(), 'public', 'logo.png')).toString('base64')}`
    } catch {
      logoUri = ''
    }
  }
  return logoUri
}

/** One card layout for every page: label top left, big text bottom left, honey rule, wordmark. */
export function ogCard(o: { kicker: string; title: string; big?: string; foot?: string }) {
  const long = o.title.length > 48
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: PAPER, color: INK, display: 'flex', flexDirection: 'column', padding: 72, borderLeft: `18px solid ${HONEY}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30, color: MUTED, letterSpacing: 2, textTransform: 'uppercase' }}>
          <span>{o.kicker}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14, color: INK, fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
            {logo() ? <img src={logo()} width={64} height={64} alt="" /> : null}
            Amplibee
          </span>
        </div>
        <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: o.big ? 700 : 1000 }}>
            <div style={{ fontSize: long ? 60 : 78, lineHeight: 1.05, fontWeight: 600 }}>{o.title}</div>
            {o.foot ? <div style={{ fontSize: 30, color: MUTED, marginTop: 24 }}>{o.foot}</div> : null}
          </div>
          {o.big ? (
            <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: `10px solid ${HONEY}`, paddingBottom: 6 }}>
              <span style={{ fontSize: 220, lineHeight: 1, fontWeight: 600 }}>{o.big}</span>
              <span style={{ fontSize: 56, color: MUTED, marginLeft: 8 }}>/100</span>
            </div>
          ) : null}
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
