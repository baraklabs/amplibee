import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { CaseList } from '../../components/CaseStudies.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { ClosingCta } from '../../components/Landing.tsx'
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
      <div className="wrap">
        <div className="page-head">
          <Breadcrumbs trail={[{ name: 'Case studies', path: '/case-studies' }]} />
          <JsonLd data={[webPage({ type: 'CollectionPage', name: 'Amplibee case studies', description: DESCRIPTION, path: '/case-studies' }), list]} />
          <h1>Case studies</h1>
          <p className="lede">Real founders, real checks. Open a case study to see what they found and what they did about it.</p>
        </div>
        <CaseList />
      </div>
      <ClosingCta />
    </>
  )
}
