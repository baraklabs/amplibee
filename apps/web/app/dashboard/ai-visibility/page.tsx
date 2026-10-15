'use client'

import { useDash } from '../../../components/dashboard/DashboardContext.tsx'
import { Gate, LockedPage, PageHead, Sketch } from '../../../components/dashboard/ui.tsx'

const ENGINES = ['Google Search', 'ChatGPT', 'Perplexity', 'Gemini']

export default function AiVisibility() {
  const { limits, ws } = useDash()
  return (
    <>
      <PageHead title="AI visibility" sub="Do AI assistants mention you when buyers ask?" />
      <Gate
        feature="aiVisibility"
        locked={
          <LockedPage feature="aiVisibility" title="See what AI says about you" text="We ask the same questions your buyers ask in the AI tools they use, every day, and show you whether you are named." bullets={['Google Search, ChatGPT, Perplexity, Gemini and more', 'Up to 50 prompts tracked daily', 'See which competitors the answers name instead']}>
            <Sketch rows={5} cols={4} />
          </LockedPage>
        }
      >
        <section className="card pad">
          <h2>Your prompts</h2>
          <p className="muted">You can track {limits.prompts} prompts a day across {ENGINES.join(', ')} and more.</p>
          <div className="nudge"><p>AI tracking for {ws.domain || 'your site'} is being switched on for your account. We will email you when the first readings are in.</p><a className="btn small secondary" href="/contact?topic=general">Ask a question</a></div>
        </section>
      </Gate>
    </>
  )
}
