import { OG_SIZE, ogCard } from '../lib/og.tsx'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Amplibee: get your product launch on auto-pilot'

export default function Image() {
  return ogCard({ kicker: 'Free visibility check', title: 'Get Your Product Launch on Auto-Pilot', foot: 'Directories, indexing, mentions and page basics, compared with your competitors.' })
}
