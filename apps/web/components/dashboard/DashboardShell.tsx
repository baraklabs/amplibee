'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { type Feature, hasFeature, nextPlan, planById, planFor } from '../../lib/content/plans.ts'
import { AuthLink } from '../AuthLink.tsx'
import { useAccount } from '../useAccount.ts'
import { DashboardProvider, useDash } from './DashboardContext.tsx'
import { Meter, upgradeHref } from './ui.tsx'

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
)

interface Item { href: string; label: string; icon: string; feature?: Feature }
const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l9-8 9 8M5 10v10h14V10' },
      { href: '/dashboard/setup', label: 'Quick setup', icon: 'M13 2L4 14h7l-1 8 9-12h-7z' },
    ],
  },
  {
    title: 'Grow',
    items: [
      { href: '/dashboard/keywords', label: 'Keywords', icon: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5', feature: 'keywords' },
      { href: '/dashboard/competitors', label: 'Competitors', icon: 'M16 11a4 4 0 10-8 0M4 20a8 8 0 0116 0' },
      { href: '/dashboard/directories', label: 'Directories', icon: 'M4 6h16M4 12h16M4 18h10', feature: 'directories' },
      { href: '/dashboard/content', label: 'Content planner', icon: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5', feature: 'content' },
    ],
  },
  {
    title: 'Measure',
    items: [
      { href: '/dashboard/reports', label: 'Reports', icon: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6' },
      { href: '/dashboard/analytics', label: 'Analytics', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2', feature: 'analytics' },
      { href: '/dashboard/ai-visibility', label: 'AI visibility', icon: 'M12 3l2.1 5.4L20 10l-5.9 1.6L12 17l-2.1-5.4L4 10l5.9-1.6z', feature: 'aiVisibility' },
    ],
  },
]

function Sidebar() {
  const path = usePathname()
  const { plan, limits, ws, me } = useDash()
  const next = nextPlan(plan)

  return (
    <aside id="dash-side" className="dash-side" aria-label="Dashboard">
      <nav className="dash-nav">
        {GROUPS.map((g) => (
          <div key={g.title} className="dash-group">
            <p className="dash-group-title">{g.title}</p>
            {g.items.map((it) => {
              const locked = it.feature ? !hasFeature(plan, it.feature) : false
              const active = it.href === '/dashboard' ? path === it.href : path.startsWith(it.href)
              return (
                <Link key={it.href} href={it.href} className="dash-link" aria-current={active ? 'page' : undefined} data-locked={locked ? 'true' : undefined} title={it.label}>
                  {icon(it.icon)}
                  <span>{it.label}</span>
                  {locked && it.feature ? <span className="lock-pill" title={`Included from the ${planFor(it.feature).name} plan`}>{planFor(it.feature).name}</span> : null}
                </Link>
              )
            })}
          </div>
        ))}
        <div className="dash-group">
          <p className="dash-group-title">Account</p>
          <Link href="/dashboard/account" title="Account" className="dash-link" aria-current={path.startsWith('/dashboard/account') ? 'page' : undefined}>
            {icon('M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0')}<span>Account</span>
          </Link>
          <Link href="/dashboard/plan" title="Plan and billing" className="dash-link" aria-current={path.startsWith('/dashboard/plan') ? 'page' : undefined}>
            {icon('M3 7h18v12H3zM3 11h18')}<span>Plan and billing</span>
          </Link>
        </div>
      </nav>

      <div className="plan-card">
        <p className="plan-card-top"><span className="label">Your plan</span><strong>{planById(plan).name}</strong></p>
        <p className="muted plan-card-mail">{me.email}</p>
        {me.trial_ends_at ? <p className="trial-left">Free trial: {Math.max(0, Math.ceil((new Date(me.trial_ends_at).getTime() - Date.now()) / 86_400_000))} days left</p> : null}
        {limits.keywords > 0 ? <Meter used={ws.keywords.length} max={limits.keywords} label="Keywords" /> : null}
        <Meter used={ws.competitors.length} max={limits.competitors} label="Competitors" />
        {next ? (
          <Link className="btn small plan-card-cta" href={upgradeHref(next)}>Upgrade to {next.name}</Link>
        ) : (
          <p className="muted">You are on our top plan.</p>
        )}
      </div>
    </aside>
  )
}

/** The dashboard frame: signed-in people only, a sidebar on the left and the page on the right. */
function SyncStatus() {
  const { sync, retrySync } = useDash()
  if (sync === 'offline') {
    return <span className="sync sync-bad" role="status">Not saved <button type="button" className="link-btn" onClick={retrySync}>Retry</button></span>
  }
  return <span className="sync" role="status" aria-live="polite">{sync === 'saving' ? 'Saving' : sync === 'loading' ? 'Loading' : 'Saved'}</span>
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const me = useAccount()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('amplibee_side') === 'closed')
    } catch {
      // storage blocked: starts open
    }
  }, [])

  function toggle() {
    setCollapsed((c) => {
      try {
        localStorage.setItem('amplibee_side', c ? 'open' : 'closed')
      } catch {
        // storage blocked: the choice lasts until the tab closes
      }
      return !c
    })
  }

  useEffect(() => {
    if (me === null) router.replace('/sign-in?next=/dashboard')
  }, [me, router])

  // Full screen: the site header and footer step aside while the dashboard is open.
  useEffect(() => {
    document.body.classList.add('dash-full')
    return () => document.body.classList.remove('dash-full')
  }, [])

  if (!me) return <div className="wrap"><p className="muted" role="status" style={{ padding: '40px 0' }}>Loading your dashboard.</p></div>

  return (
    <DashboardProvider me={me}>
      <div className="dash-app">
        <header className="dash-top">
          <button type="button" className="side-toggle" onClick={toggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="dash-side">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v14H4zM9 5v14" /></svg>
          </button>
          <Link href="/dashboard" className="wordmark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={26} height={26} />
            Amplibee
          </Link>
          <nav className="dash-top-nav" aria-label="Site">
            <SyncStatus />
            <Link href="/">Check a site</Link>
            <Link href="/pricing">Pricing</Link>
            <AuthLink />
          </nav>
        </header>
        <div className="dash" data-collapsed={collapsed ? 'true' : undefined}>
          <Sidebar />
          <div className="dash-main">{children}</div>
        </div>
      </div>
    </DashboardProvider>
  )
}
