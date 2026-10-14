import type { Metadata } from 'next'
import { absolute, SITE } from './config.ts'

export const OG_ALT = 'Amplibee: your product launch engine'
/** Default share image, used by every page that does not set its own. */
export const OG_DEFAULT = { path: '/og-default.jpg', width: 1200, height: 628 }

/**
 * Per-page metadata. A page that sets openGraph replaces the parent's whole openGraph object, so the share image is set
 * here explicitly (default: the site card) instead of relying on the file-based image of the root segment.
 */
export function pageMeta(o: {
  title: string
  description: string
  path: string
  noindex?: boolean
  type?: 'website' | 'article'
  /** Use the title as written, without the " | Amplibee" suffix. */
  absoluteTitle?: boolean
  /** Path of the share image. Defaults to the site card. */
  image?: string
  /** ISO dates, for articles. */
  published?: string
  modified?: string
  keywords?: string[]
}): Metadata {
  const size = o.image ? { width: 1200, height: 630 } : { width: OG_DEFAULT.width, height: OG_DEFAULT.height }
  const image = { url: absolute(o.image ?? OG_DEFAULT.path), ...size, alt: o.image ? o.title : OG_ALT }
  return {
    title: o.absoluteTitle ? { absolute: o.title } : o.title,
    description: o.description,
    alternates: { canonical: o.path },
    ...(o.keywords?.length ? { keywords: o.keywords } : {}),
    openGraph: {
      type: o.type ?? 'website',
      url: absolute(o.path),
      title: o.title,
      description: o.description,
      siteName: SITE.name,
      locale: 'en_US',
      images: [image],
      ...(o.type === 'article' ? { publishedTime: o.published, modifiedTime: o.modified ?? o.published, authors: [SITE.name] } : {}),
    },
    twitter: { card: 'summary_large_image', title: o.title, description: o.description, images: [image.url] },
    ...(o.noindex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } } }),
  }
}
