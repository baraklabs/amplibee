// Works out who is calling. The browser sends its access token (made by api/v1/auth/*) in the Authorization header;
// we check the signature and expiry, then confirm the account still exists, is active and has a confirmed email.

import type { Db } from './db.ts'
import { verifyToken } from './jwt.ts'

export interface AuthUser {
  id: string
  email: string
}

/** The slice of the database this needs, so tests can pass a fake. */
export interface UserStore {
  findUser(id: string): Promise<{ id: string; email: string; verified: boolean; active: boolean } | null>
}

const BEARER = /^Bearer\s+([A-Za-z0-9._-]{20,4096})$/

/** Returns the signed-in user, or null for a missing, malformed, expired, unconfirmed or disabled login. */
export async function verifyUser(store: UserStore, header: string | null | undefined, secret?: string): Promise<AuthUser | null> {
  const m = BEARER.exec(header ?? '')
  if (!m) return null
  try {
    const id = await verifyToken(m[1], 'access', secret)
    if (!id) return null
    const u = await store.findUser(id)
    if (!u || !u.verified || !u.active) return null
    return { id: u.id, email: u.email }
  } catch {
    return null
  }
}

/** The real user lookup, over the service-role client. */
export function dbUsers(db: Db): UserStore {
  return {
    async findUser(id) {
      const { data, error } = await db.from('users').select('id, email, verified, active').eq('id', id).maybeSingle()
      if (error) throw new Error(`user lookup: ${error.message}`)
      return data as { id: string; email: string; verified: boolean; active: boolean } | null
    },
  }
}
