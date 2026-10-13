import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '../../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../../components/JsonLd.tsx'
import { GUIDES, getGuide } from '../../../lib/content/guides.ts'
import { article } from '../../../lib/jsonld.ts'
import { pageMeta } from '../../../lib/seo.ts'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props) {
  const g = getGuide((await params).slug)
  if (!g) return {}
  return pageMeta({ title: g.title, description: g.description, path: `/blog/${g.slug}`, type: 'article', image: `/blog/${g.slug}/opengraph-image`, published: g.updated, modified: g.updated })
}

export default async function GuidePage({ params }: Props) {
  const g = getGuide((await params).slug)
  if (!g) notFound()
  const others = GUIDES.filter((x) => x.slug !== g.slug)
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'Blog', path: '/blog' }, { name: g.title, path: `/blog/${g.slug}` }]} />
        <h1>{g.title}</h1>
        <p className="lede">{g.intro}</p>
        <p className="updated">Last updated <time dateTime={g.updated}>{g.updated}</time></p>
      </div>

      <div className="layout-2">
        <article className="prose">
          {g.sections.map((s) => (
            <section key={s.q}>
              <h2>{s.q}</h2>
              <p className="answer">{s.a}</p>
              {s.more?.map((p) => <p key={p}>{p}</p>)}
              {s.code ? <pre><code>{s.code}</code></pre> : null}
            </section>
          ))}
          <div className="sources">
            <span className="label">Sources</span>
            <ul>
              {g.sources.map((s) => <li key={s.url}><a href={s.url} rel="noopener">{s.label}</a></li>)}
            </ul>
          </div>
        </article>
        <aside className="aside" aria-label="More posts">
          <span className="label">More posts</span>
          <ul>
            {others.map((o) => <li key={o.slug}><Link href={`/blog/${o.slug}`}>{o.title}</Link></li>)}
          </ul>
          <p style={{ marginTop: 20 }}><Link href="/">Run the check on your site</Link></p>
        </aside>
      </div>
      <JsonLd data={article({ title: g.title, description: g.description, path: `/blog/${g.slug}`, updated: g.updated, image: `/blog/${g.slug}/opengraph-image` })} />
    </div>
  )
}
