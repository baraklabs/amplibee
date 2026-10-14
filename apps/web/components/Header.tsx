import Link from 'next/link'
import { HeaderNav } from './HeaderNav.tsx'

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="wordmark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={30} height={30} />
          Amplibee
        </Link>
        <HeaderNav />
      </div>
    </header>
  )
}
