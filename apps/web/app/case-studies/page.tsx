import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { CaseList } from '../../components/CaseStudies.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { ClosingCta } from '../../components/Landing.tsx'
import { CustomerResults } from '../../components/Social.tsx'
import { absolute } from '../../lib/config.ts'
import { CASE_STUDIES } from '../../lib/content/case-studies.ts'
import { webPage } from '../../lib/jsonld.ts'
import { pageMeta } from '../../lib/seo.ts'

const DESCRIPTION = 'What founders got out of an Amplibee check: the gaps they found, the directories they submitted to and what changed for their product.'

export const metadata = pageMeta({
  title: 'Case studies',
  description: DESCRIPTION,
  path: '/case-studies',
  keywords: ['Amplibee case studies', 'product launch results', 'directory submission results', 'startup visibility case study'],
})

export default function CaseStudies() {
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: CASE_STUDIES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.headline, url: absolute(`/case-studies/${s.slug}`) })),
  }
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Case studies', path: '/case-studies' }]} />
      <JsonLd data={[webPage({ type: 'CollectionPage', name: 'Amplibee case studies', description: DESCRIPTION, path: '/case-studies' }), list]} />
      <h1 className="sr-only">Case studies</h1>
      <CustomerResults />
      <div className="wrap">
        <h2 className="cs-list-h">All case studies</h2>
        <CaseList />
      </div>
      <ClosingCta />
    </>
  )
}
