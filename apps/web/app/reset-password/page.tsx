import { ResetPassword } from '../../components/EmailLinks.tsx'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({ title: 'Choose a new password', description: 'Set a new password for your Amplibee account.', path: '/reset-password', noindex: true })

export default function ResetPasswordPage() {
  return (
    <div className="wrap auth-wrap">
      <ResetPassword />
    </div>
  )
}
