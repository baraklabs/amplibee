import Link from 'next/link'
import { HeroArt } from './HeroArt.tsx'
import type { CSSProperties, ReactNode } from 'react'
import examplesData from '../data/examples.json'
import snapshotData from '../data/sample-report.json'
import { dateLabel, firstSentence, FIX_LABEL, num } from '../lib/format.ts'
import { buildOyekoolUrl } from '../lib/oyekool.ts'
import type { Report } from '../lib/shared/types.ts'
import { RichText } from './RichText.tsx'
import { StackEffect } from './StackEffect.tsx'

interface Snapshot {
  taken_at: string
  note: string
  report: Report
  product: { title: string | null; description: string | null }
  technical: { id: string; pass: boolean; detail: string }[]
  log: { domain: string; level: string; msg: string }[]
}
interface Example {
  domain: string
  score: number | null
  sub_scores: Record<string, number | null>
  gap_total: number
  top_gap: string | null
  rank: number | null
  hn: number | null
  tech_passed: number | null
  tech_total: number | null
}

export const snapshot = snapshotData as unknown as Snapshot
export const examples = examplesData as unknown as { taken_at: string; items: Example[] }

const SUB_LABEL: Record<string, string> = { discoverability: 'Discoverability', buzz: 'Buzz', trust: 'Trust', technical: 'Technical' }
const idx = (i: number) => ({ '--i': i }) as CSSProperties

function Bars({ sub }: { sub: Record<string, number | null> }) {
  return (
    <ul className="mini-bars">
      {Object.entries(SUB_LABEL).map(([k, label]) => (
        <li key={k}>
          <span>{label}</span>
          <span className="bar" aria-hidden="true"><span style={{ width: `${sub[k] ?? 0}%` }} /></span>
          <span className="mono">{sub[k] ?? '-'}</span>
        </li>
      ))}
    </ul>
  )
}

export function ExampleCards() {
  return (
    <section className="section" aria-labelledby="ex-h">
      <div className="wrap">
        <h2 id="ex-h" style={{ textAlign: 'center', borderTop: 0 }}>What a check shows</h2>
        <p className="measure" style={{ margin: '8px auto 0', textAlign: 'center' }}>
          {examples.items.length} well-known products, checked on {dateLabel(examples.taken_at)} with the same code you will run. Search and speed checks needed API keys that were not set, so these scores rest on the page, directory, rank and mention checks only.
        </p>
        <div className="cards-4">
          {examples.items.map((e) => (
            <article className="card ex-card" key={e.domain}>
              <div className="ex-head"><span className="avatar" aria-hidden="true">{e.domain[0]}</span><span className="dom">{e.domain}</span></div>
              <span className="big">{e.score ?? '-'}<small>/100</small></span>
              <Bars sub={e.sub_scores} />
              <p>
                {e.tech_passed}/{e.tech_total} page checks. {e.rank ? `Domain rank ${num(e.rank)}.` : 'Not in the top 100,000 sites.'} {e.hn !== null ? `${num(e.hn)} Hacker News stories.` : ''}
              </p>
              <p><strong>{e.gap_total} {e.gap_total === 1 ? 'gap' : 'gaps'}.</strong> {e.top_gap ? `Largest: ${e.top_gap.split('. ')[0]}.` : ''}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Row({ i, level, children }: { i: number; level?: string; children: ReactNode }) {
  return (
    <li className={`trk-row${level === 'warn' ? ' warn' : ''}`} style={idx(i)}>
      <span className="ico" aria-hidden="true"><span className="spin" /><span className="tick" /></span>
      <span>{children}</span>
    </li>
  )
}

function Card({ n, title, text, children }: { n: number; title: string; text: string; children: ReactNode }) {
  return (
    <div className="use-case-sticky-wrap" style={{ top: `${128 + n * 15}px` }}>
      <div className="use-case-card">
        <div className="use-case-card-inner">
          <div className="use-case-text">
            <h3>{title}</h3>
            <p><RichText text={text} /></p>
          </div>
          <div className="use-case-illustration">
            <div className="use-case-bleed-preview">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Pipeline() {
  const r = snapshot.report
  const d = r.domain
  const p = snapshot.product
  const brief = `Write an article or post about ${d}. ${(p.description ?? '').slice(0, 110)} Link to https://${d}/ and describe what the product does and who it is for.`
  const oy = buildOyekoolUrl({ gapId: 'web_mentions', domain: d, prefill: { task: 'write', brief, price_usd: 60 } })
  const sub = r.sub_scores as Record<string, number | null>
  return (
    <section className="section" aria-labelledby="how-h">
      <div className="wrap">
        <div className="use-case-header"><h2 id="how-h">We prepare your launch, step by step</h2></div>
        <div className="use-case-stack">
          <Card n={0} title="Researches your product" text="Reads your homepage, /pricing and /about and drafts the one-liner your listings and briefs will use. You can edit it before anything uses it.">
            <div className="trk">
              <p className="head">{d}</p>
              <p className="sub">{p.description ?? 'No meta description found.'}</p>
              <hr />
              <p className="agent-line"><span className="agent-mark" /><span className="shimmer">Amplibee is reading your pages</span></p>
              <ul className="trk-list">
                <Row i={0}>https://{d}/</Row>
                <Row i={1}>https://{d}/pricing</Row>
                <Row i={2}>https://{d}/about</Row>
                <Row i={3}>{p.title ?? 'Title read'}</Row>
              </ul>
            </div>
          </Card>

          <Card n={1} title="Maps where competitors show up" text="You name your competitors. Each one is checked for domain rank, mentions and page basics, so you can see who is ahead and where.">
            <div className="trk-table">
              <div className="th"><span>Competitor</span><span>Domain rank</span></div>
              {r.competitors.map((c, i) => (
                <div className="tr" style={idx(i)} key={c.domain}><span>{c.domain}</span><span className="mono">{c.rank ? num(c.rank) : 'not listed'}</span></div>
              ))}
              <div className="tr dim" style={idx(r.competitors.length)}><span>Add a competitor</span><span className="mono">+</span></div>
            </div>
          </Card>

          <Card n={2} title="Finds the gaps" text="Directory listings, search indexing, mentions, technical SEO, page speed and domain rank. Each measurement writes a line as it finishes.">
            <div className="trk">
              <p className="agent-line"><span className="agent-mark" /><span className="shimmer">Scanning {d} and {r.competitors.length} competitors</span></p>
              <ul className="trk-list">
                {snapshot.log.slice(0, 12).map((l, i) => <Row key={i} i={i} level={l.level}>{l.msg}</Row>)}
              </ul>
            </div>
          </Card>

          <Card n={3} title="Scores your brand visibility" text="Four sub-scores make one number out of 100. Every gap shows the points the score would gain if you fixed it.">
            <div className="trk-table">
              <div className="th"><span>Part</span><span>Score of 100</span></div>
              {Object.entries(SUB_LABEL).map(([k, label], i) => (
                <div className="tr" style={idx(i)} key={k}>
                  <span>{label}</span>
                  <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="bar-fill"><span style={{ width: `${sub[k] ?? 0}%` }} /></span>
                    <span className="mono">{sub[k] ?? '-'}</span>
                  </span>
                </div>
              ))}
              {r.gaps.slice(0, 3).map((g, i) => (
                <div className="tr" style={idx(i + 4)} key={g.id}><span>{firstSentence(g.message)}</span><span className="mono">+{g.impact}</span></div>
              ))}
            </div>
          </Card>

          <Card n={4} title="Prepares your launch plan" text="Every gap maps to one action: a directory to submit to, a guide, a review step, a content task or a campaign. Submit yourself, or let us do it on a [paid plan](/pricing).">
            <div className="trk-table">
              <div className="th"><span>Action</span><span>Type</span></div>
              {r.plan.slice(0, 5).map((x, i) => (
                <div className="tr" style={idx(i)} key={x.gap_id}><span>{x.title}</span><span className="mono">{FIX_LABEL[x.fix_type]}</span></div>
              ))}
            </div>
          </Card>

          <Card n={5} title="Gets you mentioned by real people" text="Want to get mentioned by people to improve your brand visibility? We'll get it done for you, with a draft brief and a suggested budget you can change.">
            <div className="bubble me" style={idx(0)}>{brief}</div>
            <div className="bubble" style={idx(1)}>
              Sending this brief with a suggested $60 starting budget. You set the final price.
              <div><span className="chip-ok"><span className="ico" aria-hidden="true" style={{ margin: 0 }}><span className="tick" /></span>Brief ready</span></div>
            </div>
            <p style={{ marginTop: 12 }}><a className="btn small" href={oy} rel="noopener">Get it done for me</a></p>
          </Card>
        </div>
        <StackEffect />
      </div>
    </section>
  )
}

export function ClosingCta() {
  return (
    <section className="wrap" aria-labelledby="close-h">
      <div className="closing closing-dark">
        <HeroArt />
        <div className="closing-body">
          <h2 id="close-h">Launch your product</h2>
          <p>Compare with your competitors and improve your brand visibility.</p>
          <Link className="btn" href="/launch-your-product">Submit your product</Link>
        </div>
      </div>
    </section>
  )
}
