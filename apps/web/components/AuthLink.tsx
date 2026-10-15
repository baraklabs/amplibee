'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { hasSession, onAuthChange, signOut } from '../lib/auth.ts'
import { useAccount } from './useAccount.ts'

/** Header: "Sign in" for visitors, and for a signed-in person their first name with a menu for Account and Sign out. */
export function AuthLink() {
  const router = useRouter()
  const me = useAccount()
  const [signedIn, setSignedIn] = useState(false)
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sync = () => setSignedIn(hasSession())
    sync()
    return onAuthChange(sync)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!signedIn) return <Link href="/sign-in">Sign in</Link>

  const label = (me?.name ?? '').trim().split(/\s+/)[0] || me?.email.split('@')[0] || 'Account'

  async function logout() {
    setOpen(false)
    await signOut()
    router.push('/')
  }

  return (
    <div className="user-menu" ref={box}>
      <button type="button" className="user-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="user-dot" aria-hidden="true">{label[0]?.toUpperCase()}</span>
        <span className="user-name">{label}</span>
        <span className="user-caret" aria-hidden="true" />
      </button>
      {open ? (
        <div className="user-pop" role="menu">
          {me ? <p className="user-mail">{me.email}</p> : null}
          <Link role="menuitem" href="/account" onClick={() => setOpen(false)}>Account</Link>
          <button type="button" role="menuitem" onClick={logout}>Sign out</button>
        </div>
      ) : null}
    </div>
  )
}
