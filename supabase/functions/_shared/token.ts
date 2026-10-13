// Signed report links. The link in the unlock email carries "<check id>.<signature>".

const enc = new TextEncoder()

function b64url(buf: ArrayBuffer): string {
  let s = ''
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(message)))
}

export async function signReportToken(secret: string, checkId: string): Promise<string> {
  return `${checkId}.${(await hmac(secret, 'report:' + checkId)).slice(0, 32)}`
}

/** Returns the check id when the token is valid, otherwise null. */
export async function verifyReportToken(secret: string, token: string | null | undefined): Promise<string | null> {
  if (!secret || !token) return null
  const dot = token.lastIndexOf('.')
  if (dot < 1) return null
  const id = token.slice(0, dot)
  const expected = await signReportToken(secret, id)
  if (expected.length !== token.length) return null
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i)
  return diff === 0 ? id : null
}

export async function hashIp(ip: string, salt: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(`${salt}:${ip}`))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}
