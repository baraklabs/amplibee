// Signed login tokens (HS256) made with Web Crypto, so there is no library to load. Signing and checking only
// ever happen inside the Edge Function; the browser just carries the token.

import { env } from './env.ts'

const enc = new TextEncoder()
const dec = new TextDecoder()

export const ACCESS_TTL_SECONDS = 30 * 60
export const PENDING_TTL_SECONDS = 30 * 60
const ISSUER = 'https://amplibee.com'
const AUDIENCE = 'amplibee-api'

export type TokenPurpose = 'access' | 'verify'

function b64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function unb64url(s: string): Uint8Array<ArrayBuffer> {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function key(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage])
}

export function jwtSecret(): string {
  const s = env('JWT_SECRET')
  if (s.length < 32) throw new Error('JWT_SECRET is missing or shorter than 32 characters.')
  return s
}

export async function signToken(userId: string, purpose: TokenPurpose, ttlSeconds: number, secret = jwtSecret()): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const head = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const claims = b64url(enc.encode(JSON.stringify({ sub: userId, purpose, iss: ISSUER, aud: AUDIENCE, iat: now, exp: now + ttlSeconds })))
  const sig = await crypto.subtle.sign('HMAC', await key(secret, 'sign'), enc.encode(`${head}.${claims}`))
  return `${head}.${claims}.${b64url(new Uint8Array(sig))}`
}

/** The user id when the token is genuine, unexpired and made for this purpose, otherwise null. */
export async function verifyToken(token: string, purpose: TokenPurpose, secret = jwtSecret()): Promise<string | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const okSig = await crypto.subtle.verify('HMAC', await key(secret, 'verify'), unb64url(parts[2]), enc.encode(`${parts[0]}.${parts[1]}`))
    if (!okSig) return null
    const head = JSON.parse(dec.decode(unb64url(parts[0])))
    if (head.alg !== 'HS256') return null
    const c = JSON.parse(dec.decode(unb64url(parts[1])))
    if (c.iss !== ISSUER || c.aud !== AUDIENCE || c.purpose !== purpose) return null
    if (typeof c.sub !== 'string' || typeof c.exp !== 'number' || c.exp < Math.floor(Date.now() / 1000)) return null
    return c.sub
  } catch {
    return null
  }
}
