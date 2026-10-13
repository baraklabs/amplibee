import { AuthCallback } from '../../../components/AuthCallback.tsx'
import { pageMeta } from '../../../lib/seo.ts'

export const metadata = pageMeta({ title: 'Signing in', description: 'Finishing your sign-in.', path: '/auth/callback', noindex: true })

export default function Callback() {
  return (
    <div className="wrap auth-wrap">
      <AuthCallback />
    </div>
  )
}
