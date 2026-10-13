'use client'

import { useEffect, useState } from 'react'
import { currentUser, type Me, onAuthChange } from '../lib/auth.ts'

/** The signed-in person: undefined while checking, null when signed out. Updates when the login changes. */
export function useAccount(): Me | null | undefined {
  const [me, setMe] = useState<Me | null | undefined>(undefined)

  useEffect(() => {
    let live = true
    const load = () => {
      currentUser().then((u) => {
        if (live) setMe(u)
      })
    }
    load()
    const off = onAuthChange(load)
    return () => {
      live = false
      off()
    }
  }, [])

  return me
}
