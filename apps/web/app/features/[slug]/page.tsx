import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleAside, ArticleMeta } from '../../../components/ArticleParts.tsx'
import { BlogRelCard } from '../../../components/BlogFeed.tsx'
import { Breadcrumbs } from '../../../components/Breadcrumbs.tsx'
import { FaqAccordion } from '../../../components/FaqAccordion.tsx'
import { FeatureRelCard } from '../../../components/FeatureFeed.tsx'
import { JsonLd } from '../../../components/JsonLd.tsx'
import { ClosingCta } from '../../../components/Landing.tsx'
import { FEATURES, featureImage, featureMinutes, featureMonthYear, getFeature } from '../../../lib/content/features.ts'
import { GUIDES } from '../../../lib/content/guides.ts'
import { article, faqPage } from '../../../lib/jsonld.ts'
import { pageMeta } from '../../../lib/seo.ts'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({ params }: Props) {
  const f = getFeature((await params).slug)
  if (!f) return {}
  return pageMeta({
    title: f.headline,
    description: f.summary,
    path: `/features/${f.slug}`,
    type: 'article',
    image: featureImage(f),
    published: f.updated,
    modified: f.updated,
    keywords: f.keywords,
  })
}

export default async function FeaturePage({ params }: Props) {
  const f = getFeature((await params).slug)
  if (!f) notFound()
  const path = `/features/${f.slug}`
  const i = FEATURES.indexOf(f)
  // the next two features in order, wrapping around, so every page links onward
  const related = [1, 2].map((n) => FEATURES[(i + n) % FEATURES.length])
  const blogs = GUIDES.filter((g) => f.blogs.includes(g.slug)).slice(0, 2)
  const articleLd = {
    ...article({ title: f.headline, description: f.summary, path, updated: f.updated, image: featureImage(f) }),
    articleSection: 'Features',
    keywords: f.keywords.join(', '),
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.cs-answer'] },
  }
  return (
    <>
      <div className="wrap cs-art-page">
        <Breadcrumbs trail={[{ name: 'Features', path: '/features' }, { name: f.name, path }]} />
        <JsonLd data={[articleLd, faqPage(f.faq)]} />

        <h1 className="cs-art-title">{f.headline}</h1>
        <ArticleMeta tag="Feature" monthYear={featureMonthYear(f)} iso={f.updated} minutes={featureMinutes(f)} />

        <div className="cs-art">
          <div className="cs-art-main">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cs-img cs-hero" src={featureImage(f)} alt={f.name} width={1200} height={630} fetchPriority="high" decoding="async" />
            <p className="cs-lede">{f.summary}</p>
            <p className="cs-answer"><strong>The short answer:</strong> {f.answer}</p>

            {f.sections.map((sec) => (
              <section className="cs-sec" key={sec.h}>
                <h2>{sec.h}</h2>
                {sec.body.map((p) => <p key={p}>{p}</p>)}
                {sec.bullets ? <ul className="launch-list">{sec.bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}
              </section>
            ))}

            <section className="cs-sec" aria-labelledby="ft-faq-h">
              <h2 id="ft-faq-h">Questions people ask</h2>
              <FaqAccordion items={f.faq} />
            </section>

            <section className="cs-sec" aria-labelledby="ft-rel-h">
              <div className="cs-sec-head">
                <h2 id="ft-rel-h">More features</h2>
                <Link href="/features">All features →</Link>
              </div>
              <div className="cs-rel-grid">
                {related.map((r) => <FeatureRelCard f={r} key={r.slug} />)}
              </div>
            </section>

            {blogs.length ? (
              <section className="cs-sec" aria-labelledby="ft-blog-h">
                <div className="cs-sec-head">
                  <h2 id="ft-blog-h">Related blogs</h2>
                  <Link href="/blog">Read our blogs →</Link>
                </div>
                <div className="cs-rel-grid">
                  {blogs.map((g) => <BlogRelCard g={g} key={g.slug} />)}
                </div>
              </section>
            ) : null}
          </div>

          <ArticleAside />
        </div>
      </div>
      <ClosingCta />
    </>
  )
}
