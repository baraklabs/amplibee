import Link from 'next/link'
import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { webPage } from '../../lib/jsonld.ts'
import { SITE } from '../../lib/config.ts'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'About Amplibee',
  description: 'What Amplibee is, who it is for, what it will not do, and how its optional paid campaigns work.',
  path: '/about',
})

export default function About() {
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'About', path: '/about' }]} />
        <JsonLd data={webPage({ type: 'AboutPage', name: 'About Amplibee', description: 'What Amplibee is, who it is for, what it will not do, and how its optional paid campaigns work.', path: '/about' })} />
        <h1>About Amplibee</h1>
        <p className="updated">Last updated {SITE.updated}</p>
      </div>
      <div className="prose">
        <h2>What is Amplibee?</h2>
        <p className="answer">Amplibee is a free web tool that checks how visible a product is online. You enter a website. It reads public pages, queries a few public sources, scores the result out of 100 and lists the specific gaps. It is built for indie SaaS, developer-tool and other early-stage founders.</p>
        <p>Every check is deterministic. The same inputs give the same score, and the scoring is plain arithmetic on measured numbers.</p>

        <h2>What it will not do</h2>
        <p>Amplibee does not buy links, post on your behalf or change your site. It lists the public basics that are missing and points to a fix, which improves your odds of being found.</p>

        <h2>How do campaigns work?</h2>
        <p>Most fixes are free posts on this blog. Want to get mentioned by people to improve your brand visibility? We will get it done for you. For gaps about mentions and reviews, the report offers a campaign: a draft brief and a suggested budget, run through a partner marketplace where brands pay creators to post, write about or engage with their product. You decide the final brief and price, and a campaign improves your odds of being mentioned.</p>
        {SITE.contactEmail ? (
          <>
            <h2>Contact</h2>
            <p>Write to <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
          </>
        ) : null}
      </div>
    </div>
  )
}
