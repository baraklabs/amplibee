import Link from 'next/link'
import { GUIDES } from '../lib/content/guides.ts'
import { CookieSettingsLink } from './CookieSettingsLink.tsx'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <p className="wordmark" style={{ display: 'inline-flex' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" width={30} height={30} loading="lazy" />
              Amplibee
            </p>
            <p className="muted" style={{ maxWidth: '34ch', marginTop: 12 }}>
              Researches your product, maps where competitors are listed, finds the gaps and launches your product for you.
            </p>
          </div>
          <div>
            <span className="label">Product</span>
            <ul>
              <li><Link href="/">Check a site</Link></li>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/case-studies">Case studies</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <Link href="/blog" className="label" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</Link>
            <ul>
              <li><Link href="/blog"><strong>All posts</strong></Link></li>
              {GUIDES.map((g) => (
                <li key={g.slug}><Link href={`/blog/${g.slug}`}>{g.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <span className="label">Company</span>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact us</Link></li>
              <li><Link href="/sign-in">Sign in</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><CookieSettingsLink /></li>
            </ul>
          </div>
        </div>
        <p className="fineprint">
          &copy; {new Date().getFullYear()} Amplibee. All rights reserved.        </p>
      </div>
    </footer>
  )
}
