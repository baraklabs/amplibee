'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CheckView } from '../lib/api.ts'

/** Site icon from the domain, with a letter tile when the icon cannot be loaded. */
export function Logo({ domain }: { domain: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="comp-logo comp-letter" aria-hidden="true">{domain[0]?.toUpperCase()}</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="comp-logo"
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

// Filler for the blurred rows. The real names are not sent to the page until the report is unlocked.
const FILLER = ['placeholder.com', 'examplesite.io', 'competitor.co', 'sampledomain.com', 'anotherone.app', 'hiddenname.com', 'yoursite.io']
const HUES = [210, 20, 340, 150, 270, 45, 190]

/** The competitors found, each with its logo. Extra ones the check found are blurred until the viewer signs in. */
export function CompetitorList({ view }: { view: CheckView }) {
  if (!view.competitors.length) return <p className="caption">No competitors found yet.</p>
  const more = view.competitor_more ?? 0
  const unlocked = view.competitor_suggestions.length > 0
  const back = `${window.location.pathname}${window.location.search}`
  return (
    <>
      <ul className="comp-list">
        {view.competitors.map((d) => (
          <li key={d}>
            <Logo domain={d} />
            <a href={`https://${d}`} rel="noopener noreferrer">{d}</a>
          </li>
        ))}
        {unlocked
          ? view.competitor_suggestions.map((d) => (
              <li key={d}>
                <Logo domain={d} />
                <a href={`https://${d}`} rel="noopener noreferrer">{d}</a>
              </li>
            ))
          : null}
      </ul>
      {more > 0 && !unlocked ? (
        <div className="comp-locked">
          <ul className="comp-list comp-blur" aria-hidden="true">
            {Array.from({ length: more }, (_, i) => (
              <li key={i}>
                <span className="comp-logo" style={{ background: `hsl(${HUES[i % HUES.length]} 70% 55%)` }} />
                <a role="presentation" tabIndex={-1}>{FILLER[i % FILLER.length]}</a>
              </li>
            ))}
          </ul>
          <div className="comp-cta scan-cta">
            <p><strong>{more} more {more === 1 ? 'competitor' : 'competitors'}</strong> found for you.</p>
            <Link className="btn small" href={`/sign-in?next=${encodeURIComponent(back)}`}>Sign in to see them</Link>
          </div>
        </div>
      ) : null}
    </>
  )
}
