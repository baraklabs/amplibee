import Link from 'next/link'
import { GUIDES, type Guide } from '../lib/content/guides.ts'

/** The post's share image, drawn from its title. It is also the picture on its card and at the top of the post. */
export const blogImage = (g: Guide) => `/blog/${g.slug}/opengraph-image`

/** One post as a row, like the feature pages: a label, the title and the description on the left, the image on the right. */
function BlogRow({ g }: { g: Guide }) {
  return (
    <article className="cs-row">
      <div className="cs-row-text">
        <span className="cs-kicker">Blog</span>
        <h3 className="cs-row-title"><Link className="cs-row-link" href={`/blog/${g.slug}`}>{g.title}</Link></h3>
        <p className="cs-row-sum">{g.description}</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cs-img cs-row-thumb" src={blogImage(g)} alt="" width={1200} height={630} loading="lazy" decoding="async" />
    </article>
  )
}

export function BlogList({ items = GUIDES }: { items?: Guide[] }) {
  return (
    <div className="cs-list">
      {items.map((g) => <BlogRow g={g} key={g.slug} />)}
    </div>
  )
}

/** A smaller card for the related posts under a feature page or a post: image on top, then label, title and description. */
export function BlogRelCard({ g }: { g: Guide }) {
  return (
    <article className="cs-rel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cs-img cs-rel-img" src={blogImage(g)} alt="" width={1200} height={630} loading="lazy" decoding="async" />
      <div className="cs-rel-body">
        <span className="cs-kicker">Blog</span>
        <h3><Link className="cs-row-link" href={`/blog/${g.slug}`}>{g.title}</Link></h3>
        <p>{g.description}</p>
      </div>
    </article>
  )
}
