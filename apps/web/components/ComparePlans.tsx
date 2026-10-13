import { COMPARE, PLANS, type Cell } from '../lib/content/plans.ts'

function show(c: Cell) {
  if (c === true) return <span className="tick" role="img" aria-label="Included" />
  if (c === false) return <span className="none" role="img" aria-label="Not included" />
  return c
}

/** The plans side by side. On a narrow screen the table scrolls sideways inside its own box. */
export function ComparePlans() {
  return (
    <section className="section" aria-labelledby="compare-h">
      <div className="wrap">
        <h2 id="compare-h" style={{ borderTop: 0 }}>Compare plans</h2>
        <div className="compare-wrap">
          <table className="compare">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Feature</span></th>
                {PLANS.map((p) => (
                  <th scope="col" key={p.id} className={p.id === 'growth' ? 'pick' : undefined}>
                    {p.name}
                    <small>{p.monthly === 0 ? '$0' : `$${p.monthly} a month`}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {r.values.map((v, i) => (
                    <td key={PLANS[i].id} className={PLANS[i].id === 'growth' ? 'pick' : undefined}>{show(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
