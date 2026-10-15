'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { hasSession, onAuthChange } from '../lib/auth.ts'
import { AuthLink } from './AuthLink.tsx'

const NAV = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/launches', label: 'Launches' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/pricing', label: 'Pricing' },
]

/** Main nav: inline links on wide screens, a hamburger menu on narrow ones. */
export function HeaderNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const sync = () => setSignedIn(hasSession())
    sync()
    return onAuthChange(sync)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="header-right">
      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" />
      </button>
      <nav id="main-nav" className="nav" aria-label="Main" data-open={open}>
        {signedIn ? (
          <Link href="/dashboard" aria-current={pathname.startsWith('/dashboard') ? 'page' : undefined}>Dashboard</Link>
        ) : null}
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={pathname === n.href ? 'page' : undefined}>
            {n.label}
          </Link>
        ))}
        <AuthLink />
        <Link className="nav-launch" href="/launch-your-product">Launch your product</Link>
      </nav>
    </div>
  )
}
