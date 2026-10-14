import { absolute, SITE } from './config.ts'
import { stripLinks } from './format.ts'

export const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': absolute('/#organization'),
  name: SITE.name,
  url: SITE.url,
  logo: { '@type': 'ImageObject', url: absolute('/logo.png'), width: 128, height: 128 },
  image: absolute('/og-default.jpg'),
  description: 'Amplibee is a free tool that checks how visible a product is online and lists the gaps to fix.',
  slogan: 'Get your product launch on auto-pilot',
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: SITE.contactEmail, availableLanguage: 'English' }],
}

export const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': absolute('/#website'),
  name: SITE.name,
  url: SITE.url,
  description: 'A free visibility check for founders: directories, search indexing, mentions, technical SEO and trust signals.',
  inLanguage: 'en',
  publisher: { '@id': absolute('/#organization') },
}

export const webApplication = {
  '@context': 'https://schema.org',
  '@type': ['SoftwareApplication', 'WebApplication'],
  name: SITE.name,
  url: SITE.url,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (web browser)',
  description: 'Enter a product website. Amplibee checks directories, search indexing, mentions, technical SEO and trust signals, compares the result with its competitors and scores it out of 100.',
  image: absolute('/og-default.jpg'),
  featureList: ['Visibility score out of 100', 'Directory listing check', 'Search indexing check', 'Competitor comparison', 'Ranked fix list'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@id': absolute('/#organization') },
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: stripLinks(i.a) } })),
  }
}

export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absolute(t.path) })),
  }
}

export function article(a: { title: string; description: string; path: string; updated: string; image?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    image: absolute(a.image ?? '/og-default.jpg'),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absolute(a.path) },
    url: absolute(a.path),
    inLanguage: 'en',
    dateModified: a.updated,
    datePublished: a.updated,
    author: { '@id': absolute('/#organization') },
    publisher: { '@id': absolute('/#organization') },
  }
}

/** A plain page: type is WebPage, AboutPage, ContactPage or CollectionPage. */
export function webPage(o: { type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'; name: string; description: string; path: string; updated?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': o.type ?? 'WebPage',
    name: o.name,
    description: o.description,
    url: absolute(o.path),
    inLanguage: 'en',
    isPartOf: { '@id': absolute('/#website') },
    about: { '@id': absolute('/#organization') },
    ...(o.updated ? { dateModified: o.updated } : {}),
  }
}
