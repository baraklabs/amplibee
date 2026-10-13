import Link from 'next/link'
import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { SITE } from '../../lib/config.ts'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'Terms',
  description: 'The terms for using Amplibee: limits, acceptable use, and what the results do and do not mean.',
  path: '/terms',
})

export default function Terms() {
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'Terms', path: '/terms' }]} />
        <h1>Terms</h1>
        <p className="updated">Last updated {SITE.updated}</p>
      </div>
      <div className="prose">
        <h2>What do the results mean?</h2>
        <p className="answer">Results are estimates built from public information on the day of the check. They are provided as is, without any promise of accuracy, traffic, rankings or revenue. Points shown next to a gap come from the scoring formula and are not forecasts. Make your own decisions and verify anything important.</p>

        <h2>What is acceptable use?</h2>
        <ul>
          <li>Each person gets 2 free checks per day. Do not work around this limit with scripts or many addresses.</li>
          <li>Do not use Amplibee to harass a site owner or to put load on a site. Requests are limited, but repeated checks of one site are not welcome.</li>
          <li>Do not submit addresses that point to private networks. They are refused.</li>
        </ul>

        <h2>What about campaigns?</h2>
        <p>Campaign buttons open a request on a partner service with its own terms. A campaign is an agreement between you, that service and its creators. Amplibee does not guarantee any result from a campaign.</p>

        <h2>Reports and removal</h2>
        <p>Reports can be hidden at any time on request. We may change or stop the service, and we may change these terms. The date above shows the latest version.</p>
      </div>
    </div>
  )
}
