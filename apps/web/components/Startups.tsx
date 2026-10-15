// "Latest product launches on Amplibee". Reads apps/web/data/startups.json, the same data locally and in production.
// Without data the section is not rendered.

import Link from 'next/link'
import startupsData from '../data/startups.json'
import { launchSlugForDomain } from '../lib/content/launches.ts'

export interface Startup {
  name: string
  domain: string
  url?: string // when set, the card links to the product
  tagline: string
  category: string
  launched: string // YYYY-MM
  score?: number
  logo?: string // optional real logo path; otherwise a symbol mark is drawn from the name
}

export const startups = startupsData as Startup[]

/** How many cards the home page shows. */
const SHOWN = 16

const PALETTE = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#22c55e', '#3b82f6', '#a855f7', '#eab308', '#06b6d4', '#e11d48', '#84cc16']

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

// Symbols drawn in white inside a 44 by 44 box. Each one reads like a simple product logo.
const SYMBOLS: ((accent: string) => React.ReactNode)[] = [
  () => <circle cx="22" cy="22" r="8" fill="none" stroke="#fff" strokeWidth="4" />, // ring
  () => (
    <g fill="#fff">
      <rect x="11" y="23" width="6" height="10" rx="2" />
      <rect x="19" y="16" width="6" height="17" rx="2" />
      <rect x="27" y="10" width="6" height="23" rx="2" />
    </g>
  ), // rising bars
  () => <path d="M10 25c4-9 8-9 12 0s8 9 12 0" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />, // wave
  () => <path d="M24 8 13 24h8l-2 12 12-17h-8z" fill="#fff" />, // bolt
  () => (
    <g fill="none" stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="m22 10 12 6-12 6-12-6z" />
      <path d="m10 23 12 6 12-6" />
      <path d="m10 30 12 6 12-6" opacity="0.7" />
    </g>
  ), // stacked layers
  () => <path d="M22 11v22M13 20l9-9 9 9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />, // arrow up
  () => <path d="M11 13h22a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H22l-7 6v-6h-4a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2z" fill="#fff" />, // chat bubble
  () => <path d="M12 31c0-11 7-18 20-19 0 13-7 20-20 19zM12 31 22 21" fill="#fff" stroke="none" />, // leaf
  () => (
    <g fill="#fff">
      <circle cx="14" cy="14" r="3.4" />
      <circle cx="30" cy="14" r="3.4" />
      <circle cx="14" cy="30" r="3.4" />
      <circle cx="30" cy="30" r="3.4" />
      <circle cx="22" cy="22" r="3.4" />
    </g>
  ), // dot grid
  () => <path d="M22 9a13 13 0 1 0 0 26z" fill="#fff" />, // half circle
  (accent) => (
    <g>
      <path d="M22 8l4.6 9.4L37 19l-7.5 7.3 1.8 10.3L22 31.4l-9.3 5.2 1.8-10.3L7 19l10.4-1.6z" fill="#fff" />
      <circle cx="22" cy="22" r="3" fill={accent} />
    </g>
  ), // star
  () => <path d="M13 12v20M13 22h18M31 12v20" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />, // H frame
]

/** A generated logo: a coloured shape with a symbol, chosen from the name so it is stable. */
function Mark({ name, index, size = 44 }: { name: string; index: number; size?: number }) {
  const h = hash(name)
  const bg = PALETTE[h % PALETTE.length]
  const shape = (h >>> 4) % 4
  const accent = PALETTE[(h >>> 8) % PALETTE.length]
  // by position, so neighbouring cards never share a symbol
  const Symbol = SYMBOLS[index % SYMBOLS.length]
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} role="img" aria-label={`${name} logo`} className="su-mark">
      {shape === 0 ? <rect width="44" height="44" rx="12" fill={bg} /> : null}
      {shape === 1 ? <circle cx="22" cy="22" r="22" fill={bg} /> : null}
      {shape === 2 ? <path d="M22 1.5 40 11.8v20.4L22 42.5 4 32.2V11.8Z" fill={bg} /> : null}
      {shape === 3 ? <rect width="44" height="44" rx="22" fill={bg} /> : null}
      {Symbol(accent)}
    </svg>
  )
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function Card({ s, index }: { s: Startup; index: number }) {
  // The name and the card open the product's detail page; only the address opens the product's own site.
  const slug = launchSlugForDomain(s.domain)
  return (
    <li className={`su-card${slug ? ' su-card-link' : ''}`}>
      <div className="su-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {s.logo ? <img className="su-mark" src={s.logo} alt="" width={44} height={44} loading="lazy" /> : <Mark name={s.name} index={index} />}
        <div className="su-id">
          {slug ? <Link className="su-name" href={`/launches/${slug}`}>{s.name}</Link> : <strong>{s.name}</strong>}
          {s.url ? (
            <a className="su-site muted" href={s.url} target="_blank" rel="noopener">{s.domain}</a>
          ) : (
            <span className="muted">{s.domain}</span>
          )}
        </div>
        {s.score !== undefined ? <span className="su-score" title="Visibility score">{s.score}</span> : null}
      </div>
      <p className="su-tag">{s.tagline}</p>
      <div className="su-foot">
        <span className="tag">{s.category}</span>
        <span className="muted">Launched {monthLabel(s.launched)}</span>
      </div>
    </li>
  )
}

/** Every launch as a card grid. */
export function StartupGrid({ items }: { items: Startup[] }) {
  return (
    <ul className="su-grid">
      {items.map((s, i) => <Card key={s.domain} s={s} index={i} />)}
    </ul>
  )
}

export function StartupsLaunched() {
  if (!startups.length) return null
  return (
    <section className="section" aria-labelledby="su-h">
      <div className="wrap">
        <h2 id="su-h" style={{ textAlign: 'center', borderTop: 0 }}>Latest product launches with Amplibee</h2>
        <p className="measure" style={{ margin: '8px auto 0', textAlign: 'center' }}>Products that checked their visibility, closed the gaps and launched. The number on each card is the visibility score at launch.</p>
        <StartupGrid items={startups.slice(0, SHOWN)} />
        <p style={{ textAlign: 'center', marginTop: 20 }}><Link className="btn small" href="/launches">Browse all launches</Link></p>
      </div>
    </section>
  )
}
