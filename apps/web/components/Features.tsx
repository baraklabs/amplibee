// Feature sections for the home page. Every number in the mocks comes from the stored snapshot of a real check.

import { CheckCta } from './CheckCta.tsx'
import { RichText } from './RichText.tsx'
import type { ReactNode } from 'react'
import { firstSentence, num, SEVERITY_LABEL } from '../lib/format.ts'
import { snapshot } from './Landing.tsx'

function Arrow({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 44" width="90" height="44" style={style} aria-hidden="true" focusable="false">
      <path d="M3 8c26-14 64-6 76 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 28l14 4 2-15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Feature({ title, text, cta, href, reverse, children }: { title: ReactNode; text: string; cta: string; href: string; reverse?: boolean; children: ReactNode }) {
  return (
    <div className={`feat${reverse ? ' rev' : ''}`}>
      <div className="feat-text">
        <h3>{title}</h3>
        <p><RichText text={text} /></p>
        <CheckCta className="btn-cta">{cta}<ArrowRight /></CheckCta>
      </div>
      <div className="feat-mock">{children}</div>
    </div>
  )
}

export function Features() {
  const r = snapshot.report
  const all = [r.self, ...r.competitors].filter((x): x is NonNullable<typeof x> => !!x)
  const dirs = r.directories.filter((d) => d.status !== 'unknown').concat(r.directories.filter((d) => d.status === 'unknown')).slice(0, 6)
  const hn = all.map((c) => ({ domain: c.domain, n: c.hn ?? 0 }))
  const topHn = Math.max(1, ...hn.map((h) => h.n))

  return (
    <section className="section features" aria-label="Features">
      <div className="wrap">

        <Feature
          title={<>Launch with the <span className="hl">directories</span> that matter</>}
          text="Your launch plan lists the directories to submit to, with the submission page for each one. Submit them yourself, or let us handle it on a paid plan. See [pricing](/pricing)."
          cta="Get my launch plan"
          href="/"
        >
          <span className="chip-float" style={{ left: 0, bottom: 10 }}><i />Submission pages included</span>
          <span className="hand" style={{ right: 4, top: -6 }}>
            Your launch plan
            <Arrow style={{ left: -70, top: 28, transform: 'rotate(20deg) scaleX(-1)' }} />
          </span>
          <div className="mock-card">
            <h4>Directory listings</h4>
            <table className="mock-table">
              <thead><tr><th>Directory</th><th>Status</th><th className="r">Submit</th></tr></thead>
              <tbody>
                {dirs.map((d) => (
                  <tr key={d.slug}>
                    <td>{d.name}</td>
                    <td><span className={`tag ${d.status === 'listed' ? 'ok' : ''}`}>{d.status === 'listed' ? 'Listed' : d.status === 'not_found' ? 'Not found' : 'Not confirmed'}</span></td>
                    <td className="r">{d.submit_url ? 'link' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Feature>

        <Feature
          reverse
          title={<>Find every gap in your <span className="hl">visibility</span></>}
          text="See what is missing across directories, search indexing, mentions and page basics. Every gap shows the points your score would gain if you fixed it."
          cta="Check my site"
          href="/"
        >
          <span className="chip-float" style={{ right: 0, top: 14 }}><i />Scan signals</span>
          <span className="hand" style={{ left: 4, top: -4 }}>
            Ranked by points gained
            <Arrow style={{ left: 40, top: 54, transform: 'rotate(30deg)' }} />
          </span>
          <div className="mock-card">
            <h4>Gaps for {r.domain}</h4>
            <table className="mock-table">
              <thead><tr><th>Severity</th><th>What we found</th><th className="r">Points</th></tr></thead>
              <tbody>
                {r.gaps.slice(0, 3).map((g) => (
                  <tr key={g.id}>
                    <td><span className={`tag ${g.severity === 'high' ? 'warn' : ''}`}>{SEVERITY_LABEL[g.severity]}</span></td>
                    <td>{firstSentence(g.message)}</td>
                    <td className="r">+{g.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="chip-float" style={{ left: 4, bottom: 6 }}><i />Rank gaps</span>
        </Feature>


        <Feature
          title={<>Map where your <span className="hl">competitors</span> are listed</>}
          text="Add your competitors and see their domain rank, mentions and page basics next to yours. You will know who is ahead and by how much."
          cta="Compare competitors"
          href="/"
        >
          <span className="chip-float" style={{ left: 0, top: 14 }}><i />Your competitors</span>
          <span className="hand" style={{ right: 6, top: -4 }}>
            Real numbers, not guesses
            <Arrow style={{ left: -78, top: 26, transform: 'rotate(18deg) scaleX(-1)' }} />
          </span>
          <div className="mock-card">
            <h4>Competitor comparison</h4>
            <table className="mock-table">
              <thead><tr><th>Site</th><th className="r">Rank</th><th className="r">HN stories</th><th className="r">GitHub</th></tr></thead>
              <tbody>
                {all.map((c, i) => (
                  <tr key={c.domain}>
                    <td>{c.domain}{i === 0 ? <span className="tag ok" style={{ marginLeft: 6 }}>you</span> : null}</td>
                    <td className="r">{c.rank ? num(c.rank) : '-'}</td>
                    <td className="r">{c.hn === null ? '-' : num(c.hn)}</td>
                    <td className="r">{c.github === null ? '-' : num(c.github)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Feature>

        <div className="authority">
          <div className="authority-head">
            <div>
              <p className="kicker">Build authority</p>
              <h3>We get you <span className="hl">mentioned</span> by real people</h3>
            </div>
            <div className="authority-side">
              <p>Want to get mentioned by people to improve your brand visibility? We will get it done for you, with a draft brief and a budget you set.</p>
              <CheckCta className="btn-cta">Get mentioned<ArrowRight /></CheckCta>
              <p className="authority-note">Campaigns use creators who are paid to post, write about or engage with your product. No result is promised.</p>
            </div>
          </div>

          <div className="mini-grid">
            <div className="mini-card">
              <div className="toggle-row">
                <strong>Mentions campaign</strong>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="muted" style={{ fontSize: '0.85rem' }}>Enabled</span><span className="switch" aria-hidden="true" /></span>
              </div>
              <div className="faded-lines">
                <p><strong>Brief</strong></p>
                <p>Write an article or post about {r.domain}. Link to https://{r.domain}/ and describe what the product does and who it is for.</p>
                <p>Suggested starting budget, set by you.</p>
              </div>
            </div>

            <div className="mini-card">
              <h4>Mentions found on Hacker News and GitHub</h4>
              <table className="mock-table">
                <thead><tr><th>Site</th><th className="r">HN</th><th className="r">GitHub</th></tr></thead>
                <tbody>
                  {all.map((c) => (
                    <tr key={c.domain}>
                      <td>{c.domain}</td>
                      <td className="r">{c.hn === null ? '-' : num(c.hn)}</td>
                      <td className="r">{c.github === null ? '-' : num(c.github)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mini-card">
              <h4>Hacker News stories per site</h4>
              <div className="bars" role="img" aria-label={`Hacker News stories: ${hn.map((h) => `${h.domain} ${h.n}`).join(', ')}`}>
                {hn.map((h) => (
                  <div key={h.domain}>
                    <span className="bar-val">{num(h.n)}</span>
                    <span className="bar-col" style={{ height: `${Math.max(2, (h.n / topHn) * 100)}%` }} />
                  </div>
                ))}
              </div>
              <div className="bar-labels">{hn.map((h) => <span key={h.domain}>{h.domain.replace(/\.[a-z]+$/, '')}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
