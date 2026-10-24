import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleAside, ArticleMeta } from '../../../components/ArticleParts.tsx'
import { blogImage, BlogRelCard } from '../../../components/BlogFeed.tsx'
import { Breadcrumbs } from '../../../components/Breadcrumbs.tsx'
import { FeatureRelCard } from '../../../components/FeatureFeed.tsx'
import { FaqAccordion } from '../../../components/FaqAccordion.tsx'
import { JsonLd } from '../../../components/JsonLd.tsx'
import { ClosingCta } from '../../../components/Landing.tsx'
import { FEATURES } from '../../../lib/content/features.ts'
import { GUIDES, getGuide, type Guide } from '../../../lib/content/guides.ts'
import { article, faqPage } from '../../../lib/jsonld.ts'
import { pageMeta } from '../../../lib/seo.ts'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props) {
  const g = getGuide((await params).slug)
  if (!g) return {}
  return pageMeta({ title: g.title, description: g.description, path: `/blog/${g.slug}`, type: 'article', image: blogImage(g), published: g.updated, modified: g.updated })
}

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** A bullet that may open with a bold lead-in: **Lead.** rest. */
function Bullet({ text }: { text: string }) {
  const m = /^\*\*(.+?)\*\*\s*(.*)$/.exec(text)
  return <li>{m ? <><strong>{m[1]}</strong> {m[2]}</> : text}</li>
}

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Minutes to read a post, at about 220 words a minute, never less than 1. */
function minutes(g: Guide): number {
  const words = [g.intro, ...g.sections.flatMap((s) => [s.q, s.a, ...(s.bullets ?? []), ...(s.more ?? [])])].join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

/** The features that go with a post, by the topic of the post. */
const FEATURES_FOR: Record<string, string[]> = {
  'where-to-list-a-new-saas': ['directory-listings', 'content-planner'],
  'what-an-og-image-is': ['technical-seo-audit', 'product-visibility-score'],
  'how-to-get-chatgpt-to-suggest-your-product': ['ai-visibility-tracking', 'gap-finder'],
  'social-content-plan-for-a-launch': ['content-planner', 'directory-listings'],
  'technical-basics': ['technical-seo-audit', 'gap-finder'],
}

export default async function GuidePage({ params }: Props) {
  const g = getGuide((await params).slug)
  if (!g) notFound()
  const path = `/blog/${g.slug}`
  const related = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 2)
  const features = (FEATURES_FOR[g.slug] ?? []).map((s) => FEATURES.find((c) => c.slug === s)).filter((c) => !!c)
  const articleLd = {
    ...article({ title: g.title, description: g.description, path, updated: g.updated, image: blogImage(g) }),
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.cs-ans'] },
  }
  return (
    <>
      <div className="wrap cs-art-page">
        <Breadcrumbs trail={[{ name: 'Blog', path: '/blog' }, { name: g.title, path }]} />
        <JsonLd data={[articleLd, faqPage(g.faq ?? g.sections.map((s) => ({ q: s.q, a: [s.a, ...(s.bullets ?? []), ...(s.more ?? [])].join(' ').replace(/\*\*/g, '') })))]} />

        <h1 className="cs-art-title">{g.title}</h1>
        <ArticleMeta tag="Blog" monthYear={monthYear(g.updated)} iso={g.updated} minutes={minutes(g)} />

        <div className="cs-art">
          <div className="cs-art-main">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cs-img cs-hero" src={blogImage(g)} alt={g.title} width={1200} height={630} fetchPriority="high" decoding="async" />
            <p className="cs-lede">{g.intro}</p>
            {g.summary ? <p className="cs-answer cs-ans"><strong>The short answer:</strong> {g.summary}</p> : null}

            {g.sections.length > 3 ? (
              <nav className="cs-toc" aria-label="On this page">
                <strong>On this page</strong>
                <ol>
                  {g.sections.map((s) => <li key={s.q}><a href={`#${slugify(s.q)}`}>{s.q}</a></li>)}
                  {g.faq ? <li><a href="#faq">Questions people ask</a></li> : null}
                </ol>
              </nav>
            ) : null}

            {g.sections.map((s) => (
              <section className="cs-sec" key={s.q} id={slugify(s.q)}>
                <h2>{s.q}</h2>
                <p className="cs-ans">{s.a}</p>
                {s.table ? (
                  <div className="cs-table-wrap">
                    <table className="cs-table">
                      <thead><tr>{s.table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>{s.table.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => (i === 0 ? <th key={c} scope="row">{c}</th> : <td key={c}>{c}</td>))}</tr>)}</tbody>
                    </table>
                  </div>
                ) : null}
                {s.bullets ? <ul className="launch-list">{s.bullets.map((b) => <Bullet text={b} key={b} />)}</ul> : null}
                {s.more?.map((p) => <p key={p}>{p}</p>)}
                {s.code ? <pre><code>{s.code}</code></pre> : null}
              </section>
            ))}

            {g.faq ? (
              <section className="cs-sec" id="faq" aria-labelledby="bl-faq-h">
                <h2 id="bl-faq-h">Questions people ask</h2>
                <FaqAccordion items={g.faq} />
              </section>
            ) : null}

            {g.sources.length ? (
              <section className="cs-sec">
                <h2>Sources</h2>
                <ul className="cs-sources">
                  {g.sources.map((s) => <li key={s.url}><a href={s.url} rel="noopener">{s.label}</a></li>)}
                </ul>
              </section>
            ) : null}

            <section className="cs-sec" aria-labelledby="bl-rel-h">
              <div className="cs-sec-head">
                <h2 id="bl-rel-h">Related blogs</h2>
                <Link href="/blog">Read our blogs →</Link>
              </div>
              <div className="cs-rel-grid">
                {related.map((r) => <BlogRelCard g={r} key={r.slug} />)}
              </div>
            </section>

            {features.length ? (
              <section className="cs-sec" aria-labelledby="bl-ft-h">
                <div className="cs-sec-head">
                  <h2 id="bl-ft-h">Related features</h2>
                  <Link href="/features">All features →</Link>
                </div>
                <div className="cs-rel-grid">
                  {features.map((c) => (c ? <FeatureRelCard f={c} key={c.slug} /> : null))}
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
