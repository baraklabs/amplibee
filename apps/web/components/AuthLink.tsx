'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { hasSession, onAuthChange } from '../lib/auth.ts'

/** Header link: "Sign in" for visitors, "Account" once there is a session. */
export function AuthLink() {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const sync = () => setSignedIn(hasSession())
    sync()
    return onAuthChange(sync)
  }, [])

  return signedIn ? <Link href="/account">Account</Link> : <Link href="/sign-in">Sign in</Link>
}
