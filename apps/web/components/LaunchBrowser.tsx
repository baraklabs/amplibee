'use client'

import { useMemo, useState } from 'react'
import { StartupGrid, startups } from './Startups.tsx'

type Sort = 'default' | 'newest' | 'score' | 'name'

/** The product list with a search box, category chips and a sort order. */
export function LaunchBrowser() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<Sort>('default')

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of startups) counts.set(s.category, (counts.get(s.category) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [])

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = startups.filter(
      (s) => (category === 'All' || s.category === category) && (!q || `${s.name} ${s.domain} ${s.tagline} ${s.category}`.toLowerCase().includes(q)),
    )
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name))
    // Products without a score sort after the scored ones.
    if (sort === 'score') return [...list].sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
    if (sort === 'newest') return [...list].sort((a, b) => b.launched.localeCompare(a.launched))
    // The order of data/startups.json.
    return list
  }, [query, category, sort])

  const filtered = query.trim() !== '' || category !== 'All'

  return (
    <>
      <div className="lf-bar">
        <input
          type="search"
          className="lf-search"
          placeholder="Search products"
          aria-label="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="lf-sort">
          <span className="muted">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="default">Featured</option>
            <option value="newest">Newest</option>
            <option value="score">Visibility score</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <div className="lf-chips" role="group" aria-label="Filter by category">
        {[['All', startups.length] as const, ...categories].map(([c, n]) => (
          <button key={c} type="button" className="lf-chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c} <span className="muted">{n}</span>
          </button>
        ))}
      </div>
      <p className="lf-count muted" aria-live="polite">
        {items.length} {items.length === 1 ? 'product' : 'products'}
        {filtered ? (
          <>
            {' · '}
            <button type="button" className="lf-clear" onClick={() => { setQuery(''); setCategory('All') }}>Clear filters</button>
          </>
        ) : null}
      </p>
      {items.length ? <StartupGrid items={items} /> : <p className="caption">No products match. Try a different search or category.</p>}
    </>
  )
}
