import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { webPage } from '../../lib/jsonld.ts'
import { ComparePlans } from '../../components/ComparePlans.tsx'
import { ClosingCta } from '../../components/Landing.tsx'
import { PricingPlans } from '../../components/PricingPlans.tsx'
import { TalkPanel } from '../../components/TalkPanel.tsx'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'Pricing',
  description: 'The Amplibee check is free. Start free. Paid plans from $10 a month, or pay annually and get 2 months free.',
  path: '/pricing',
})

export default function Pricing() {
  return (
    <>
      <div className="wrap page-top">
        <div className="page-head">
          <Breadcrumbs trail={[{ name: 'Pricing', path: '/pricing' }]} />
          <JsonLd data={webPage({ type: 'WebPage', name: 'Amplibee pricing', description: 'The Amplibee check is free. Start free. Paid plans from $10 a month, or pay annually and get 2 months free.', path: '/pricing' })} />
          <h1>Pricing</h1>
          <p className="lede">Start free. Move up when you want more checks, more competitors and done-for-you work.</p>
        </div>
      </div>
      <PricingPlans />
      <ComparePlans />
      <TalkPanel />
      <ClosingCta />
    </>
  )
}
