export const STORAGE_KEY = "oyekool-cookie-consent";
const OPEN_SETTINGS_EVENT = "oyekool:open-cookie-settings";
const CONSENT_CHANGED_EVENT = "oyekool:consent-changed";

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function storeConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Private browsing or blocked storage — nothing to persist to.
  }
  window.dispatchEvent(new CustomEvent<CookieConsent>(CONSENT_CHANGED_EVENT, { detail: consent }));
}

/** Notifies listeners (e.g. Google Analytics) the moment the user saves a new
 * choice, so consent updates take effect immediately without a page reload. */
export function onConsentChange(handler: (consent: CookieConsent) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<CookieConsent>).detail);
  window.addEventListener(CONSENT_CHANGED_EVENT, listener);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, listener);
}

/** Opens the cookie settings modal from anywhere (e.g. the footer link),
 * without needing shared React state across layout boundaries. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export function onOpenCookieSettings(handler: () => void) {
  window.addEventListener(OPEN_SETTINGS_EVENT, handler);
  return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handler);
}
