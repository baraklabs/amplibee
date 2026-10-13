import Link from 'next/link'
import { HeroArt } from './HeroArt.tsx'

const NEEDS = [
  'More directory submissions or content than a plan includes',
  'More competitors or prompts tracked',
  'Several brands or products',
  'A launch built around your date and budget',
]
const GETS = ['A plan sized to your product', 'Directory and content volume you choose', 'Custom prompt tracking', 'One person to talk to']

/** "Want customization?" panel: a dark card with the honeycomb on the left and the contact button on the right. */
export function TalkPanel() {
  return (
    <section className="section" aria-labelledby="talk-h">
      <div className="wrap">
        <div className="talk">
          <div className="talk-main">
            <HeroArt />
            <div className="talk-copy">
              <h2 id="talk-h" style={{ borderTop: 0 }}>Want customization?</h2>
              <p>For teams with several products, bigger launches or needs a plan does not cover. Tell us what you need and we will price it.</p>
              <ul>
                {NEEDS.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          </div>
          <div className="talk-side">
            <h3>Let&apos;s talk</h3>
            <p className="sub">Custom pricing available</p>
            <Link className="btn talk-btn" href="/contact?topic=custom_plan">Contact us</Link>
            <ul className="checks">
              {GETS.map((g) => <li key={g}>{g}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
