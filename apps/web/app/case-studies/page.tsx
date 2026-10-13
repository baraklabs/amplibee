import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { webPage } from '../../lib/jsonld.ts'
import { ClosingCta } from '../../components/Landing.tsx'
import { CustomerResults, Testimonials } from '../../components/Social.tsx'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'Case studies',
  description: 'What founders got out of an Amplibee check: scores, gaps fixed and directories submitted, plus real example checks of well-known products.',
  path: '/case-studies',
})

export default function CaseStudies() {
  return (
    <>
      <div className="wrap page-top">
        <div className="page-head">
          <Breadcrumbs trail={[{ name: 'Case studies', path: '/case-studies' }]} />
          <JsonLd data={webPage({ type: 'CollectionPage', name: 'Amplibee case studies', description: 'What founders got out of an Amplibee check: scores, gaps fixed and directories submitted, plus real example checks of well-known products.', path: '/case-studies' })} />
          <h1>Case studies</h1>
          <p className="lede">Results from real checks. Each one lists the score, what was fixed and where the product was submitted.</p>
        </div>
      </div>
      <CustomerResults />
      <Testimonials />
      <ClosingCta />
    </>
  )
}
