import { describe, expect, it } from 'vitest'
import { type UserStore, verifyUser } from '../functions/_shared/auth.ts'
import { signToken } from '../functions/_shared/jwt.ts'
import { requestSchema, unlockSchema } from '../functions/api/schemas.ts'

const SECRET = 'test-secret-test-secret-test-secret-1234'
const ID = '11111111-1111-4111-8111-111111111111'

type Row = Awaited<ReturnType<UserStore['findUser']>>
const store = (row: Row): UserStore => ({ findUser: async () => row })
const maya: Row = { id: 'u1', email: 'maya@tallybook.test', verified: true, active: true }

describe('verifyUser', () => {
  it('returns the user for a genuine, confirmed login', async () => {
    const t = await signToken('u1', 'access', 60, SECRET)
    expect(await verifyUser(store(maya), `Bearer ${t}`, SECRET)).toEqual({ id: 'u1', email: 'maya@tallybook.test' })
  })
  it.each([null, undefined, '', 'Bearer', 'Bearer short', 'Basic abcdefghijklmnopqrstuvwxyz', 'bearer abcdefghijklmnopqrstuvwxyz'])('rejects header %j', async (h) => {
    expect(await verifyUser(store(maya), h as string | null, SECRET)).toBeNull()
  })
  it('rejects a token signed with another secret', async () => {
    const t = await signToken('u1', 'access', 60, 'another-secret-another-secret-another-1')
    expect(await verifyUser(store(maya), `Bearer ${t}`, SECRET)).toBeNull()
  })
  it('rejects an expired token', async () => {
    const t = await signToken('u1', 'access', -10, SECRET)
    expect(await verifyUser(store(maya), `Bearer ${t}`, SECRET)).toBeNull()
  })
  it('rejects a pending (verify-only) token', async () => {
    const t = await signToken('u1', 'verify', 60, SECRET)
    expect(await verifyUser(store(maya), `Bearer ${t}`, SECRET)).toBeNull()
  })
  it('rejects a tampered token', async () => {
    const t = await signToken('u1', 'access', 60, SECRET)
    const [h, , s] = t.split('.')
    const forged = btoa(JSON.stringify({ sub: 'u2', purpose: 'access', iss: 'https://amplibee.com', aud: 'amplibee-api', exp: 9999999999 })).replace(/=+$/, '')
    expect(await verifyUser(store(maya), `Bearer ${h}.${forged}.${s}`, SECRET)).toBeNull()
  })
  it('rejects an unconfirmed, disabled or missing account', async () => {
    const t = await signToken('u1', 'access', 60, SECRET)
    expect(await verifyUser(store({ ...maya!, verified: false }), `Bearer ${t}`, SECRET)).toBeNull()
    expect(await verifyUser(store({ ...maya!, active: false }), `Bearer ${t}`, SECRET)).toBeNull()
    expect(await verifyUser(store(null), `Bearer ${t}`, SECRET)).toBeNull()
  })
  it('treats a thrown error as not signed in', async () => {
    const t = await signToken('u1', 'access', 60, SECRET)
    const boom: UserStore = { findUser: async () => { throw new Error('network') } }
    expect(await verifyUser(boom, `Bearer ${t}`, SECRET)).toBeNull()
  })
})

describe('passwords', () => {
  it('verifies the right password and rejects the wrong one', async () => {
    const { hashPassword, verifyPassword } = await import('../functions/_shared/password.ts')
    const h = await hashPassword('correct horse battery')
    expect(h.startsWith('pbkdf2$')).toBe(true)
    expect(await verifyPassword('correct horse battery', h)).toBe(true)
    expect(await verifyPassword('wrong horse battery', h)).toBe(false)
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false)
  })
})

describe('request schemas', () => {
  it('unlock needs only a job id now, not an email or a bot token', () => {
    expect(unlockSchema.safeParse({ job_id: ID }).success).toBe(true)
    expect(unlockSchema.safeParse({ job_id: 'nope' }).success).toBe(false)
    expect(unlockSchema.safeParse({}).success).toBe(false)
  })
  it.each(['directory_submission', 'track_competitors', 'launch_done_for_you'])('accepts request type %s', (type) => {
    expect(requestSchema.safeParse({ job_id: ID, type }).success).toBe(true)
  })
  it('rejects unknown types and over-long notes', () => {
    expect(requestSchema.safeParse({ job_id: ID, type: 'buy_links' }).success).toBe(false)
    expect(requestSchema.safeParse({ job_id: ID, type: 'track_competitors', note: 'x'.repeat(1001) }).success).toBe(false)
    expect(requestSchema.safeParse({ job_id: ID, type: 'track_competitors', note: 'x'.repeat(1000) }).success).toBe(true)
  })
})
