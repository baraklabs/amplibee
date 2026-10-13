export const SITE = {
  name: 'Amplibee',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  tagline: 'A free visibility check for founders',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@amplibee.com',
  updated: '2026-10-10',
}

/** Base URL of the JSON API, ending in /v1. Example: https://<ref>.supabase.co/functions/v1/api/v1 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:54321/functions/v1/api/v1').replace(/\/$/, '')

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

/** Report pages are noindex unless REPORT_INDEXABLE=true on the server. */
export const reportsIndexable = () => process.env.REPORT_INDEXABLE === 'true'

export function absolute(path: string): string {
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`
}
