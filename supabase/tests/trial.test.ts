import { describe, expect, it } from 'vitest'
import { afterSwitch, settle, TRIAL_DAYS, type TrialState } from '../functions/_shared/trial.ts'

const now = new Date('2026-10-15T12:00:00Z')
const fresh: TrialState = { plan: 'free', trial_ends_at: null, trial_used: false }
const days = (n: number) => new Date(now.getTime() + n * 86_400_000).toISOString()

describe('trial', () => {
  it('the first paid plan starts a 7 day trial', () => {
    const r = afterSwitch(fresh, 'growth', now)
    expect(r.plan).toBe('growth')
    expect(r.trial_ends_at).toBe(days(TRIAL_DAYS))
    expect(r.trial_used).toBe(true)
  })

  it('moving between paid plans keeps the same end date', () => {
    const trialing = afterSwitch(fresh, 'plus', now)
    const r = afterSwitch(trialing, 'scale', new Date(now.getTime() + 2 * 86_400_000))
    expect(r.plan).toBe('scale')
    expect(r.trial_ends_at).toBe(trialing.trial_ends_at)
  })

  it('a second trial is never given', () => {
    const r = afterSwitch({ plan: 'free', trial_ends_at: null, trial_used: true }, 'plus', now)
    expect(r).toEqual({ plan: 'plus', trial_ends_at: null, trial_used: true })
  })

  it('choosing free ends the trial but remembers it was used', () => {
    expect(afterSwitch(afterSwitch(fresh, 'plus', now), 'free', now)).toEqual({ plan: 'free', trial_ends_at: null, trial_used: true })
  })

  it('an expired trial drops back to free', () => {
    expect(settle({ plan: 'growth', trial_ends_at: days(-1), trial_used: true }, now)).toEqual({ plan: 'free', trial_ends_at: null, trial_used: true })
    expect(settle({ plan: 'growth', trial_ends_at: days(1), trial_used: true }, now).plan).toBe('growth')
  })

  it('a paid plan with no trial date is left alone', () => {
    expect(settle({ plan: 'growth', trial_ends_at: null, trial_used: true }, now).plan).toBe('growth')
  })
})
