import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '../../../components/Breadcrumbs.tsx'
import { FaqAccordion } from '../../../components/FaqAccordion.tsx'
import { JsonLd } from '../../../components/JsonLd.tsx'
import { StartupGrid, startups } from '../../../components/Startups.tsx'
import { absolute } from '../../../lib/config.ts'
import { getLaunch, LAUNCHES, launchImages } from '../../../lib/content/launches.ts'
import { article, faqPage } from '../../../lib/jsonld.ts'
import { pageMeta } from '../../../lib/seo.ts'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return LAUNCHES.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props) {
  const l = getLaunch((await params).slug)
  if (!l) return {}
  return pageMeta({
    title: l.title,
    description: l.description,
    path: `/launches/${l.slug}`,
    type: 'article',
    image: launchImages(l.slug).og,
    published: l.launched,
    modified: l.updated,
    keywords: l.keywords,
  })
}

export default async function LaunchPage({ params }: Props) {
  const l = getLaunch((await params).slug)
  if (!l) notFound()
  const path = `/launches/${l.slug}`
  const img = launchImages(l.slug)
  const altId = (name: string) => `alt-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
  const more = startups.filter((s) => s.domain !== l.domain).slice(0, 2)
  const product = {
    '@context': 'https://schema.org',
    '@type': l.app.type,
    '@id': `${absolute(path)}#product`,
    name: l.name,
    url: l.url,
    description: l.description,
    image: [absolute(img.og), absolute(l.logo)],
    applicationCategory: l.app.category,
    ...(l.app.os ? { operatingSystem: l.app.os } : {}),
    featureList: l.app.featureList,
    ...(l.app.price ? { offers: { '@type': 'Offer', price: l.app.price, priceCurrency: 'USD' } } : {}),
    ...(l.app.sameAs ? { sameAs: l.app.sameAs } : {}),
    mainEntityOfPage: { '@id': absolute(path) },
  }
  const alternativesLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Alternatives to ${l.name}`,
    itemListElement: l.compare.alternatives.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, description: x.what, ...(x.url ? { url: x.url } : {}) })),
  }
  const articleLd = { ...article({ title: l.title, description: l.description, path, updated: l.updated, image: img.og }), datePublished: l.launched }
  return (
    <div className="wrap launch-layout">
      <div className="launch-main">
        <header className="launch-hero">
          <Breadcrumbs trail={[{ name: 'Product launches', path: '/launches' }, { name: l.name, path }]} />
          <div className="launch-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="launch-logo" src={l.logo} alt={`${l.name} logo`} width={72} height={72} />
            <div>
              <h1>{l.name}</h1>
              <p className="launch-meta">
                <span className="tag">{l.category}</span>
                <span className="muted">Launched <time dateTime={l.launched}>{new Date(l.launched).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></span>
              </p>
            </div>
          </div>
          <p className="launch-lede">{l.intro}</p>
          <div className="launch-cta">
            <a className="btn" href={l.url} target="_blank" rel="noopener">Visit {l.domain}</a>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="launch-thumb" src={img.thumb} alt={l.imageAlt} width={800} height={420} fetchPriority="high" decoding="async" />
        </header>

        <article className="launch-body">
          {l.sections.map((s) => (
            <section key={s.h} className="launch-sec">
              <h2>{s.h}</h2>
              <p className="launch-answer">{s.a}</p>
              {s.more?.map((p) => <p key={p}>{p}</p>)}
              {s.bullets ? <ul className="launch-list">{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}
            </section>
          ))}
          <section className="launch-sec" id="alternatives">
            <h2>Alternatives to {l.name}</h2>
            <p>{l.compare.intro}</p>
            <ul className="launch-alts">
              {l.compare.alternatives.map((x) => (
                <li key={x.name} id={altId(x.name)}>
                  <strong>{x.name}</strong>
                  <span>{x.what}</span>
                  {x.url ? <a className="launch-alt-link" href={x.url} target="_blank" rel="noopener">{x.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} ↗</a> : null}
                </li>
              ))}
            </ul>
          </section>
          <section className="launch-sec">
            <h2>How {l.name} compares</h2>
            <div className="table-wrap launch-compare">
              <table>
                <thead><tr><th>Option</th><th>Best for</th><th>Trade-off</th></tr></thead>
                <tbody>
                  <tr className="is-self"><th scope="row">{l.name}</th><td>{l.compare.self.bestFor}</td><td>{l.compare.self.tradeoff}</td></tr>
                  {l.compare.alternatives.map((x) => (
                    <tr key={x.name}><th scope="row">{x.url ? <a href={x.url} target="_blank" rel="noopener">{x.name}</a> : x.name}</th><td>{x.bestFor}</td><td>{x.tradeoff}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="launch-verdict">{l.compare.verdict}</p>
          </section>
          <section className="launch-sec">
            <h2>Questions people ask about {l.name}</h2>
            <FaqAccordion items={l.faq} />
          </section>
        </article>

        <section className="launch-more" aria-labelledby="more-h">
          <div className="launch-more-head">
            <h2 id="more-h">More launches</h2>
            <Link href="/launches">Browse all launches</Link>
          </div>
          <StartupGrid items={more} />
        </section>
      </div>

      <aside className="aside" aria-label="At a glance">
        <span className="label">At a glance</span>
        <dl className="launch-facts" style={{ marginTop: 6 }}>
          {l.facts.map((f) => (
            <div key={f.label} style={{ display: 'contents' }}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <span className="label" style={{ display: 'block', marginTop: 14 }}>Alternatives</span>
        <ul>
          {l.compare.alternatives.map((x) => <li key={x.name}><a href={`#${altId(x.name)}`}>{x.name}</a></li>)}
        </ul>
      </aside>
      <JsonLd data={[articleLd, product, alternativesLd, faqPage(l.faq)]} />
    </div>
  )
}
