import type { ReactNode } from 'react'
import { DashboardShell } from '../../components/dashboard/DashboardShell.tsx'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({ title: 'Dashboard', description: 'Your Amplibee dashboard.', path: '/dashboard', noindex: true })

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
