import { CheckRunner } from '../../../components/CheckRunner.tsx'
import { pageMeta } from '../../../lib/seo.ts'

export const metadata = pageMeta({ title: 'Your check', description: 'A visibility check in progress.', path: '/', noindex: true })

export default async function CheckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CheckRunner id={id} />
}
