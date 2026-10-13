// Checks a Google Identity Services ID token with Google's tokeninfo endpoint and makes sure it was issued for our
// own client id, so a token minted for another app cannot be replayed here.

export interface GoogleProfile {
  email: string
  name: string | null
}

export async function verifyGoogleIdToken(credential: string, clientId: string, fetchImpl: typeof fetch = fetch): Promise<GoogleProfile | null> {
  if (!clientId) {
    console.error('google: GOOGLE_CLIENT_ID is not set')
    return null
  }
  try {
    const res = await fetchImpl(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const t = (await res.json()) as Record<string, string | boolean>
    if (t.aud !== clientId) {
      console.error('google: token audience does not match GOOGLE_CLIENT_ID')
      return null
    }
    if (t.iss !== 'accounts.google.com' && t.iss !== 'https://accounts.google.com') return null
    if (t.email_verified !== 'true' && t.email_verified !== true) return null
    if (typeof t.email !== 'string' || !t.email) return null
    return { email: t.email.toLowerCase(), name: typeof t.name === 'string' && t.name.trim() ? t.name.trim() : null }
  } catch (e) {
    console.error('google: tokeninfo request failed', e)
    return null
  }
}
