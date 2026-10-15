'use client'

import Link from 'next/link'
import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Meter, PageHead } from '../../../components/dashboard/ui.tsx'
import { LIMITS, nextPlan, planById, TRIAL_DAYS } from '../../../lib/content/plans.ts'

const daysLeft = (iso: string) => {
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  return d <= 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`
}

/** What the account has now. Changing plans always happens on the pricing page. */
export default function PlanPage() {
  const { plan, limits, ws, me } = useDash()
  const current = planById(plan)
  const next = nextPlan(plan)
  const l = LIMITS[plan]

  return (
    <>
      <PageHead title="Plan and billing" sub={`You are on the ${current.name} plan.`} action={<Link className="btn" href="/pricing">{next ? 'See plans and upgrade' : 'See plans'}</Link>} />
      {me.trial_ends_at ? <p className="nudge" role="status">Your free trial ends {daysLeft(me.trial_ends_at)}. After that your account goes back to Free.</p> : null}

      <div className="dash-cols">
        <div className="dash-col">
          <section className="card pad">
            <div className="card-head">
              <h2>{current.name}</h2>
              <span className="plan-badge">{current.monthly ? `$${current.monthly}/mo` : 'Free'}</span>
            </div>
            <p className="muted">{current.blurb}</p>
            <ul className="ticks">
              <li>{l.competitors} competitors</li>
              <li>{l.keywords ? `${l.keywords} keywords` : 'No keyword tracking'}</li>
              <li>{l.directories ? `${l.directories}${plan === 'authority' ? '+' : ''} directory submissions` : 'No directory submissions'}</li>
              <li>{l.blogPosts ? `${l.blogPosts} blog posts` : 'No blog posts'}</li>
              {l.aiVisibility ? <li>AI visibility</li> : null}
            </ul>
          </section>

          {next ? (
            <section className="card pad upsell">
              <span className="lock-chip">{next.name}: ${next.monthly}/mo</span>
              <h2>Want more? Try {next.name}</h2>
              <p className="muted">{next.blurb}{me.trial_available && !me.trial_ends_at ? ` Every paid plan starts with a ${TRIAL_DAYS}-day free trial.` : ''}</p>
              <Link className="btn" href="/pricing">Compare plans</Link>
            </section>
          ) : null}
        </div>

        <div className="dash-col">
          <section className="card pad">
            <h2>Usage</h2>
            <Meter used={ws.competitors.length} max={limits.competitors} label="Competitors" />
            {limits.keywords ? <Meter used={ws.keywords.length} max={limits.keywords} label="Keywords" /> : null}
            {limits.directories ? <Meter used={Object.keys(ws.directories).length} max={limits.directories} label="Directory submissions" /> : null}
          </section>
        </div>
      </div>
    </>
  )
}
