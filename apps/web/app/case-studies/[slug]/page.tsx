import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleAside, ArticleMeta } from '../../../components/ArticleParts.tsx'
import { BlogRelCard } from '../../../components/BlogFeed.tsx'
import { Breadcrumbs } from '../../../components/Breadcrumbs.tsx'
import { CaseImage, CaseRelCard } from '../../../components/CaseStudies.tsx'
import { FaqAccordion } from '../../../components/FaqAccordion.tsx'
import { JsonLd } from '../../../components/JsonLd.tsx'
import { ClosingCta } from '../../../components/Landing.tsx'
import { StatValue } from '../../../components/StatValue.tsx'
import { CASE_STUDIES, caseImage, caseMonthYear, getCaseStudy, getFacts, readMinutes } from '../../../lib/content/case-studies.ts'
import { GUIDES } from '../../../lib/content/guides.ts'
import { article, faqPage } from '../../../lib/jsonld.ts'
import { pageMeta } from '../../../lib/seo.ts'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return CASE_STUDIES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props) {
  const s = getCaseStudy((await params).slug)
  if (!s) return {}
  return pageMeta({
    title: s.headline,
    description: s.summary,
    path: `/case-studies/${s.slug}`,
    type: 'article',
    image: caseImage(s),
    published: s.updated,
    modified: s.updated,
    keywords: ['Amplibee case study', `${s.kind.toLowerCase()} use case`, 'product visibility score', 'directory listings', 'launch plan'],
  })
}

export default async function CaseStudyPage({ params }: Props) {
  const s = getCaseStudy((await params).slug)
  if (!s) notFound()
  const c = getFacts(s)
  const path = `/case-studies/${s.slug}`
  const i = CASE_STUDIES.indexOf(s)
  // the next two studies in order, wrapping around, so every page links onward
  const related = [1, 2].map((n) => CASE_STUDIES[(i + n) % CASE_STUDIES.length]).filter((x, k, a) => x !== s && a.indexOf(x) === k)
  const blogs = GUIDES.filter((g) => s.blogs.includes(g.slug)).slice(0, 2)
  const articleLd = {
    ...article({ title: s.headline, description: s.summary, path, updated: s.updated, image: caseImage(s) }),
    articleSection: s.kind,
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.cs-answer'] },
  }
  return (
    <>
      <div className="wrap cs-art-page">
        <Breadcrumbs trail={[{ name: 'Case studies', path: '/case-studies' }, { name: s.headline, path }]} />
        <JsonLd data={[articleLd, faqPage(s.faq)]} />

        <h1 className="cs-art-title">{s.headline}</h1>
        <ArticleMeta tag={s.kind} monthYear={caseMonthYear(s)} iso={s.updated} minutes={readMinutes(s)} />

        <div className="cs-art">
          <div className="cs-art-main">
            <CaseImage s={s} className="cs-hero" eager />
            <p className="cs-lede">{s.summary}</p>
            <p className="cs-answer"><strong>The short answer:</strong> {s.answer}</p>

            <div className="cs-stats" aria-label="Results">
              {c.stats.map((x) => (
                <div key={x.label}><strong><StatValue value={x.value} /></strong><span>{x.label}</span></div>
              ))}
            </div>

            {s.sections.map((sec) => (
              <section className="cs-sec" key={sec.h}>
                <h2>{sec.h}</h2>
                {sec.body.map((p) => <p key={p}>{p}</p>)}
                {sec.bullets ? <ul className={`launch-list${sec.bulletKind === 'ok' ? '' : ` cs-bul cs-bul-${sec.bulletKind ?? 'plain'}`}`}>{sec.bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}
              </section>
            ))}

            <section className="cs-sec" aria-labelledby="cs-faq-h">
              <h2 id="cs-faq-h">Questions people ask</h2>
              <FaqAccordion items={s.faq} />
            </section>

            <section className="cs-sec" aria-labelledby="cs-rel-h">
              <div className="cs-sec-head">
                <h2 id="cs-rel-h">Related case studies</h2>
                <Link href="/case-studies">All case studies →</Link>
              </div>
              <div className="cs-rel-grid">
                {related.map((r) => <CaseRelCard s={r} key={r.slug} />)}
              </div>
            </section>

            {blogs.length ? (
              <section className="cs-sec" aria-labelledby="cs-blog-h">
                <div className="cs-sec-head">
                  <h2 id="cs-blog-h">Related blogs</h2>
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
