import Link from 'next/link'
import { CheckForm } from '../components/CheckForm.tsx'
import { FaqAccordion } from '../components/FaqAccordion.tsx'
import { HeroArt } from '../components/HeroArt.tsx'
import { JsonLd } from '../components/JsonLd.tsx'
import { Features } from '../components/Features.tsx'
import { ClosingCta, examples, Pipeline } from '../components/Landing.tsx'
import { CustomerResults, customerStats } from '../components/Social.tsx'
import { StartupsLaunched } from '../components/Startups.tsx'
import { StatPill, type Stat } from '../components/StatPill.tsx'
import { FAQ } from '../lib/content/faq.ts'
import { DIRECTORIES } from '../lib/directories.ts'
import { faqPage, webApplication } from '../lib/jsonld.ts'
import { pageMeta } from '../lib/seo.ts'
import { SCORING } from '../lib/shared/scoring.config.ts'

export const metadata = pageMeta({
  title: 'Amplibee: get your product launch on auto-pilot',
  description: 'Amplibee researches your product, maps where competitors are listed, finds the gaps and launches your product for you in the directories that matter. The visibility check is free.',
  path: '/',
  absoluteTitle: true,
  keywords: ['product visibility check', 'startup directories', 'SaaS launch checklist', 'AI search visibility', 'answer engine optimization', 'SEO audit for founders'],
})

// The home page leaves out the email question; the full FAQ page keeps it.
const homeFaq = FAQ.filter((f) => f.q !== 'Why do I need to sign in?').slice(0, 6)

// Facts the pill rotates through. Customer outcomes come from the customer cards; the rest from the real config, directory list and stored example checks.
function pillStats(): Stat[] {
  const scores = examples.items.map((e) => e.score).filter((n): n is number => n !== null).sort((a, b) => a - b)
  const median = scores.length ? Math.round((scores[Math.floor((scores.length - 1) / 2)] + scores[Math.ceil((scores.length - 1) / 2)]) / 2) : null
  const o = customerStats()
  const checks: Stat = { value: String(Object.keys(SCORING.technical.checkWeights).length), label: 'technical checks on every homepage' }
  const stats: Stat[] = [o.first, o.middle, o.last ?? checks].filter((x): x is Stat => !!x)
  if (!o.first && !o.middle) {
    stats.push({ value: String(DIRECTORIES.filter((d) => d.check_method !== 'none').length), label: 'directories checked for your listing' })
    if (median !== null) stats.push({ value: String(median), label: `median score of ${scores.length} well-known sites we checked` })
  }
  return stats
}

export default function Home() {
  return (
    <>
      <section className="hero-center" id="check">
        <HeroArt />
        <div className="wrap">
          <StatPill stats={pillStats()} />
          <h1>Get Your <span className="hl">Product Launch</span> <span className="h1-line">on Auto-Pilot</span></h1>
          <ul className="pills" aria-label="What you get">
            <li>Get discovered by ChatGPT</li>
            <li>Improve brand visibility</li>
          </ul>
          <CheckForm />
          <p className="lede hero-desc">Our AI agent researches your product, maps where competitors are listed, finds the gaps and launches your product for you.</p>
        </div>
      </section>

      <Features />
      <CustomerResults />
      <StartupsLaunched />
      <Pipeline />

      <section className="section" aria-labelledby="faq-h">
        <div className="wrap">
          <h2 id="faq-h" style={{ borderTop: 0 }}>Questions</h2>
          <FaqAccordion items={homeFaq} />
          <p style={{ marginTop: 16 }}><Link href="/faq">All questions</Link></p>
        </div>
      </section>

      <ClosingCta />
      <JsonLd data={[webApplication, faqPage(homeFaq)]} />
    </>
  )
}
