import Link from 'next/link'
import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { webPage } from '../../lib/jsonld.ts'
import { GUIDES } from '../../lib/content/guides.ts'
import { pageMeta } from '../../lib/seo.ts'

export const metadata = pageMeta({
  title: 'Blog: guides for getting found',
  description: 'Short posts on listing a new SaaS, earning first mentions, setting an OG image, how answer engines pick products, and technical basics.',
  path: '/blog',
})

export default function BlogIndex() {
  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'Blog', path: '/blog' }]} />
        <JsonLd data={webPage({ type: 'CollectionPage', name: 'Amplibee blog', description: 'Short posts on listing a new SaaS, earning first mentions, setting an OG image, how answer engines pick products, and technical basics.', path: '/blog' })} />
        <h1>Blog</h1>
        <p className="lede">Each post answers its questions first, then gives the detail. Every one is dated and cites its sources.</p>
      </div>
      <div className="table-wrap" style={{ maxWidth: 860 }}>
        <table>
          <thead><tr><th>Post</th><th>What it covers</th><th>Updated</th></tr></thead>
          <tbody>
            {GUIDES.map((g) => (
              <tr key={g.slug}>
                <td><Link href={`/blog/${g.slug}`}>{g.title}</Link></td>
                <td>{g.description}</td>
                <td className="mono" style={{ whiteSpace: 'nowrap' }}>{g.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
