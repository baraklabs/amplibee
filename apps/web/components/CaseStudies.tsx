import Link from 'next/link'
import type { CSSProperties } from 'react'
import { CASE_STUDIES, type CaseStudy, caseThumb, caseTone, getFacts } from '../lib/content/case-studies.ts'

/** The first letter of a name in a circle, or the photo when there is one. */
export function CaseAvatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img className="avatar" src={src} alt="" width={size} height={size} loading="lazy" />
  return <span className="avatar" aria-hidden="true">{name.trim()[0]}</span>
}

/**
 * One study as a card: a small label, the title and a short description on the left, and on the right an image that
 * runs to the card's edge. The image is the study's own thumbnail when it has one; otherwise a dark block with the
 * product's name and what it is. The title link covers the whole card.
 */
function CaseRow({ s }: { s: CaseStudy }) {
  const c = getFacts(s)
  const thumb = caseThumb(s)
  return (
    <article className="cs-row" style={{ '--dark': caseTone(s) } as CSSProperties}>
      <div className="cs-row-text">
        <span className="cs-kicker">{c.sub}</span>
        <h3 className="cs-row-title"><Link className="cs-row-link" href={`/case-studies/${s.slug}`}>{s.headline}</Link></h3>
        <p className="cs-row-sum">{s.summary}</p>
      </div>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cs-row-thumb" src={thumb} alt="" width={440} height={231} loading="lazy" decoding="async" />
      ) : (
        <div className="cs-row-thumb cs-ph" aria-hidden="true">
          <strong>{c.name}</strong>
          {s.tagline ? <span>{s.tagline}</span> : null}
        </div>
      )}
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
