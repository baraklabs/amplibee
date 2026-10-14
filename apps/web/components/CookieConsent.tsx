'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getConsent, OPEN_SETTINGS, saveConsent } from '../lib/consent.ts'

function Toggle({ on, onChange, label, locked }: { on: boolean; onChange?: (v: boolean) => void; label: string; locked?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked}
      className={`ck-switch${on ? ' on' : ''}`}
      onClick={() => onChange?.(!on)}
    />
  )
}

/** First-visit banner plus a preferences popup. The popup can be reopened from the footer at any time. */
export function CookieConsent() {
  const [ready, setReady] = useState(false)
  const [banner, setBanner] = useState(false)
  const [open, setOpen] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)
  const dialog = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = getConsent()
    if (saved) {
      setAnalytics(saved.analytics)
      setMarketing(saved.marketing)
    } else {
      setBanner(true)
    }
    setReady(true)
    const show = () => {
      const c = getConsent()
      setAnalytics(c?.analytics ?? true)
      setMarketing(c?.marketing ?? true)
      setOpen(true)
    }
    window.addEventListener(OPEN_SETTINGS, show)
    return () => window.removeEventListener(OPEN_SETTINGS, show)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    dialog.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [open])

  const choose = (c: { analytics: boolean; marketing: boolean }) => {
    saveConsent(c)
    setAnalytics(c.analytics)
    setMarketing(c.marketing)
    setBanner(false)
    setOpen(false)
  }

  if (!ready) return null
  return (
    <>
      {banner && !open ? (
        <div className="ck-banner" role="region" aria-label="Cookies">
          <p>
            We use essential cookies to keep Amplibee secure and working properly, plus optional analytics and marketing cookies with your consent.{' '}
            <Link href="/privacy">Learn more in our Privacy Policy.</Link>
          </p>
          <div className="ck-actions">
            <button type="button" className="btn secondary" onClick={() => setOpen(true)}>Cookie Settings</button>
            <button type="button" className="btn" onClick={() => choose({ analytics: true, marketing: true })}>Got it</button>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="ck-overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ck-title" tabIndex={-1} ref={dialog}>
            <button type="button" className="ck-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
            <h2 id="ck-title">Cookie preferences</h2>
            <p className="ck-lede">Choose which cookies Amplibee may use. You can change this anytime from the footer.</p>

            <div className="ck-row">
              <div>
                <strong>Strictly necessary</strong>
                <p>Required for the site to function properly. Always active.</p>
              </div>
              <Toggle on locked label="Strictly necessary" />
            </div>
            <div className="ck-row">
              <div>
                <strong>Analytics</strong>
                <p>Helps us understand how visitors use the site.</p>
              </div>
              <Toggle on={analytics} onChange={setAnalytics} label="Analytics" />
            </div>
            <div className="ck-row">
              <div>
                <strong>Marketing</strong>
                <p>Measures the performance of our campaigns.</p>
              </div>
              <Toggle on={marketing} onChange={setMarketing} label="Marketing" />
            </div>

            <Link href="/privacy" className="ck-policy" onClick={() => setOpen(false)}>Privacy Policy</Link>
            <div className="ck-actions ck-end">
              <button type="button" className="btn secondary" onClick={() => choose({ analytics: false, marketing: false })}>Reject all</button>
              <button type="button" className="btn secondary" onClick={() => choose({ analytics: true, marketing: true })}>Accept all</button>
              <button type="button" className="btn" onClick={() => choose({ analytics, marketing })}>Save preferences</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
