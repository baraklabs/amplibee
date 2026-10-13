// Verifies a Supabase Auth login on the server. The browser sends its access token in the Authorization header;
// the service-role client asks Supabase Auth whether that token is genuine and who it belongs to.

export interface AuthUser {
  id: string
  email: string
}

/** The slice of the Supabase client this needs, so tests can pass a fake. */
export interface AuthClient {
  auth: {
    getUser(jwt: string): Promise<{
      data: { user: { id: string; email?: string | null; email_confirmed_at?: string | null } | null }
      error: { message: string } | null
    }>
  }
}

const BEARER = /^Bearer\s+([A-Za-z0-9._-]{20,4096})$/

/** Returns the signed-in user, or null for a missing, malformed, expired or unconfirmed login. */
export async function verifyUser(client: AuthClient, header: string | null | undefined): Promise<AuthUser | null> {
  const m = BEARER.exec(header ?? '')
  if (!m) return null
  try {
    const { data, error } = await client.auth.getUser(m[1])
    const u = data.user
    if (error || !u || !u.email || !u.email_confirmed_at) return null
    return { id: u.id, email: u.email }
  } catch {
    return null
  }
}
