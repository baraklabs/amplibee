'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { api, ApiError } from '../lib/api.ts'
import { notifyAccountChanged } from '../lib/auth.ts'
import { annualPerMonth, type Plan, type PlanId, TRIAL_DAYS } from '../lib/content/plans.ts'

/** A popup that asks before the plan changes, then changes it. `from` is the plan being left. */
export function PlanConfirm({ from, to, annual, trial = false, onClose }: { from: Plan; to: Plan; annual: boolean; trial?: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const confirmBtn = useRef<HTMLButtonElement>(null)
  const up = to.monthly > from.monthly

  useEffect(() => {
    confirmBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  async function confirm() {
    setBusy(true)
    setError('')
    try {
      await api.switchPlan(to.id as PlanId)
      notifyAccountChanged()
      setDone(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not change your plan. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="pc-title">
        {done ? (
          <>
            <h2 id="pc-title">{trial ? `Your ${TRIAL_DAYS}-day trial of ${to.name} has started` : `You are on ${to.name}`}</h2>
            <p className="muted">Your dashboard now has everything {to.name} includes.{trial ? ` The trial ends in ${TRIAL_DAYS} days.` : ''}</p>
            <p className="modal-actions">
              <Link className="btn" href="/dashboard">Go to your dashboard</Link>
              <button type="button" className="btn secondary" onClick={onClose}>Close</button>
            </p>
          </>
        ) : (
          <>
            <h2 id="pc-title">{trial ? `Start your ${TRIAL_DAYS}-day free trial of ${to.name}?` : `${up ? 'Upgrade' : 'Switch'} to ${to.name}?`}</h2>
            <p className="muted">
              {trial ? `Free for ${TRIAL_DAYS} days, then ` : `From ${from.name} to ${to.name}, at `}
              {to.monthly ? `$${annual ? annualPerMonth(to.monthly) : to.monthly} a month${annual ? ', billed yearly' : ''}` : 'free'}.
              {up || trial ? '' : ' Anything over the new limits is trimmed the next time your dashboard saves.'}
            </p>
            <p className="caption muted">{trial ? 'Test mode: nothing is charged, and your account goes back to Free when the trial ends.' : 'Test mode: the change applies straight away and nothing is charged.'}</p>
            {error ? <p className="field-error" role="alert">{error}</p> : null}
            <p className="modal-actions">
              <button ref={confirmBtn} type="button" className="btn" disabled={busy} onClick={confirm}>{busy ? 'Starting' : trial ? 'Start free trial' : `${up ? 'Upgrade' : 'Switch'} to ${to.name}`}</button>
              <button type="button" className="btn secondary" disabled={busy} onClick={onClose}>Cancel</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
