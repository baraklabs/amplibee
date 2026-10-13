// Password hashing with PBKDF2-SHA256 from Web Crypto (no library). Stored as "pbkdf2$<iterations>$<salt>$<hash>".
// Also the small hashing and code helpers the auth endpoints share.

const enc = new TextEncoder()
const ITERATIONS = 210_000

const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
const fromHex = (h: string): Uint8Array<ArrayBuffer> => Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16))

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, 256))
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(await derive(password, salt, ITERATIONS))}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, salt, hash] = stored.split('$')
  const iterations = Number(iter)
  if (scheme !== 'pbkdf2' || !Number.isInteger(iterations) || iterations < 1 || !salt || !hash) return false
  const got = await derive(password, fromHex(salt), iterations)
  return timingSafeEqual(toHex(got), hash)
}

/** Compares two strings without returning early, so timing does not reveal how much matched. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function sha256Hex(input: string): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(input))))
}

/** Six digits, from the secure random source. */
export function generateOtp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 900_000
  return String(100_000 + n)
}

/** The long one-click token that goes in emailed links. */
export function generateLinkToken(): string {
  return crypto.randomUUID() + crypto.randomUUID()
}
