// The one place that builds Oyekool links. Change the format here and every button follows.

import type { OyekoolPrefill } from './shared/types.ts'

const BASE = 'https://oyekool.com/login'

/**
 * Query parameter names used to prefill a campaign. Oyekool has not confirmed these names, so treat them
 * as a proposal: change them here once Oyekool publishes the real ones, or set
 * NEXT_PUBLIC_OYEKOOL_PREFILL=false to send only the sign-up link and UTM tags.
 */
export const PREFILL_PARAMS = { task: 'task_type', brief: 'brief', price: 'budget_usd' } as const

const prefillEnabled = () => process.env.NEXT_PUBLIC_OYEKOOL_PREFILL !== 'false'

export interface OyekoolLinkInput {
  gapId: string
  domain: string
  prefill?: OyekoolPrefill
}

export function buildOyekoolUrl({ gapId, domain, prefill }: OyekoolLinkInput): string {
  const u = new URL(BASE)
  u.searchParams.set('mode', 'signup')
  u.searchParams.set('utm_source', 'amplibee')
  u.searchParams.set('utm_medium', 'report')
  u.searchParams.set('utm_campaign', 'visibility_gap')
  u.searchParams.set('utm_content', gapId)
  if (domain) u.searchParams.set('utm_term', domain)
  if (prefill && prefillEnabled()) {
    u.searchParams.set(PREFILL_PARAMS.task, prefill.task)
    u.searchParams.set(PREFILL_PARAMS.brief, prefill.brief.slice(0, 500))
    u.searchParams.set(PREFILL_PARAMS.price, String(prefill.price_usd))
  }
  return u.toString()
}

export const TASK_LABEL: Record<OyekoolPrefill['task'], string> = {
  post: 'creators post about it',
  write: 'creators write about it',
  engage: 'creators try it and engage',
}
