// Checks a Google Identity Services ID token with Google's tokeninfo endpoint and makes sure it was issued for our
// own client id, so a token minted for another app cannot be replayed here.

export interface GoogleProfile {
  email: string
  name: string | null
}

/** Why a token was refused. Short and safe to show: it names a setup problem, never a secret. */
export interface GoogleRefusal {
  reason: 'not_configured' | 'rejected_by_google' | 'wrong_app' | 'wrong_issuer' | 'email_not_verified' | 'no_email' | 'google_unreachable'
}

export async function verifyGoogleIdToken(credential: string, clientId: string, fetchImpl: typeof fetch = fetch): Promise<GoogleProfile | GoogleRefusal> {
  if (!clientId) {
    console.error('google: GOOGLE_CLIENT_ID is not set')
    return { reason: 'not_configured' }
  }
  try {
    const res = await fetchImpl(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) {
      console.error(`google: tokeninfo answered with status ${res.status}`)
      return { reason: 'rejected_by_google' }
    }
    const t = (await res.json()) as Record<string, string | boolean>
    if (t.aud !== clientId) {
      console.error('google: token audience does not match GOOGLE_CLIENT_ID')
      return { reason: 'wrong_app' }
    }
    if (t.iss !== 'accounts.google.com' && t.iss !== 'https://accounts.google.com') return { reason: 'wrong_issuer' }
    if (t.email_verified !== 'true' && t.email_verified !== true) return { reason: 'email_not_verified' }
    if (typeof t.email !== 'string' || !t.email) return { reason: 'no_email' }
    return { email: t.email.toLowerCase(), name: typeof t.name === 'string' && t.name.trim() ? t.name.trim() : null }
  } catch (e) {
    console.error('google: tokeninfo request failed', e)
    return { reason: 'google_unreachable' }
  }
}
