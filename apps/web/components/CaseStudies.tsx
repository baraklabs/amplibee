import Link from 'next/link'
import { CASE_STUDIES, type CaseStudy, caseThumb, getFacts } from '../lib/content/case-studies.ts'
import { StatValue } from './StatValue.tsx'

/** The first letter of a name in a circle, or the photo when there is one. */
export function CaseAvatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img className="avatar" src={src} alt="" width={size} height={size} loading="lazy" />
  return <span className="avatar" aria-hidden="true">{name.trim()[0]}</span>
}

/**
 * One study as a row, like a post in a feed: who it is about, the title and a short summary on the left, and on the
 * right a thumbnail in the share image's shape. The thumbnail is optional; without one the text uses the full row.
 * The title link covers the whole row.
 */
function CaseRow({ s }: { s: CaseStudy }) {
  const c = getFacts(s)
  const thumb = caseThumb(s)
  return (
    <article className="cs-row">
      <div className="cs-row-text">
        <header className="cs-row-who">
          <CaseAvatar name={c.name} size={24} />
          <strong>{c.name}</strong>
          <span className="muted">· {c.sub}</span>
        </header>
        <h3 className="cs-row-title"><Link className="cs-row-link" href={`/case-studies/${s.slug}`}>{s.headline}</Link></h3>
        <p className="cs-row-sum">{s.summary}</p>
        <div className="cs-row-meta">
          {c.stats.slice(0, 2).map((x) => (
            <span className="cs-chip" key={x.label}><strong><StatValue value={x.value} /></strong> {x.label}</span>
          ))}
        </div>
      </div>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cs-row-thumb" src={thumb} alt="" width={240} height={126} loading="lazy" decoding="async" />
      ) : null}
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
