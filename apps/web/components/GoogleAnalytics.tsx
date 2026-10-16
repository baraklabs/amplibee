'use client'

import { useEffect } from 'react'
import { getConsent, onConsent } from '../lib/consent.ts'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

type Gtag = (...args: unknown[]) => void
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

/** Loads Google Analytics only after the visitor accepts analytics cookies, and stops it if they withdraw. */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_ID || !/^G-[A-Z0-9]+$/i.test(GA_ID)) return

    const apply = (analytics: boolean) => {
      // GA honours this flag, so turning analytics off takes effect without a reload.
      ;(window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = !analytics
      if (!analytics || document.getElementById('ga-script')) return
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', GA_ID)
      const s = document.createElement('script')
      s.id = 'ga-script'
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
      document.head.appendChild(s)
    }

    apply(getConsent()?.analytics === true)
    return onConsent((c) => apply(c.analytics))
  }, [])

  return null
}
