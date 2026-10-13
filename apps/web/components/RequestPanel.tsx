'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, ApiError, type RequestType } from '../lib/api.ts'

const OPTIONS: { type: RequestType; title: string; text: string; cta: string }[] = [
  {
    type: 'directory_submission',
    title: 'Directory submission',
    text: 'We submit your product to the directories in your launch plan, so listings go live without you filling in each form.',
    cta: 'Request submissions',
  },
  {
    type: 'track_competitors',
    title: 'Competitor tracking',
    text: 'We keep watching the competitors you named, their rank, mentions and listings, and tell you when something changes.',
    cta: 'Track my competitors',
  },
  {
    type: 'launch_done_for_you',
    title: 'Launch done for you',
    text: 'We run your product launch end to end: directories, mentions and the fixes in your plan, so you can stay on the product.',
    cta: 'Launch it for me',
  },
]

/** Shown under an unlocked report. Each button records a request against the signed-in account. */
export function RequestPanel({ jobId }: { jobId: string }) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .listRequests(jobId)
      .then((rows) => setDone(Object.fromEntries(rows.map((r) => [r.type, true]))))
      .catch(() => {
        // not signed in or no requests yet: the buttons still work
      })
  }, [jobId])

  async function request(type: RequestType) {
    setError('')
    setBusy(type)
    try {
      await api.createRequest(jobId, type)
      setDone((d) => ({ ...d, [type]: true }))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.')
    }
    setBusy(null)
  }

  return (
    <section className="requests" aria-labelledby="req-h">
      <h3 id="req-h">Want us to do it for you?</h3>
      <p className="muted" style={{ maxWidth: '62ch' }}>
        Pick what you need. We reply by email with what is included and the price before anything is charged. See <Link href="/pricing">pricing</Link>.
      </p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="req-grid">
        {OPTIONS.map((o) => (
          <div className="req-card" key={o.type}>
            <h4>{o.title}</h4>
            <p>{o.text}</p>
            {done[o.type] ? (
              <p className="req-done" role="status"><span className="ico" aria-hidden="true"><span className="tick" style={{ opacity: 1 }} /></span>Requested. We will email you.</p>
            ) : (
              <button type="button" className="btn small" onClick={() => request(o.type)} disabled={busy !== null}>{busy === o.type ? 'Sending' : o.cta}</button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
