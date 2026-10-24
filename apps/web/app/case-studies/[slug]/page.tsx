import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '../../../components/Breadcrumbs.tsx'
import { CaseAvatar } from '../../../components/CaseStudies.tsx'
import { JsonLd } from '../../../components/JsonLd.tsx'
import { ClosingCta } from '../../../components/Landing.tsx'
import { StatValue } from '../../../components/StatValue.tsx'
import { CASE_STUDIES, caseImage, caseThumb, getCaseStudy, getFacts } from '../../../lib/content/case-studies.ts'
import { article } from '../../../lib/jsonld.ts'
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
    modified: s.updated,
    keywords: ['Amplibee case study', `${s.domain} visibility check`],
  })
}

export default async function CaseStudyPage({ params }: Props) {
  const s = getCaseStudy((await params).slug)
  if (!s) notFound()
  const c = getFacts(s)
  const path = `/case-studies/${s.slug}`
  const thumb = caseThumb(s)
  const others = CASE_STUDIES.filter((x) => x.slug !== s.slug)
  return (
    <>
      <div className="wrap cs-page">
        <Breadcrumbs trail={[{ name: 'Case studies', path: '/case-studies' }, { name: s.headline, path }]} />
        <JsonLd data={article({ title: s.headline, description: s.summary, path, updated: s.updated, image: caseImage(s) })} />
        <header className="launch-hero">
          <p className="launch-meta"><Link href="/case-studies">Case studies</Link></p>
          <h1>{s.headline}</h1>
          <p className="launch-lede">{s.summary}</p>
          <div className="cs-who">
            <CaseAvatar name={c.name} size={48} />
            <div>
              <strong>{c.name}</strong>
              <span className="muted">{c.sub}</span>
            </div>
          </div>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="launch-thumb" src={thumb} alt={`${s.domain} home page`} width={800} height={420} fetchPriority="high" decoding="async" />
          ) : null}
        </header>

        <div className="cs-stats" aria-label="Results">
          {c.stats.map((x) => (
            <div key={x.label}><strong><StatValue value={x.value} /></strong><span>{x.label}</span></div>
          ))}
        </div>

        <article className="launch-body cs-body">
          {s.sections.map((sec) => (
            <section className="launch-sec" key={sec.h}>
              <h2>{sec.h}</h2>
              {sec.body.map((p) => <p key={p}>{p}</p>)}
              {sec.bullets ? <ul className="launch-list">{sec.bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}
            </section>
          ))}
          <p><Link className="btn" href="/">Check your own product for free</Link></p>
        </article>

        <section className="launch-more" aria-labelledby="more-cs-h">
          <div className="launch-more-head">
            <h2 id="more-cs-h">More case studies</h2>
            <Link href="/case-studies">All case studies</Link>
          </div>
          <ul className="cs-others">
            {others.map((o) => (
              <li key={o.slug}><Link href={`/case-studies/${o.slug}`}>{o.headline}</Link></li>
            ))}
          </ul>
        </section>
      </div>
      <ClosingCta />
    </>
  )
}
