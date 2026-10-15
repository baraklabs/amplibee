import type { MetadataRoute } from 'next'
import { absolute, SITE } from '../lib/config.ts'
import { GUIDES } from '../lib/content/guides.ts'
import { LAUNCHES } from '../lib/content/launches.ts'

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date(SITE.updated)
  const pages = ['/', '/how-it-works', '/blog', '/faq', '/about', '/privacy', '/terms', '/pricing', '/case-studies', '/launches', '/launch-your-product', '/contact']
  return [
    ...pages.map((p) => ({ url: absolute(p), lastModified: updated, changeFrequency: (p === '/' || p === '/blog' ? 'weekly' : 'monthly') as 'weekly' | 'monthly', priority: p === '/' ? 1 : p === '/blog' || p === '/how-it-works' ? 0.8 : p === '/privacy' || p === '/terms' ? 0.3 : 0.6 })),
    ...LAUNCHES.map((l) => ({ url: absolute(`/launches/${l.slug}`), lastModified: new Date(l.updated), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...GUIDES.map((g) => ({ url: absolute(`/blog/${g.slug}`), lastModified: new Date(g.updated), changeFrequency: 'monthly' as const, priority: 0.8 })),
  ]
}
