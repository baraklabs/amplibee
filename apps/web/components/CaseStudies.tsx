import Link from 'next/link'
import type { CSSProperties } from 'react'
import { CASE_STUDIES, type CaseStudy, caseThumb, caseTone, getFacts } from '../lib/content/case-studies.ts'
// caseThumb and caseTone are used by CaseImage below

/** The first letter of a name in a circle, or the photo when there is one. */
export function CaseAvatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img className="avatar" src={src} alt="" width={size} height={size} loading="lazy" />
  return <span className="avatar" aria-hidden="true">{name.trim()[0]}</span>
}

/**
 * The study's image: its own thumbnail when it has one; otherwise a dark block with the use case and what the
 * check found, in the share image's shape. One component so the list, the page and the related cards always agree.
 */
export function CaseImage({ s, className = '', eager = false }: { s: CaseStudy; className?: string; eager?: boolean }) {
  const thumb = caseThumb(s)
  if (thumb) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={`cs-img ${className}`} src={thumb} alt={s.name} width={1200} height={630} loading={eager ? 'eager' : 'lazy'} decoding="async" />
  }
  return (
    <div className={`cs-img cs-ph ${className}`} style={{ '--dark': caseTone(s) } as CSSProperties} role="img" aria-label={`${s.name}: ${s.tagline}`}>
      <strong>{s.name}</strong>
      {s.tagline ? <span>{s.tagline}</span> : null}
    </div>
  )
}

/**
 * One study as a card: a small label, the title and a short description on the left, and on the right an image that
 * runs to the card's edge. The title link covers the whole card.
 */
function CaseRow({ s }: { s: CaseStudy }) {
  const c = getFacts(s)
  return (
    <article className="cs-row">
      <div className="cs-row-text">
        <span className="cs-kicker">{c.sub}</span>
        <h3 className="cs-row-title"><Link className="cs-row-link" href={`/case-studies/${s.slug}`}>{s.headline}</Link></h3>
        <p className="cs-row-sum">{s.summary}</p>
      </div>
      <CaseImage s={s} className="cs-row-thumb" />
    </article>
  )
}

/** A smaller card for the related studies under a study: image on top, then label, title and a short description. */
export function CaseRelCard({ s }: { s: CaseStudy }) {
  return (
    <article className="cs-rel">
      <CaseImage s={s} className="cs-rel-img" />
      <div className="cs-rel-body">
        <span className="cs-kicker">{getFacts(s).sub}</span>
        <h3><Link className="cs-row-link" href={`/case-studies/${s.slug}`}>{s.headline}</Link></h3>
        <p>{s.summary}</p>
      </div>
    </article>
  )
}

/** A short call to action that sits inside the list, so nobody has to reach the end to act. */
export function CaseCta() {
  return (
    <aside className="cs-cta" aria-label="Launch your product">
      <div>
        <strong>Want results like these?</strong>
        <span>Check your product for free and see which gaps to fix first.</span>
      </div>
      <Link className="btn" href="/launch-your-product">Submit your product</Link>
    </aside>
  )
}

/** The list of studies, with a call to action after the 5th one when the list is longer than that. */
export function CaseList({ items = CASE_STUDIES }: { items?: CaseStudy[] }) {
  const AFTER = 5
  const rows = items.map((s) => <CaseRow s={s} key={s.slug} />)
  return (
    <div className="cs-list">
      {rows.slice(0, AFTER)}
      {items.length > AFTER ? <CaseCta /> : null}
      {rows.slice(AFTER)}
    </div>
  )
}
