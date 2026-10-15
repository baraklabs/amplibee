import Link from 'next/link'
import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { HeroArt } from '../../components/HeroArt.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { LaunchBrowser } from '../../components/LaunchBrowser.tsx'
import { absolute } from '../../lib/config.ts'
import { LAUNCHES } from '../../lib/content/launches.ts'
import { webPage } from '../../lib/jsonld.ts'
import { pageMeta } from '../../lib/seo.ts'

const DESCRIPTION = 'Browse every product launched with Amplibee: what each one does, who it is for, how it works and the questions people ask about it.'

export const metadata = pageMeta({
  title: 'Product launches',
  description: DESCRIPTION,
  path: '/launches',
  keywords: ['product launches', 'new SaaS products', 'startup launches', 'Amplibee launches', 'product alternatives', 'compare products', 'new tools to try'],
})

export default function LaunchesIndex() {
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: LAUNCHES.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.name, url: absolute(`/launches/${l.slug}`) })),
  }
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'Product launches', path: '/launches' }]} />
        <JsonLd data={[webPage({ type: 'CollectionPage', name: 'Product launches on Amplibee', description: DESCRIPTION, path: '/launches' }), list]} />
        <div className="launch-top">
          <h1>Product launches</h1>
          <Link className="btn btn-honey" href="/launch-your-product">Launch your product <span aria-hidden="true">→</span></Link>
        </div>
        <p className="lede">Discover the launches and see what each product does, who it is for and how it works.</p>
      </div>
      <LaunchBrowser />
      <section className="closing closing-dark launch-closing" aria-labelledby="lc-h">
        <HeroArt />
        <div className="closing-body">
          <h2 id="lc-h">Launched something?</h2>
          <p>Submit your product for free. We review it by hand and list it with a full write-up, alternatives and a share image.</p>
          <span className="hex-wrap">
            <Link className="btn btn-honey btn-hex" href="/launch-your-product">Launch your product <span aria-hidden="true">→</span></Link>
          </span>
        </div>
      </section>
    </div>
  )
}
