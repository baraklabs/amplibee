'use client'

import { useEffect } from 'react'
import { getConsent, onConsent } from '../lib/consent.ts'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const VALID = !!GA_ID && /^G-[A-Z0-9]+$/i.test(GA_ID)

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * The Google tag sits in the page HTML (so Google can detect it) under Consent Mode: analytics storage is denied
 * until the visitor accepts analytics cookies, and it follows later changes made in the cookie settings.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!VALID) return
    const update = (analytics: boolean) => window.gtag?.('consent', 'update', { analytics_storage: analytics ? 'granted' : 'denied' })
    update(getConsent()?.analytics === true)
    return onConsent((c) => update(c.analytics))
  }, [])

  if (!VALID) return null
  const init = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${GA_ID}');`
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script dangerouslySetInnerHTML={{ __html: init }} />
    </>
  )
}
