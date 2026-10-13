import { describe, expect, it } from 'vitest'
import { type AuthClient, verifyUser } from '../functions/_shared/auth.ts'
import { requestSchema, unlockSchema } from '../functions/api/schemas.ts'

const JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.c2lnbmF0dXJl'
const ID = '11111111-1111-4111-8111-111111111111'

function client(user: Awaited<ReturnType<AuthClient['auth']['getUser']>>['data']['user'], error: { message: string } | null = null): AuthClient {
  return { auth: { getUser: async () => ({ data: { user }, error }) } }
}

describe('verifyUser', () => {
  const confirmed = { id: 'u1', email: 'maya@tallybook.test', email_confirmed_at: '2026-10-10T00:00:00Z' }

  it('returns the user for a genuine, confirmed login', async () => {
    expect(await verifyUser(client(confirmed), `Bearer ${JWT}`)).toEqual({ id: 'u1', email: 'maya@tallybook.test' })
  })
  it.each([null, undefined, '', 'Bearer', 'Bearer short', `Basic ${JWT}`, `bearer ${JWT}`, `Bearer ${JWT} extra`])('rejects header %j', async (h) => {
    expect(await verifyUser(client(confirmed), h as string | null)).toBeNull()
  })
  it('rejects a token Supabase does not accept', async () => {
    expect(await verifyUser(client(null, { message: 'invalid JWT' }), `Bearer ${JWT}`)).toBeNull()
  })
  it('rejects an unconfirmed email', async () => {
    expect(await verifyUser(client({ ...confirmed, email_confirmed_at: null }), `Bearer ${JWT}`)).toBeNull()
  })
  it('rejects a user with no email', async () => {
    expect(await verifyUser(client({ ...confirmed, email: null }), `Bearer ${JWT}`)).toBeNull()
  })
  it('treats a thrown error as not signed in', async () => {
    const boom: AuthClient = { auth: { getUser: async () => { throw new Error('network') } } }
    expect(await verifyUser(boom, `Bearer ${JWT}`)).toBeNull()
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
