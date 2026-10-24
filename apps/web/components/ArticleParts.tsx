import Link from 'next/link'
import { absolute } from '../lib/config.ts'

/** What a founder gets, shown beside an article. The wording follows the home page. */
const BENEFITS: { icon: string; text: string }[] = [
  { icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 17-4.35-4.35', text: 'Scan your site, directories, mentions and page speed' },
  { icon: 'M4 6h16M4 12h16M4 18h10', text: 'See every gap ranked, with the fix for each' },
  { icon: 'M16 11a4 4 0 1 0-8 0m-4 9a8 8 0 0 1 16 0', text: 'Compare with your competitors, side by side' },
  { icon: 'M5 12l5 5L20 7', text: 'Get listed on directories and plan a month of content' },
]

/** The sticky call-to-action card beside every feature page and blog post. */
export function ArticleAside() {
  return (
    <aside className="cs-side" aria-label="Check your own product">
      <div className="cs-side-card">
        <h2>Ready to check your own product?</h2>
        <p className="muted">Amplibee researches your product, maps where competitors are listed, finds the gaps and launches your product for you in the directories that matter.</p>
        <ul className="cs-benefits">
          {BENEFITS.map((b) => (
            <li key={b.text}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d={b.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
        <Link className="btn cs-side-btn" href="/">Check my product free</Link>
        <p className="cs-side-note">Prefer to talk it through? <a href={absolute('/contact')}>Contact us</a></p>
      </div>
    </aside>
  )
}

/** The meta line under a title: a label, the author, month and year, and the reading time. */
export function ArticleMeta({ tag, monthYear, iso, minutes }: { tag: string; monthYear: string; iso: string; minutes: number }) {
  return (
    <p className="cs-meta">
      <span className="cs-tag">{tag}</span>
      <span>· By Amplibee team</span>
      <span>· <time dateTime={iso.slice(0, 7)}>{monthYear}</time></span>
      <span>· {minutes} min read</span>
    </p>
  )
}
