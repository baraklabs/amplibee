'use client'

import { useEffect, useState } from 'react'

export interface Stat {
  value: string
  label: string
}

/** The top pill: rotates through facts with a blur-and-slide transition, like explee.com's stat badge. */
export function StatPill({ stats }: { stats: Stat[] }) {
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'in' | 'out'>('in')

  useEffect(() => {
    if (stats.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let swap: ReturnType<typeof setTimeout>
    let tick: ReturnType<typeof setInterval>
    const rotate = () => {
      setPhase('out')
      swap = setTimeout(() => {
        setI((n) => (n + 1) % stats.length)
        setPhase('in')
      }, 450)
    }
    // The first fact stays still while the page loads, then the rotation starts.
    const start = setTimeout(() => {
      rotate()
      tick = setInterval(rotate, 3800)
    }, 7000)
    return () => {
      clearTimeout(start)
      clearInterval(tick)
      clearTimeout(swap)
    }
  }, [stats.length])

  const s = stats[i]
  return (
    <span className="top-pill stat-pill" aria-live="off">
      <span key={i} className={`stat-inner ${phase}`}>
        <strong>{s.value}</strong> {s.label}
      </span>
    </span>
  )
}
