// "What our customers got out of it" on the home page, read from apps/web/data/customers.json (the same data locally and in production).
// Without data, it falls back to the real example checks.

import customersData from '../data/customers.json'
import metaData from '../data/customers.meta.json'
import { ExampleCards } from './Landing.tsx'
import { StatValue } from './StatValue.tsx'

interface Stat {
  value: string
  label: string
}
interface Customer {
  name: string
  company: string
  quote: string
  url?: string
  platform?: 'linkedin' | 'x'
  avatar?: string
  stats: Stat[]
}

const customers = customersData as Customer[]
// Optional real totals for the whole customer base, when it is larger than the cards shown: { "total_customers": 1200 }
const meta = metaData as { total_customers?: number; pill_first?: Stat; pill_middle?: Stat; pill_last?: Stat }

function Avatar({ name, src }: { name: string; src?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img className="avatar" src={src} alt="" width={40} height={40} loading="lazy" />
  return <span className="avatar" aria-hidden="true">{name.trim()[0]}</span>
}

const ICONS = {
  linkedin: { label: 'LinkedIn', d: 'M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2ZM8.1 18.5H5.5V9.8h2.6v8.7ZM6.8 8.6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm11.7 9.9h-2.6v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.3H10.3V9.8h2.5V11c.4-.7 1.2-1.4 2.5-1.4 2.7 0 3.2 1.8 3.2 4.1v4.8Z' },
  x: { label: 'X', d: 'M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.2 4.7H5.4l11.3 14.5Z' },
}

/** Platform icon at the right of a card. It links to the profile when a url is given, otherwise it is only a mark. */
function PlatformIcon({ platform, url, name }: { platform?: 'linkedin' | 'x'; url?: string; name: string }) {
  if (!platform) return null
  const i = ICONS[platform]
  const svg = (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="currentColor" d={i.d} />
    </svg>
  )
  return url ? (
    <a className="li-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} on ${i.label}`}>{svg}</a>
  ) : (
    <span className="li-link" role="img" aria-label={i.label}>{svg}</span>
  )
}

export function CustomerResults() {
  if (!customers.length) return <ExampleCards />
  return (
    <section className="section" aria-labelledby="cust-h">
      <div className="wrap">
        <h2 id="cust-h" style={{ textAlign: 'center', borderTop: 0 }}>What our customers got out of it</h2>
        <div className="cards-4">
          {customers.slice(0, 4).map((c) => (
            <article className="card cust-card" key={c.name + c.company}>
              <header className="cust-head">
                <Avatar name={c.name} src={c.avatar} />
                <div>
                  <strong>{c.name}</strong>
                  <span className="muted">{c.company}</span>
                </div>
                <PlatformIcon platform={c.platform} url={c.url} name={c.name} />
              </header>
              <p className="cust-quote">&ldquo;{c.quote}&rdquo;</p>
              <div className="cust-stats">
                {c.stats.slice(0, 2).map((s) => (
                  <div key={s.label}><strong><StatValue value={s.value} /></strong><span>{s.label}</span></div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const num = (v: string) => Number(String(v).replace(/[^0-9.-]/g, ''))

/**
 * The three pill slots. Each is a real fact worked out from the customer cards, unless customers.meta.json
 * supplies its own value for any slot (for example real totals across all customers).
 */
export function customerStats(): { first?: Stat; middle?: Stat; last?: Stat } {
  const pick = (re: RegExp) => customers.map((c) => c.stats.find((x) => re.test(x.label))).filter((x): x is Stat => !!x).map((x) => num(x.value)).filter((n) => Number.isFinite(n))
  const gains = pick(/score gain/i).sort((a, b) => a - b)
  const fixed = pick(/gaps fixed/i)
  const out: { first?: Stat; middle?: Stat; last?: Stat } = { first: meta.pill_first, middle: meta.pill_middle, last: meta.pill_last }
  if (customers.length && gains.length && !out.first) {
    const mid = (gains[Math.floor((gains.length - 1) / 2)] + gains[Math.ceil((gains.length - 1) / 2)]) / 2
    out.first = { value: `+${Math.round(mid)}`, label: 'median score gain after fixing the gaps' }
  }
  if (customers.length && fixed.length && !out.middle) out.middle = { value: String(fixed.reduce((a, b) => a + b, 0)), label: `gaps fixed by ${(meta.total_customers ?? customers.length).toLocaleString('en-US')} customers` }
  return out
}
