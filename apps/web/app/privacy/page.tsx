import Link from 'next/link'
import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { SITE } from '../../lib/config.ts'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'Privacy',
  description: 'What Amplibee stores, why, for how long, and which services process it.',
  path: '/privacy',
})

export default function Privacy() {
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'Privacy', path: '/privacy' }]} />
        <h1>Privacy</h1>
        <p className="updated">Last updated {SITE.updated}</p>
      </div>
      <div className="prose">
        <h2>What do you store about me?</h2>
        <p className="answer">If you only run a check, we store the domain you entered, the measurements, the log and a salted hash of your IP address, which is used for daily limits and cannot be turned back into the address. If you sign in to unlock a report, we also store your account email, the check you unlocked, any requests you make for directory submissions, competitor tracking or a launch, and any UTM tags from the page address.</p>
        <ul>
          <li>Checks and their results are deleted after 30 days.</li>
          <li>Scan results cached per domain are deleted after 7 days.</li>
          <li>Rate limit counters are deleted after 2 days.</li>
          <li>Accounts and requests are kept until you ask us to delete them. Reply to the report email to ask.</li>
          <li>Removal requests are kept so a removed report stays removed.</li>
        </ul>

        <h2>Which services process it?</h2>
        <ul>
          <li>Supabase hosts the database and the API.</li>
          <li>Vercel hosts this website.</li>
          <li>Cloudflare Turnstile checks that a visitor is not a bot. It runs in your browser and may use its own storage.</li>
          <li>Supabase Auth handles sign-in. Passwords are stored as hashes that we never see. With Google sign-in we receive your email address and nothing else.</li>
          <li>Resend or Brevo sends the report email.</li>
          <li>Google PageSpeed Insights receives the homepage address of the site being checked.</li>
          <li>A search provider receives queries that contain the checked domain.</li>
        </ul>

        <h2>Do you use cookies?</h2>
        <p>Amplibee sets no cookies and runs no analytics scripts. UTM tags are read from the address only when you start a check, and are stored with that check.</p>

        <h2>How do I see or delete my data?</h2>
        <p>Reply to any email we sent you and say what you want. You can also ask us to hide the public report for a domain.</p>
      </div>
    </div>
  )
}
