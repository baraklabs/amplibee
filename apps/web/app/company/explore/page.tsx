import { notFound } from 'next/navigation'
import { CheckRunner } from '../../../components/CheckRunner.tsx'
import { pageMeta } from '../../../lib/seo.ts'

export const metadata = pageMeta({ title: 'Your check', description: 'A visibility check in progress.', path: '/', noindex: true })

export default async function ExploreNoDomainPage({ searchParams }: { searchParams: Promise<{ job?: string }> }) {
  const { job } = await searchParams
  if (!job) notFound()
  return <CheckRunner id={job} />
}
