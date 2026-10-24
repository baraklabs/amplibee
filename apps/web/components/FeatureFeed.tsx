import Link from 'next/link'
import { HeroArt } from './HeroArt.tsx'
import { FEATURES, type Feature, featureImage } from '../lib/content/features.ts'

/** One feature as a row: a label, the title and the description on the left, the share image on the right. */
function FeatureRow({ f }: { f: Feature }) {
  return (
    <article className="cs-row">
      <div className="cs-row-text">
        <span className="cs-kicker">{f.name}</span>
        <h3 className="cs-row-title"><Link className="cs-row-link" href={`/features/${f.slug}`}>{f.headline}</Link></h3>
        <p className="cs-row-sum">{f.summary}</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cs-img cs-row-thumb" src={featureImage(f)} alt={f.name} width={1200} height={630} loading="lazy" decoding="async" />
    </article>
  )
}

/** A short call to action inside the list, so nobody has to reach the end to act. */
function FeatureCta() {
  return (
    <aside className="cs-cta" aria-label="Check your product">
      <HeroArt />
      <div className="cs-cta-text">
        <strong>See these features on your product.</strong>
        <span>Check it for free and see which gaps to fix first.</span>
      </div>
      <Link className="btn cs-cta-btn" href="/launch-your-product">Submit your product</Link>
    </aside>
  )
}

export function FeatureList({ items = FEATURES }: { items?: Feature[] }) {
  const AFTER = 4
  const rows = items.map((f) => <FeatureRow f={f} key={f.slug} />)
  return (
    <div className="cs-list">
      {rows.slice(0, AFTER)}
      {items.length > AFTER ? <FeatureCta /> : null}
      {rows.slice(AFTER)}
    </div>
  )
}

/** A smaller card for related features under a page: image on top, then label, title and description. */
export function FeatureRelCard({ f }: { f: Feature }) {
  return (
    <article className="cs-rel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cs-img cs-rel-img" src={featureImage(f)} alt="" width={1200} height={630} loading="lazy" decoding="async" />
      <div className="cs-rel-body">
        <span className="cs-kicker">{f.name}</span>
        <h3><Link className="cs-row-link" href={`/features/${f.slug}`}>{f.headline}</Link></h3>
        <p>{f.summary}</p>
      </div>
    </article>
  )
}
