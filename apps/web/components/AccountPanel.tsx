'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { signOut as endSession } from '../lib/auth.ts'
import { useAccount } from './useAccount.ts'

/** The signed-in view: who you are, and a way out. Redirects to the sign-in page when there is no session. */
export function AccountPanel() {
  const router = useRouter()
  const me = useAccount()

  useEffect(() => {
    if (me === null) router.replace('/sign-in')
  }, [me, router])

  async function signOut() {
    await endSession()
    router.push('/')
  }

  if (!me) return <p className="muted" role="status">Loading your account.</p>

  return (
    <div className="auth-card card">
      <h1 className="auth-title">Your account</h1>
      <dl className="account-dl">
        <div><dt className="label">Email</dt><dd>{me.email}</dd></div>
        <div><dt className="label">Signed in with</dt><dd>{me.has_password ? 'email and password' : 'Google'}</dd></div>
      </dl>
      <p className="muted" style={{ marginTop: 16 }}>Checks work without an account. Reports you unlock are sent to your email.</p>
      <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <Link className="btn" href="/">Check a site</Link>
        <button type="button" className="btn secondary" onClick={signOut}>Sign out</button>
      </p>
    </div>
  )
}
