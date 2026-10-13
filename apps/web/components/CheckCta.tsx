'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'

/**
 * A call to action that starts a check. On the home page it scrolls to the search box and focuses it,
 * because a link to "/" would do nothing there. On any other page it is a normal link to the home page.
 */
export function CheckCta({ className, children }: { className?: string; children: ReactNode }) {
  const path = usePathname()

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (path !== '/') return
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    window.setTimeout(() => document.getElementById('domain')?.focus({ preventScroll: true }), reduce ? 0 : 450)
  }

  return (
    <Link className={className} href="/" onClick={onClick}>
      {children}
    </Link>
  )
}
