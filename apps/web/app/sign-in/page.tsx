import { AuthForm } from '../../components/AuthForm.tsx'
import { AuthShowcase } from '../../components/AuthShowcase.tsx'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'Sign in',
  description: 'Sign in to Amplibee with your email and password or with Google.',
  path: '/sign-in',
  noindex: true,
})

export default function SignIn() {
  return (
    <div className="wrap auth-wrap auth-split">
      <AuthShowcase />
      <AuthForm />
    </div>
  )
}
