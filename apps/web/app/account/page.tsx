import { AccountPanel } from '../../components/AccountPanel.tsx'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({ title: 'Your account', description: 'Your Amplibee account.', path: '/account', noindex: true })

export default function Account() {
  return (
    <div className="wrap auth-wrap">
      <AccountPanel />
    </div>
  )
}
