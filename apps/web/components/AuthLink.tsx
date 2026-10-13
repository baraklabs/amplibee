'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAuth } from '../lib/supabase.ts'

/** Header link: "Sign in" for visitors, "Account" once there is a session. */
export function AuthLink() {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    if (!auth) return
    auth.auth.getSession().then(({ data }) => setSignedIn(!!data.session))
    const { data: sub } = auth.auth.onAuthStateChange((_e, session) => setSignedIn(!!session))
    return () => sub.subscription.unsubscribe()
  }, [])

  return signedIn ? <Link href="/account">Account</Link> : <Link href="/sign-in">Sign in</Link>
}
