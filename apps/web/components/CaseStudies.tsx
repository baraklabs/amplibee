import Link from 'next/link'
import { CASE_STUDIES, type CaseStudy, caseThumb, getCustomer } from '../lib/content/case-studies.ts'
import { StatValue } from './StatValue.tsx'

/** The first letter of a name in a circle, or the photo when there is one. */
export function CaseAvatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img className="avatar" src={src} alt="" width={size} height={size} loading="lazy" />
  return <span className="avatar" aria-hidden="true">{name.trim()[0]}</span>
}

/** One study in the list. The title link covers the whole card; the thumbnail is shown only when the study has one. */
function CaseCard({ s }: { s: CaseStudy }) {
  const c = getCustomer(s)
  const thumb = caseThumb(s)
  return (
    <article className="card cs-card">
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cs-thumb" src={thumb} alt="" width={800} height={420} loading="lazy" decoding="async" />
      ) : null}
      <div className="cs-card-body">
        <header className="cust-head">
          <CaseAvatar name={c.name} src={c.avatar} />
          <div>
            <strong>{c.name}</strong>
            <span className="muted">{s.product ?? c.company}</span>
          </div>
        </header>
        <h2 className="cs-card-title"><Link className="cs-card-link" href={`/case-studies/${s.slug}`}>{s.headline}</Link></h2>
        <p className="muted cs-card-sum">{s.summary}</p>
        <div className="cs-card-stats">
          {c.stats.slice(0, 2).map((x) => (
            <span key={x.label}><strong><StatValue value={x.value} /></strong> {x.label}</span>
          ))}
        </div>
        <span className="cs-more" aria-hidden="true">Read the case study →</span>
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
  const cards = items.map((s) => <CaseCard s={s} key={s.slug} />)
  return (
    <div className="cs-list">
      {cards.slice(0, AFTER)}
      {items.length > AFTER ? <CaseCta /> : null}
      {cards.slice(AFTER)}
    </div>
  )
}
