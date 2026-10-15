import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
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
        <h1>Product launches</h1>
        <p className="lede">Discover the launches and see what each product does, who it is for and how it works.</p>
      </div>
      <LaunchBrowser />
    </div>
  )
}
