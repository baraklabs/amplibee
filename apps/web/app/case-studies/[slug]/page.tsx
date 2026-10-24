import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '../../../components/Breadcrumbs.tsx'
import { CaseAvatar } from '../../../components/CaseStudies.tsx'
import { JsonLd } from '../../../components/JsonLd.tsx'
import { ClosingCta } from '../../../components/Landing.tsx'
import { StatValue } from '../../../components/StatValue.tsx'
import { CASE_STUDIES, caseImage, caseThumb, getCaseStudy, getCustomer } from '../../../lib/content/case-studies.ts'
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
    keywords: ['Amplibee case study', ...(s.product ? [`${s.product} case study`] : [])],
  })
}

export default async function CaseStudyPage({ params }: Props) {
  const s = getCaseStudy((await params).slug)
  if (!s) notFound()
  const c = getCustomer(s)
  const path = `/case-studies/${s.slug}`
  const thumb = caseThumb(s)
  const others = CASE_STUDIES.filter((x) => x.slug !== s.slug)
  const source = c.platform === 'linkedin' ? 'LinkedIn' : 'X'
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
            <CaseAvatar name={c.name} src={c.avatar} size={48} />
            <div>
              <strong>{c.name}</strong>
              <span className="muted">{s.product ?? c.company}</span>
            </div>
          </div>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="launch-thumb" src={thumb} alt={`${s.product} home page`} width={800} height={420} fetchPriority="high" decoding="async" />
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
            </section>
          ))}
          <figure className="cs-quote">
            <blockquote><p>&ldquo;{c.quote}&rdquo;</p></blockquote>
            <figcaption>
              {c.name}{s.product ? `, ${s.product}` : ''}
              {c.url ? <> · <a href={c.url} target="_blank" rel="noopener noreferrer">See the post on {source}</a></> : null}
            </figcaption>
          </figure>
          {s.launchSlug ? <p><Link className="btn secondary" href={`/launches/${s.launchSlug}`}>See {s.product} on Amplibee</Link></p> : null}
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
