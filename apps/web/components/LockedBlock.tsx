'use client'

import Link from 'next/link'

const FILLER = ['Add structured data to your homepage', 'Submit to the directories that list your category', 'Write the comparison page buyers search for', 'Collect reviews on the sites buyers trust', 'Fix the pages that fail the technical checks', 'Post where your customers already spend time']

/** Blurred stand-in for content that unlocks with the report, with the sign-in prompt over it. The text shown is filler, not the real content. */
export function LockedBlock({ title, text, rows = 4 }: { title: string; text: string; rows?: number }) {
  const back = `${window.location.pathname}${window.location.search}`
  return (
    <div className="comp-locked">
      <ul className="comp-list comp-blur locked-rows" aria-hidden="true">
        {Array.from({ length: Math.min(Math.max(rows, 3), 6) }, (_, i) => (
          <li key={i}><span className="locked-dot" /><span>{FILLER[i % FILLER.length]}</span></li>
        ))}
      </ul>
      <div className="comp-cta scan-cta">
        <p><strong>{title}</strong></p>
        <p className="muted">{text}</p>
        <Link className="btn small" href={`/sign-in?next=${encodeURIComponent(back)}`}>Sign in to unlock</Link>
      </div>
    </div>
  )
}
