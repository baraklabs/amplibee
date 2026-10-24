import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { BlogList } from '../../components/BlogFeed.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { ClosingCta } from '../../components/Landing.tsx'
import { absolute } from '../../lib/config.ts'
import { GUIDES } from '../../lib/content/guides.ts'
import { webPage } from '../../lib/jsonld.ts'
import { pageMeta } from '../../lib/seo.ts'

const DESCRIPTION = 'Short posts on listing a new SaaS, earning first mentions, setting an OG image, how answer engines pick products, and technical basics.'

export const metadata = pageMeta({
  title: 'Blog: guides for getting found',
  description: DESCRIPTION,
  path: '/blog',
})

export default function BlogIndex() {
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: GUIDES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.title, url: absolute(`/blog/${g.slug}`) })),
  }
  return (
    <>
      <div className="wrap">
        <Breadcrumbs trail={[{ name: 'Blog', path: '/blog' }]} />
        <JsonLd data={[webPage({ type: 'CollectionPage', name: 'Amplibee blog', description: DESCRIPTION, path: '/blog' }), list]} />
        <h1 className="cs-list-h cs-list-h-top">Blog</h1>
        <p className="cs-list-sub">Each post answers its questions first, then gives the detail. Every one is dated and cites its sources.</p>
        <BlogList />
      </div>
      <ClosingCta />
    </>
  )
}
