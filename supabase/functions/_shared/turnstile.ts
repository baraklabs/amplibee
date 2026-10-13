// Cloudflare Turnstile server-side verification.

export interface TurnstileResult {
  ok: boolean
  reason?: string
}

export async function verifyTurnstile(
  token: string | undefined,
  secret: string,
  ip: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<TurnstileResult> {
  if (!secret) return { ok: false, reason: 'not_configured' }
  if (!token || token.length > 2048) return { ok: false, reason: 'missing_token' }
  const form = new URLSearchParams({ secret, response: token })
  if (ip) form.set('remoteip', ip)
  try {
    const res = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(8_000),
    })
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    return data.success ? { ok: true } : { ok: false, reason: (data['error-codes'] ?? ['rejected']).join(',') }
  } catch {
    return { ok: false, reason: 'unreachable' }
  }
}
