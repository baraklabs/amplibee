// Cookie consent, kept in this browser's localStorage. "Strictly necessary" is always on and is not stored.
// Anything that sets analytics or marketing cookies must check getConsent() first and listen with onConsent().

export interface Consent {
  analytics: boolean
  marketing: boolean
}

const KEY = 'amplibee_cookie_consent'
const CHANGE = 'amplibee:consent'
export const OPEN_SETTINGS = 'amplibee:cookie-settings'

/** The saved choice, or null if the visitor has not chosen yet. */
export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    return { analytics: v.analytics === true, marketing: v.marketing === true }
  } catch {
    return null
  }
}

export function saveConsent(c: Consent): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    // storage blocked: the choice only lasts for this page view
  }
  window.dispatchEvent(new CustomEvent(CHANGE, { detail: c }))
}

export function onConsent(fn: (c: Consent) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<Consent>).detail)
  window.addEventListener(CHANGE, h)
  return () => window.removeEventListener(CHANGE, h)
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_SETTINGS))
}
