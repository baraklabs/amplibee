'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  {
    title: 'We scan your presence',
    text: 'We read your site the way a search engine and an AI assistant would, and check every place people could find you.',
    rows: [
      ['Website and technical SEO', 'ok', 'We scan'],
      ['Directories that list you', 'ok', 'We scan'],
      ['Search indexing and page speed', 'ok', 'We scan'],
      ['Mentions on Hacker News, GitHub and the web', 'ok', 'We scan'],
    ],
  },
  {
    title: 'We list the gaps and how to solve them',
    text: 'Every reason people cannot find you is ranked by severity, with the one action that fixes it and the points you would gain.',
    rows: [
      ['No one mentions your product', 'miss', 'Gap'],
      ['AI tools do not list your name', 'miss', 'Gap'],
      ['Pages blocked or missing from search', 'miss', 'Gap'],
      ['Each gap maps to one fix', 'ok', 'Solution'],
    ],
  },
  {
    title: 'We search for your competitors',
    text: 'We look at who shows up for the searches your buyers make, and compare their listings, mentions and content with yours.',
    rows: [
      ['Who ranks for your searches', 'ok', 'We scan'],
      ['Where they are listed and you are not', 'warn', 'Gap'],
      ['What they publish and how often', 'ok', 'We scan'],
    ],
  },
  {
    title: 'We plan how to rank among them',
    text: 'You get a detailed plan, in order of impact, to move from behind them to alongside them in search and in AI answers.',
    rows: [
      ['What to fix first', 'ok', 'Plan'],
      ['Where to be mentioned next', 'ok', 'Plan'],
      ['Which searches to go after', 'ok', 'Plan'],
    ],
  },
  {
    title: 'We list the platforms you are missing and submit for you',
    text: 'You see which directories and platforms do not list you yet. On a paid plan we do the submissions, up to 150+ directories.',
    rows: [
      ['AlternativeTo', 'warn', 'Missing'],
      ['Product Hunt, SaaSHub, BetaList', 'warn', 'Missing'],
      ['150+ directories AI tools read', 'ok', 'We submit'],
    ],
  },
  {
    title: 'We plan a month of blogs and content',
    text: 'A month of topics and posts, scheduled one after another, and the plan changes as your competitors change what they talk about.',
    calendar: true,
    rows: [
      ['A full month of topics', 'ok', 'Plan'],
      ['Adapts to what competitors publish', 'ok', 'Adapts'],
      ['Domain ranking grows organically', 'ok', 'Result'],
    ],
  },
] as const

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
// Weekdays of the first three weeks of the month; `tag` marks posts that came from watching competitors.
const CALENDAR: { day: number; topic: string; tag?: string }[] = [
  { day: 2, topic: 'Why AI skips you' },
  { day: 3, topic: 'AlternativeTo listing guide' },
  { day: 4, topic: 'Fix robots.txt' },
  { day: 5, topic: 'You vs top 3 rivals', tag: 'Adapted' },
  { day: 6, topic: 'Top directories' },
  { day: 9, topic: 'Win Hacker News' },
  { day: 10, topic: 'Write a sitemap' },
  { day: 11, topic: 'Rival’s new topic', tag: 'Adapted' },
  { day: 12, topic: 'Clearer first screen' },
  { day: 13, topic: 'Get named by ChatGPT' },
  { day: 16, topic: 'Launch checklist' },
  { day: 17, topic: 'Reviews that build trust' },
  { day: 18, topic: 'Rival alternatives', tag: 'Adapted' },
  { day: 19, topic: 'Page speed fixes' },
  { day: 20, topic: 'Ranking update' },
]

/** Six services as a list; picking one shows what it covers on a tilted card. Turns by itself until the reader touches it. */
export function HowSteps() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % STEPS.length), 5000)
    return () => clearInterval(t)
  }, [paused])

  const s = STEPS[i]!
  return (
    <div className="hs" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ol className="hs-list" aria-label="What Amplibee does">
        {STEPS.map((x, n) => (
          <li key={x.title}>
            <button type="button" className="hs-item" aria-pressed={n === i} onClick={() => { setI(n); setPaused(true) }}>
              <span className="hs-n" aria-hidden="true">{n + 1}</span>
              <span className="hs-t">{x.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="hs-stage" aria-live="polite">
        <div className="hs-pane" key={i}>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
          <div className="auth-tilt hs-tilt">
            <p className="auth-note" aria-hidden="true">
              How Amplibee fixes it
              <svg viewBox="0 0 60 30" width="60" height="30"><path d="M2 4 C 26 2, 44 8, 52 24 M52 24 L44 20 M52 24 L54 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </p>
            {'calendar' in s ? (
              <div className="auth-plan hs-cal">
                <div className="hs-cal-head"><strong>November 2026</strong><span>Content plan</span></div>
                <div className="hs-cal-grid">
                  {WEEKDAYS.map((d) => <span key={d} className="hs-cal-dow">{d}</span>)}
                  {CALENDAR.map((c) => (
                    <div key={c.day} className={`hs-cal-cell${c.tag ? ' adapted' : ''}`}>
                      <span className="hs-cal-day">{c.day}</span>
                      <span className="hs-cal-topic">{c.topic}</span>
                      {c.tag ? <span className="auth-status warn">{c.tag}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
            <div className="auth-plan">
              <table>
                <tbody>
                  {s.rows.map(([what, tone, status]) => (
                    <tr key={what}>
                      <td>{what}</td>
                      <td><span className={`auth-status ${tone}`}>{status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
