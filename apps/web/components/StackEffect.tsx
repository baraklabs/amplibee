'use client'

import { useEffect } from 'react'

/**
 * Cards stack as you scroll: every card that has a later card stuck on top of it scales down a little,
 * pivoting from its top edge. This is the only client script on the landing page section.
 */
export function StackEffect() {
  useEffect(() => {
    const stack = document.querySelector<HTMLElement>('.use-case-stack')
    const io = stack ? new IntersectionObserver(([e]) => stack.classList.toggle('playing', e.isIntersecting), { rootMargin: '200px' }) : null
    if (stack && io) io.observe(stack)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => io?.disconnect()
    const wraps = [...document.querySelectorAll<HTMLElement>('.use-case-sticky-wrap')]
    if (wraps.length < 2) return () => io?.disconnect()
    let frame = 0

    const update = () => {
      frame = 0
      const stuck = wraps.map((w) => w.getBoundingClientRect().top <= parseFloat(getComputedStyle(w).top) + 1)
      wraps.forEach((w, i) => {
        let covered = 0
        for (let j = i + 1; j < wraps.length; j++) if (stuck[j]) covered++
        w.style.transform = covered ? `scale(${Math.max(0.85, 1 - covered * 0.03)})` : ''
      })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      io?.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
  return null
}
