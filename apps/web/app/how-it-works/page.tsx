import Link from 'next/link'
import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { webPage } from '../../lib/jsonld.ts'
import { PROCESS_STEPS } from '../../lib/content/steps.ts'
import { SITE } from '../../lib/config.ts'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'How the check works',
  description: 'The six steps of an Amplibee check, what each one requests from your site and from third parties, the limits we apply, and what we store.',
  path: '/how-it-works',
})

export default function HowItWorks() {
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'How it works', path: '/how-it-works' }]} />
        <JsonLd data={webPage({ type: 'WebPage', name: 'How the Amplibee check works', description: 'The six steps of an Amplibee check, what each one requests from your site and from third parties, the limits we apply, and what we store.', path: '/how-it-works' })} />
        <h1>How the check works</h1>
        <p className="lede">Six steps, one live log. Every line in the log is a real request or measurement.</p>
        <p className="updated">Last updated {SITE.updated}</p>
      </div>

      <ol className="process">
        {PROCESS_STEPS.map((s) => (
          <li key={s.title}>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{s.title}</h2>
            <p style={{ color: 'var(--ink)' }}>{s.long}</p>
          </li>
        ))}
      </ol>

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
