'use client'

import { useEffect, useState } from 'react'

const SLIDES = [
  {
    title: 'How do I get people talking about my product?',
    lead: 'Amplibee lines up real posts, reviews and mentions from creators, so buyers see others vouching for you before they ever talk to you.',
    rows: [
      ['Find who already mentions you', 'ok', 'We check'],
      ['Creators post and review', 'warn', 'We arrange'],
      ['Mentions add up to trust', 'ok', 'You gain'],
    ],
  },
  {
    title: 'Why does ChatGPT not mention my product?',
    lead: 'Amplibee gets you listed on AlternativeTo and 150+ directories, so AI knows what to fetch when someone asks.',
    rows: [
      ['See which directories list you', 'ok', 'We check'],
      ['AlternativeTo and 150+ more', 'warn', 'We list'],
      ['Assistants can name you', 'ok', 'You gain'],
    ],
  },
  {
    title: 'Why can’t Google find my website?',
    lead: 'Amplibee finds what blocks search engines, such as a robots.txt that shuts them out or a missing sitemap, and gives you a ranked list to fix.',
    rows: [
      ['Read robots.txt and sitemap', 'ok', 'We check'],
      ['Fix titles and descriptions', 'warn', 'We rank'],
      ['More pages get indexed', 'ok', 'You gain'],
    ],
  },
  {
    title: 'Why is my website slow on a phone?',
    lead: 'Amplibee runs a mobile speed test and ranks the fixes: compress heavy images, trim scripts and make the first screen say what you do.',
    rows: [
      ['Run a mobile speed test', 'ok', 'We check'],
      ['Lighter pages, clearer top', 'warn', 'We rank'],
      ['Visitors stay and sign up', 'ok', 'You gain'],
    ],
  },
] as const

/** The panel beside the sign-in card: problems Amplibee finds, each with its fix and outcome, turning every few seconds. */
export function AuthShowcase() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 5500)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section
      className="auth-show"
      aria-roledescription="carousel"
      aria-label="What Amplibee fixes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="auth-slides">
        {SLIDES.map((s, n) => (
          <div key={s.title} className="auth-slide" data-on={n === i ? 'true' : 'false'} aria-hidden={n !== i}>
            <h2>{s.title}</h2>
            <p>{s.lead}</p>
            <div className="auth-tilt">
              <p className="auth-note" aria-hidden="true">
                How Amplibee fixes it
                <svg viewBox="0 0 60 30" width="60" height="30"><path d="M2 4 C 26 2, 44 8, 52 24 M52 24 L44 20 M52 24 L54 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </p>
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
            </div>
          </div>
        ))}
      </div>
      <div className="auth-dots" role="group" aria-label="Choose a slide">
        {SLIDES.map((s, n) => (
          <button key={s.title} type="button" aria-label={`Slide ${n + 1}`} aria-pressed={n === i} onClick={() => setI(n)} />
        ))}
      </div>
    </section>
  )
}
