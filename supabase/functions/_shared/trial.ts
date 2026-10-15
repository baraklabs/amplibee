// The 7-day free trial on every paid plan. Each account gets one. When it runs out the account goes back to Free.

import type { PlanId } from './plans.ts'

export const TRIAL_DAYS = 7

export interface TrialState {
  plan: PlanId
  trial_ends_at: string | null
  trial_used: boolean
}

const DAY_MS = 86_400_000

export const isTrialing = (s: Pick<TrialState, 'trial_ends_at'>, now = new Date()) => !!s.trial_ends_at && new Date(s.trial_ends_at) > now

/** A trial that has run out: the account drops to Free and the trial stays used. */
export function settle(s: TrialState, now = new Date()): TrialState {
  if (s.trial_ends_at && new Date(s.trial_ends_at) <= now) return { plan: 'free', trial_ends_at: null, trial_used: true }
  return s
}

/**
 * What an account looks like after choosing a plan.
 * Free ends any trial. A paid plan starts the trial the first time, keeps a running trial's end date when moving
 * between paid plans, and after that is a plain paid plan (in test mode, with no charge).
 */
export function afterSwitch(s: TrialState, target: PlanId, now = new Date()): TrialState {
  const cur = settle(s, now)
  if (target === 'free') return { plan: 'free', trial_ends_at: null, trial_used: cur.trial_used }
  if (isTrialing(cur, now)) return { ...cur, plan: target }
  if (!cur.trial_used) return { plan: target, trial_ends_at: new Date(now.getTime() + TRIAL_DAYS * DAY_MS).toISOString(), trial_used: true }
  return { plan: target, trial_ends_at: null, trial_used: true }
}
