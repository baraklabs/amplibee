// Accounts: sign up, sign in, Google, email confirmation, password reset and sessions. Passwords are hashed with
// PBKDF2, logins are signed tokens (30 minutes) plus a rotating refresh token kept hashed in user_sessions (30 days).
// Every response uses the same envelope as the rest of the API.

import { z } from 'zod'
import { dbUsers, verifyUser } from '../_shared/auth.ts'
import { getDb } from '../_shared/db.ts'
import { AUTH_FROM, codeEmail, REPLY_TO, sendEmail, WELCOME_FROM, welcomeEmail } from '../_shared/email.ts'
import { fail, ok } from '../_shared/envelope.ts'
import { env, siteUrl } from '../_shared/env.ts'
import { verifyGoogleIdToken } from '../_shared/google.ts'
import { ACCESS_TTL_SECONDS, PENDING_TTL_SECONDS, signToken, verifyToken } from '../_shared/jwt.ts'
import { generateLinkToken, generateOtp, hashPassword, sha256Hex, timingSafeEqual, verifyPassword } from '../_shared/password.ts'
import { newSignupMessage, notifyTelegram } from '../_shared/telegram.ts'
import { hashIp } from '../_shared/token.ts'
import { body, clientIp, hit } from './handlers.ts'

const OTP_TTL_MS = 10 * 60 * 1000
const RESET_TTL_MS = 15 * 60 * 1000
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000
const MAX_ATTEMPTS = 5

const email = z.string({ required_error: 'Enter your email address.' }).trim().toLowerCase().email('Enter a valid email address.').max(200)
const password = z.string({ required_error: 'Enter a password.' }).min(8, 'Your password must be at least 8 characters.').max(200)

const signupSchema = z.object({ name: z.string().trim().max(100).optional(), email, password })
const signinSchema = z.object({ email, password: z.string().min(1, 'Enter your password.').max(200) })
const googleSchema = z.object({ credential: z.string().min(20).max(4096) })
const verifySchema = z.object({ code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code from your email.') })
const tokenSchema = z.object({ token: z.string().trim().min(20).max(200) })
const forgotSchema = z.object({ email })
const resetSchema = z.union([
  z.object({ token: z.string().trim().min(20).max(200), password }),
  z.object({ email, code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code from your email.'), password }),
])
const refreshSchema = z.object({ refresh_token: z.string().min(10).max(200) })

const TRY_AGAIN = 'Something went wrong. Try again in a minute.'
const SIGNED_OUT = 'Your session has ended. Sign in again.'

/** Counts a try against a per-IP daily limit. Returns a 429 response when it is used up. */
async function limited(req: Request, name: string, limit: number): Promise<Response | null> {
  const ip = await hashIp(clientIp(req), env('IP_HASH_SALT', 'amplibee'))
  if ((await hit(`auth:${name}:${ip}`)) <= limit) return null
  return fail('rate_limited', 'Too many attempts today. Try again tomorrow.', { status: 429 })
}

function bearer(req: Request): string | null {
  const m = /^Bearer\s+(\S{20,4096})$/.exec(req.headers.get('authorization') ?? '')
  return m ? m[1] : null
}

const inMs = (ms: number) => new Date(Date.now() + ms).toISOString()

type Session =
  | { status: 'signed_in'; access_token: string; refresh_token: string }
  | { status: 'verification_required'; pending_token: string; email: string }

async function startSession(req: Request, userId: string): Promise<Session> {
  const refresh = crypto.randomUUID() + crypto.randomUUID()
  const { error } = await getDb().from('user_sessions').insert({
    user_id: userId,
    refresh_token_hash: await sha256Hex(refresh),
    ip_address: clientIp(req),
    user_agent: (req.headers.get('user-agent') ?? '').slice(0, 300),
    expires_at: inMs(REFRESH_TTL_MS),
  })
  if (error) throw new Error(`session insert: ${error.message}`)
  return { status: 'signed_in', access_token: await signToken(userId, 'access', ACCESS_TTL_SECONDS), refresh_token: refresh }
}

/** Writes a fresh code and link for confirming an address, and emails them. */
async function sendVerification(userId: string, to: string): Promise<void> {
  const otp = generateOtp()
  const link = generateLinkToken()
  const { error } = await getDb().from('users').update({
    otp_hash: await sha256Hex(otp),
    otp_expires_at: inMs(OTP_TTL_MS),
    otp_attempts: 0,
    verification_token_hash: await sha256Hex(link),
  }).eq('id', userId)
  if (error) throw new Error(`verification update: ${error.message}`)
  const sent = await sendEmail({ to, from: AUTH_FROM, ...codeEmail('verify', otp, `${siteUrl()}/verify-email?token=${encodeURIComponent(link)}`) })
  if (!sent.ok) console.error('auth: confirmation email not sent', sent.error)
}

/** One welcome email, when an account is first confirmed. A failed send is logged and never blocks sign-in. */
async function welcome(name: string | null, to: string): Promise<void> {
  const sent = await sendEmail({ to, from: WELCOME_FROM, replyTo: REPLY_TO, ...welcomeEmail(name, siteUrl()) })
  if (!sent.ok) console.error('auth: welcome email not sent', sent.error)
}

async function pending(userId: string, to: string): Promise<Session> {
  return { status: 'verification_required', pending_token: await signToken(userId, 'verify', PENDING_TTL_SECONDS), email: to }
}

// ---------- POST /v1/auth/signup ----------

export async function postSignup(req: Request): Promise<Response> {
  const b = await body(req, signupSchema)
  if ('error' in b) return b.error
  const limit = await limited(req, 'signup', 10)
  if (limit) return limit
  const { name, email: addr, password: pw } = b.data
  const db = getDb()

  const { data: existing } = await db.from('users').select('id, verified, active').eq('email', addr).maybeSingle()
  if (existing?.verified) return fail('email_taken', 'An account with that email already exists. Sign in instead.', { status: 409 })
  if (existing && !existing.active) return fail('account_disabled', 'This account is disabled.', { status: 403 })

  // A sign-up that was never confirmed is taken over by whoever signs up again, with the newest password.
  const row = { email: addr, name: name || null, password_hash: await hashPassword(pw), verified: false }
  const saved = existing
    ? await db.from('users').update(row).eq('id', existing.id).select('id').single()
    : await db.from('users').insert(row).select('id').single()
  if (saved.error) {
    console.error('auth: signup failed', saved.error.message)
    return fail('internal_error', TRY_AGAIN, { status: 500 })
  }
  await sendVerification(saved.data.id, addr)
  return ok(await pending(saved.data.id, addr), { status: 201 })
}

// ---------- POST /v1/auth/signin ----------

export async function postSignin(req: Request): Promise<Response> {
  const b = await body(req, signinSchema)
  if ('error' in b) return b.error
  const limit = await limited(req, 'signin', 60)
  if (limit) return limit
  const { email: addr, password: pw } = b.data

  const { data: user } = await getDb().from('users').select('id, password_hash, verified, active').eq('email', addr).maybeSingle()
  // One message for "no such account", "wrong password" and "Google-only account", so it does not reveal which exist.
  if (!user || !user.active || !user.password_hash || !(await verifyPassword(pw, user.password_hash))) {
    return fail('invalid_credentials', 'That email and password do not match.', { status: 401 })
  }
  if (!user.verified) {
    await sendVerification(user.id, addr)
    return ok(await pending(user.id, addr))
  }
  return ok(await startSession(req, user.id))
}

// ---------- POST /v1/auth/google ----------

export async function postGoogle(req: Request): Promise<Response> {
  const b = await body(req, googleSchema)
  if ('error' in b) return b.error
  const limit = await limited(req, 'google', 60)
  if (limit) return limit

  const checked = await verifyGoogleIdToken(b.data.credential, env('GOOGLE_CLIENT_ID'))
  if ('reason' in checked) return fail(`google_${checked.reason}`, 'Google sign-in did not work. Try again.', { status: 401 })
  const profile = checked

  const db = getDb()
  const { data: existing } = await db.from('users').select('id, active, name').eq('email', profile.email).maybeSingle()
  if (existing && !existing.active) return fail('account_disabled', 'This account is disabled.', { status: 403 })

  // Google has already confirmed this address, so the account comes out verified. A password the owner set earlier
  // keeps working; any unspent code is cleared.
  const saved = existing
    ? await db.from('users').update({ verified: true, name: existing.name ?? profile.name, otp_hash: null, otp_expires_at: null, verification_token_hash: null }).eq('id', existing.id).select('id').single()
    : await db.from('users').insert({ email: profile.email, name: profile.name, verified: true }).select('id').single()
  if (saved.error) {
    console.error('auth: google upsert failed', saved.error.message)
    return fail('internal_error', TRY_AGAIN, { status: 500 })
  }
  if (!existing) {
    await notifyTelegram(newSignupMessage(profile.name, profile.email, 'Google'))
    await welcome(profile.name, profile.email)
  }
  return ok(await startSession(req, saved.data.id))
}

// ---------- POST /v1/auth/verify, /verify-link, /resend ----------

/** Marks the address confirmed and clears the code and link, so spending either retires both. */
async function confirm(userId: string, requireLinkHash?: string): Promise<boolean> {
  let q = getDb().from('users').update({ verified: true, otp_hash: null, otp_expires_at: null, otp_attempts: 0, verification_token_hash: null }).eq('id', userId)
  if (requireLinkHash) q = q.eq('verification_token_hash', requireLinkHash)
  const { data, error } = await q.select('id').maybeSingle()
  if (error) throw new Error(`confirm: ${error.message}`)
  return !!data
}

export async function postVerify(req: Request): Promise<Response> {
  const token = bearer(req)
  const userId = token ? await verifyToken(token, 'verify') : null
  if (!userId) return fail('session_expired', 'Your sign-up session has ended. Sign in to get a new code.', { status: 401 })
  const b = await body(req, verifySchema)
  if ('error' in b) return b.error
  const limit = await limited(req, 'verify', 60)
  if (limit) return limit

  const db = getDb()
  const { data: user } = await db.from('users').select('id, email, name, verified, otp_hash, otp_expires_at, otp_attempts, active').eq('id', userId).maybeSingle()
  if (!user || !user.active || !user.otp_hash) return fail('invalid_code', 'That code is not valid. Ask for a new one.', { status: 400 })
  if (user.otp_attempts >= MAX_ATTEMPTS) return fail('too_many_attempts', 'Too many wrong codes. Ask for a new one.', { status: 429 })
  if (!user.otp_expires_at || new Date(user.otp_expires_at).getTime() < Date.now()) return fail('code_expired', 'That code has expired. Ask for a new one.', { status: 400 })
  if (!timingSafeEqual(await sha256Hex(b.data.code), user.otp_hash)) {
    await db.from('users').update({ otp_attempts: user.otp_attempts + 1 }).eq('id', user.id)
    return fail('invalid_code', 'That code is not right.', { status: 400 })
  }
  if (!(await confirm(user.id))) return fail('invalid_code', 'That code is not valid. Ask for a new one.', { status: 400 })
  if (!user.verified) {
    await notifyTelegram(newSignupMessage(user.name, user.email, 'Password'))
    await welcome(user.name, user.email)
  }
  return ok(await startSession(req, user.id))
}

export async function postVerifyLink(req: Request): Promise<Response> {
  const b = await body(req, tokenSchema)
  if ('error' in b) return b.error
  const limit = await limited(req, 'verify-link', 60)
  if (limit) return limit

  const hash = await sha256Hex(b.data.token)
  const { data: user } = await getDb().from('users').select('id, email, name, verified, otp_expires_at, active').eq('verification_token_hash', hash).maybeSingle()
  const gone = fail('invalid_link', 'This confirmation link is not valid or has expired. Sign in to get a new one.', { status: 400 })
  if (!user || !user.active || !user.otp_expires_at || new Date(user.otp_expires_at).getTime() < Date.now()) return gone
  // Clearing the hash is what makes the link single use; the guard stops two clicks racing.
  if (!(await confirm(user.id, hash))) return gone
  if (!user.verified) {
    await notifyTelegram(newSignupMessage(user.name, user.email, 'Email link'))
    await welcome(user.name, user.email)
  }
  return ok(await startSession(req, user.id))
}

export async function postResend(req: Request): Promise<Response> {
  const token = bearer(req)
  const userId = token ? await verifyToken(token, 'verify') : null
  if (!userId) return fail('session_expired', 'Your sign-up session has ended. Sign in to get a new code.', { status: 401 })
  const limit = await limited(req, 'resend', 10)
  if (limit) return limit

  const { data: user } = await getDb().from('users').select('id, email, verified, active').eq('id', userId).maybeSingle()
  if (!user || !user.active) return fail('session_expired', 'Your sign-up session has ended. Sign in to get a new code.', { status: 401 })
  if (user.verified) return fail('already_verified', 'This account is already confirmed. Sign in.', { status: 400 })
  await sendVerification(user.id, user.email)
  return ok(await pending(user.id, user.email))
}

// ---------- POST /v1/auth/forgot, /reset ----------

export async function postForgot(req: Request): Promise<Response> {
  const b = await body(req, forgotSchema)
  if ('error' in b) return b.error
  const limit = await limited(req, 'forgot', 10)
  if (limit) return limit

  const db = getDb()
  const { data: user } = await db.from('users').select('id, email, active, password_hash').eq('email', b.data.email).maybeSingle()
  // Always the same answer, so this cannot be used to find out which addresses have accounts. Google-only accounts
  // have no password to reset, so nothing is sent for them.
  if (user?.active && user.password_hash) {
    await db.from('password_reset_codes').update({ used: true }).eq('user_id', user.id).eq('used', false)
    const otp = generateOtp()
    const link = generateLinkToken()
    const { error } = await db.from('password_reset_codes').insert({
      user_id: user.id,
      otp_hash: await sha256Hex(otp),
      link_token_hash: await sha256Hex(link),
      expires_at: inMs(RESET_TTL_MS),
    })
    if (error) {
      console.error('auth: reset insert failed', error.message)
      return fail('internal_error', TRY_AGAIN, { status: 500 })
    }
    const sent = await sendEmail({ to: user.email, from: AUTH_FROM, ...codeEmail('reset', otp, `${siteUrl()}/reset-password?token=${encodeURIComponent(link)}`) })
    if (!sent.ok) console.error('auth: reset email not sent', sent.error)
  }
  return ok({ sent: true })
}

interface ResetRow { id: string; user_id: string; otp_hash: string; expires_at: string; attempts: number }

export async function postReset(req: Request): Promise<Response> {
  const b = await body(req, resetSchema)
  if ('error' in b) return b.error
  const limit = await limited(req, 'reset', 30)
  if (limit) return limit
  const db = getDb()
  const cols = 'id, user_id, otp_hash, expires_at, attempts'
  const bad = fail('invalid_code', 'That code or link is not valid or has expired. Ask for a new one.', { status: 400 })
  const expired = (r: ResetRow) => new Date(r.expires_at).getTime() < Date.now()

  let row: ResetRow | null = null
  if ('token' in b.data) {
    const { data } = await db.from('password_reset_codes').select(cols).eq('link_token_hash', await sha256Hex(b.data.token)).eq('used', false).maybeSingle()
    if (!data || expired(data)) return bad
    row = data
  } else {
    const { data: user } = await db.from('users').select('id, active').eq('email', b.data.email).maybeSingle()
    if (!user?.active) return bad
    const { data } = await db.from('password_reset_codes').select(cols).eq('user_id', user.id).eq('used', false).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!data || expired(data)) return bad
    if (data.attempts >= MAX_ATTEMPTS) return fail('too_many_attempts', 'Too many wrong codes. Ask for a new one.', { status: 429 })
    if (!timingSafeEqual(await sha256Hex(b.data.code), data.otp_hash)) {
      await db.from('password_reset_codes').update({ attempts: data.attempts + 1 }).eq('id', data.id)
      return fail('invalid_code', 'That code is not right.', { status: 400 })
    }
    row = data
  }

  // Spend the code first, and only while it is unused, so two requests with the same code cannot both set a password.
  const { data: burned } = await db.from('password_reset_codes').update({ used: true }).eq('id', row.id).eq('used', false).select('id').maybeSingle()
  if (!burned) return bad

  // Getting the email proves the address, so an account left unconfirmed comes out confirmed.
  const { error } = await db.from('users').update({ password_hash: await hashPassword(b.data.password), verified: true, otp_hash: null, otp_expires_at: null, otp_attempts: 0 }).eq('id', row.user_id)
  if (error) {
    console.error('auth: password update failed', error.message)
    return fail('internal_error', TRY_AGAIN, { status: 500 })
  }
  // A reset is the fix for a stolen password, so every session on every device ends.
  await db.from('user_sessions').update({ revoked: true }).eq('user_id', row.user_id)
  return ok({ reset: true })
}

// ---------- POST /v1/auth/refresh, /logout, GET /v1/auth/me ----------

export async function postRefresh(req: Request): Promise<Response> {
  const b = await body(req, refreshSchema)
  if ('error' in b) return b.error
  const limit = await limited(req, 'refresh', 2000)
  if (limit) return limit
  const db = getDb()

  const { data: s } = await db.from('user_sessions').select('id, user_id, expires_at, revoked').eq('refresh_token_hash', await sha256Hex(b.data.refresh_token)).maybeSingle()
  if (!s || s.revoked || new Date(s.expires_at).getTime() < Date.now()) return fail('session_expired', SIGNED_OUT, { status: 401 })
  const { data: user } = await db.from('users').select('id, active, verified').eq('id', s.user_id).maybeSingle()
  if (!user?.active || !user.verified) return fail('session_expired', SIGNED_OUT, { status: 401 })

  // Each refresh token works once: the next one replaces it.
  const next = crypto.randomUUID() + crypto.randomUUID()
  const { error } = await db.from('user_sessions').update({
    refresh_token_hash: await sha256Hex(next),
    expires_at: inMs(REFRESH_TTL_MS),
    last_used_at: new Date().toISOString(),
    ip_address: clientIp(req),
  }).eq('id', s.id)
  if (error) {
    console.error('auth: refresh failed', error.message)
    return fail('internal_error', TRY_AGAIN, { status: 500 })
  }
  return ok({ status: 'signed_in', access_token: await signToken(user.id, 'access', ACCESS_TTL_SECONDS), refresh_token: next } satisfies Session)
}

export async function postLogout(req: Request): Promise<Response> {
  const b = await body(req, refreshSchema)
  if ('error' in b) return ok({ signed_out: true })
  await getDb().from('user_sessions').update({ revoked: true }).eq('refresh_token_hash', await sha256Hex(b.data.refresh_token))
  return ok({ signed_out: true })
}

export async function getMe(req: Request): Promise<Response> {
  const user = await verifyUser(dbUsers(getDb()), req.headers.get('authorization'))
  if (!user) return fail('auth_required', SIGNED_OUT, { status: 401 })
  const { data } = await getDb().from('users').select('name, password_hash').eq('id', user.id).maybeSingle()
  return ok({ id: user.id, email: user.email, name: data?.name ?? null, has_password: !!data?.password_hash })
}
