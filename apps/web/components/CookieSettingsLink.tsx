'use client'

import { openCookieSettings } from '../lib/consent.ts'

/** Footer entry that reopens the cookie preferences popup. */
export function CookieSettingsLink() {
  return (
    <button type="button" className="link-btn" onClick={openCookieSettings}>
      Cookie preferences
    </button>
  )
}
