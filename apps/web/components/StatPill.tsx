'use client'

import { useEffect, useState } from 'react'

export interface Stat {
  value: string
  label: string
}

const STEP_MS = 450 // first rotation, and the point where the text swaps (matches the 0.45s slide in social.css)
const INTERVAL_MS = 2000 // time between rotations

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
      }, STEP_MS)
    }
    // The first rotation starts almost immediately, then it repeats on the interval.
    const start = setTimeout(() => {
      rotate()
      tick = setInterval(rotate, INTERVAL_MS)
    }, STEP_MS)
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
