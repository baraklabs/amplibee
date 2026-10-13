import type { QA } from '../lib/content/faq.ts'
import { RichText } from './RichText.tsx'

/**
 * Expandable questions: a + that turns into a minus when open. Built on native details and summary, so it is
 * keyboard accessible, needs no JavaScript, and the answers stay in the page HTML for search engines.
 */
export function FaqAccordion({ items }: { items: QA[] }) {
  return (
    <div className="faq-acc">
      {items.map((f) => (
        <details key={f.q}>
          <summary>
            <h3>{f.q}</h3>
            <span className="faq-icon" aria-hidden="true" />
          </summary>
          <div className="faq-body">
            <p><RichText text={f.a} /></p>
            {f.more?.map((p) => <p key={p}><RichText text={p} /></p>)}
          </div>
        </details>
      ))}
    </div>
  )
}
