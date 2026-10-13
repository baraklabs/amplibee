import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { webPage } from '../../lib/jsonld.ts'
import { ContactForm } from '../../components/ContactForm.tsx'
import { HeroArt } from '../../components/HeroArt.tsx'
import { SITE } from '../../lib/config.ts'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'Contact us',
  description: 'Ask a question, request a custom plan or talk to the Amplibee team. Write to hello@amplibee.com or use the form.',
  path: '/contact',
})

export default async function Contact({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams
  return (
    <div className="contact">
      <HeroArt />
      <div className="wrap contact-grid">
        <Breadcrumbs trail={[{ name: 'Contact us', path: '/contact' }]} />
        <JsonLd data={webPage({ type: 'ContactPage', name: 'Contact Amplibee', description: 'Ask a question, request a custom plan or talk to the Amplibee team. Write to hello@amplibee.com or use the form.', path: '/contact' })} />
        <div className="contact-intro">
          <h1>Contact us</h1>
          <p className="lede">Ask a question, request a custom plan or tell us what you want help with. We read every message.</p>
          <p className="contact-mail">
            <span className="label">Email</span>
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          </p>
          <p className="muted">We reply within one working day.</p>
        </div>
        <div className="card contact-card">
          <ContactForm initialTopic={topic} />
        </div>
      </div>
    </div>
  )
}
