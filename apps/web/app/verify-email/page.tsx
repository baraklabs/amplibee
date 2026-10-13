import { VerifyEmail } from '../../components/EmailLinks.tsx'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({ title: 'Confirm your email', description: 'Finishing creating your Amplibee account.', path: '/verify-email', noindex: true })

export default function VerifyEmailPage() {
  return (
    <div className="wrap auth-wrap">
      <VerifyEmail />
    </div>
  )
}
