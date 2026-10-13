'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAuth } from '../lib/supabase.ts'

/** The signed-in view: who you are, and a way out. Redirects to the sign-in page when there is no session. */
export function AccountPanel() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [provider, setProvider] = useState('')
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    if (!auth) {
      setChecked(true)
      return
    }
    auth.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      if (!u) return router.replace('/sign-in')
      setEmail(u.email ?? null)
      setProvider(u.app_metadata?.provider === 'google' ? 'Google' : 'email and password')
      setChecked(true)
    })
    const { data: sub } = auth.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace('/sign-in')
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  async function signOut() {
    await getAuth()?.auth.signOut()
    router.push('/')
  }

  if (!checked) return <p className="muted" role="status">Loading your account.</p>
  if (!email) {
    return (
      <div className="auth-card card">
        <h1 className="auth-title">Account</h1>
        <p className="muted">Sign-in is not set up on this site yet.</p>
      </div>
    )
  }

  return (
    <div className="auth-card card">
      <h1 className="auth-title">Your account</h1>
      <dl className="account-dl">
        <div><dt className="label">Email</dt><dd>{email}</dd></div>
        <div><dt className="label">Signed in with</dt><dd>{provider}</dd></div>
      </dl>
      <p className="muted" style={{ marginTop: 16 }}>Checks work without an account. Reports you unlock are sent to your email.</p>
      <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <Link className="btn" href="/">Check a site</Link>
        <button type="button" className="btn secondary" onClick={signOut}>Sign out</button>
      </p>
    </div>
  )
}
