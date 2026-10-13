// Deno-only DNS resolver for the SSRF guard. Resolves A and AAAA records ourselves so that every
// address is judged before a request is made.

import type { Resolver } from './ssrf.ts'

declare const Deno: { resolveDns(name: string, type: 'A' | 'AAAA'): Promise<string[]> }

export const denoResolver: Resolver = async (host) => {
  const [a, aaaa] = await Promise.allSettled([Deno.resolveDns(host, 'A'), Deno.resolveDns(host, 'AAAA')])
  const out: string[] = []
  if (a.status === 'fulfilled') out.push(...a.value)
  if (aaaa.status === 'fulfilled') out.push(...aaaa.value)
  return out
}
