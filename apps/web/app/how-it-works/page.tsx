import Link from 'next/link'
import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { webPage } from '../../lib/jsonld.ts'
import { PROCESS_STEPS } from '../../lib/content/steps.ts'
import { HowSteps } from '../../components/HowSteps.tsx'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'How Amplibee works',
  description: 'The six steps of an Amplibee check, what each one requests from your site and from third parties, the limits we apply, and what we store.',
  path: '/how-it-works',
})

export default function HowItWorks() {
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'How it works', path: '/how-it-works' }]} />
        <JsonLd data={webPage({ type: 'WebPage', name: 'How the Amplibee check works', description: 'The six steps of an Amplibee check, what each one requests from your site and from third parties, the limits we apply, and what we store.', path: '/how-it-works' })} />
        <span className="label">How it works</span>
        <h1>Grow traffic organically</h1>
        <p className="lede">Why people can’t find your product, and how Amplibee fixes it: we scan, list the gaps, study your competitors, get you listed and plan the content. All organic, from growing your domain ranking to being discovered by the people who need you.</p>
      </div>

      <div className="hiw-panel">
        <HowSteps />
        <p className="hiw-cta"><Link className="btn btn-honey" href="/">Check your product <span aria-hidden="true">→</span></Link></p>
      </div>

      <h2 className="hiw-sub">The check, step by step</h2>
      <ol className="process">
        {PROCESS_STEPS.map((s) => (
          <li key={s.title}>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{s.title}</h2>
            <p style={{ color: 'var(--ink)' }}>{s.long}</p>
          </li>
        ))}
      </ol>

      <section className="closing closing-dark" aria-labelledby="hiw-end">
        <div className="closing-body">
          <h2 id="hiw-end">See where you stand</h2>
          <p>The score and your top 3 gaps are free.</p>
          <Link className="btn btn-honey" href="/">Check your product <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <div className="layout-2 section">
        <div className="prose">
          <h2>What we request from your site</h2>
          <p>Every request is a plain GET from AmplibeeBot. We read your homepage, /pricing, /about, /sitemap.xml, /robots.txt and the image address in your og:image tag. We never log in, submit forms or run your scripts.</p>
          <ul>
            <li>Addresses must resolve to public internet addresses. Private, loopback, link-local and cloud metadata ranges are refused, and the check repeats on every redirect.</li>
            <li>Only http and https on ports 80 and 443.</li>
            <li>At most 3 redirects, 8 seconds per request, 2 MB per response.</li>
            <li>We read robots.txt first and skip any path it disallows for AmplibeeBot. A robots.txt that returns a server error is treated as a full disallow.</li>
          </ul>
          <p>To keep the bot out entirely, add these two lines to your robots.txt:</p>
          <pre><code>{'User-agent: AmplibeeBot\nDisallow: /'}</code></pre>

          <h2>What we ask third parties</h2>
          <ul>
            <li>Google PageSpeed Insights receives your homepage address to run a mobile performance test.</li>
            <li>Hacker News search (Algolia) and GitHub search receive your domain name.</li>
            <li>One search provider receives queries such as <code>site:yourdomain.com</code>. The free check runs at most 2 queries. The full check runs at most 30.</li>
            <li>Domain rank is looked up live from the public Tranco list of top websites. Only the domain name is sent.</li>
          </ul>
        </div>
        <aside className="aside" aria-label="Related">
          <span className="label">Related</span>
          <ul>
            <li><Link href="/faq">Questions and answers</Link></li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
