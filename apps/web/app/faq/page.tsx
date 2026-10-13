import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { RichText } from '../../components/RichText.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { SITE } from '../../lib/config.ts'
import { FAQ } from '../../lib/content/faq.ts'
import { faqPage } from '../../lib/jsonld.ts'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'Questions and answers',
  description: 'What Amplibee checks, what it costs, how the score works, what it stores and how to remove a report.',
  path: '/faq',
})

export default function FaqPage() {
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'FAQ', path: '/faq' }]} />
        <h1>Questions and answers</h1>
        <p className="updated">Last updated {SITE.updated}</p>
      </div>
      <div className="qa">
        {FAQ.map((f) => (
          <div key={f.q}>
            <h2 style={{ fontSize: '1.3rem' }}>{f.q}</h2>
            <p className="answer"><RichText text={f.a} /></p>
            {f.more?.map((p) => <p key={p}>{p}</p>)}
          </div>
        ))}
      </div>
      <JsonLd data={faqPage(FAQ)} />
    </div>
  )
}
