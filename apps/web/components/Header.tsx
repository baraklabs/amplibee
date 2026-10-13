import Link from 'next/link'
import { AuthLink } from './AuthLink.tsx'

const NAV = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/pricing', label: 'Pricing' },
]

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="wordmark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={30} height={30} />
          Amplibee
        </Link>
        <div className="header-right">
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
            <AuthLink />
          </nav>
        </div>
      </div>
    </header>
  )
}
