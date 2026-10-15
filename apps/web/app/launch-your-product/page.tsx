import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { SubmitForm } from '../../components/SubmitForm.tsx'
import { webPage } from '../../lib/jsonld.ts'
import { pageMeta } from '../../lib/seo.ts'

const DESCRIPTION = 'Launch your product on Amplibee. Free to submit: add your product name, tagline, category and pricing (a website is optional), and we find the gaps and submit you to 150+ directories.'

export const metadata = pageMeta({
  title: 'Launch your product',
  description: DESCRIPTION,
  path: '/launch-your-product',
  keywords: ['submit a product', 'launch your product', 'submit SaaS', 'product launch directory', 'list your startup', 'Amplibee launches'],
})

export default function Submit() {
  return (
    <div className="wrap submit-page">
      <Breadcrumbs trail={[{ name: 'Product launches', path: '/launches' }, { name: 'Launch your product', path: '/launch-your-product' }]} />
      <JsonLd data={webPage({ name: 'Submit your product to Amplibee', description: DESCRIPTION, path: '/launch-your-product' })} />
      <header className="submit-hero">
        <span className="submit-kicker">Free to submit</span>
        <h1>Launch your product</h1>
        <p className="lede">Tell us about your product. We find where your competitors are being talked about, spot the gaps and submit you to 150+ directories.</p>
        <ol className="submit-steps">
          <li><span>1</span><div><strong>Submit</strong><em>Fill in the essentials. A website is optional.</em></div></li>
          <li><span>2</span><div><strong>We research</strong><em>We check where your competitors are being talked about and find the gaps.</em></div></li>
          <li><span>3</span><div><strong>We launch</strong><em>We do 150+ directory submissions for you.</em></div></li>
        </ol>
      </header>
      <div className="submit-card">
        <SubmitForm />
      </div>
    </div>
  )
}
