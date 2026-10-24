import { Breadcrumbs } from '../../components/Breadcrumbs.tsx'
import { FaqAccordion } from '../../components/FaqAccordion.tsx'
import { FeatureList } from '../../components/FeatureFeed.tsx'
import { JsonLd } from '../../components/JsonLd.tsx'
import { ClosingCta } from '../../components/Landing.tsx'
import { absolute } from '../../lib/config.ts'
import { FEATURES } from '../../lib/content/features.ts'
import { faqPage, webPage } from '../../lib/jsonld.ts'
import { pageMeta } from '../../lib/seo.ts'

const DESCRIPTION = 'Everything Amplibee does: a visibility score, directory listings, a ranked gap list, competitor comparison, a technical SEO audit, AI visibility tracking, mentions and a content planner.'

export const metadata = pageMeta({
  title: 'Features: check, fix and grow your product’s visibility',
  description: DESCRIPTION,
  path: '/features',
  image: '/features/opengraph-image',
  keywords: ['Amplibee features', 'website visibility checker', 'directory submission tool', 'competitor comparison tool', 'AI visibility tracking', 'technical SEO audit'],
})

/** One question from each feature, so the list page answers the most searched ones itself. */
const TOP_FAQ = FEATURES.map((f) => f.faq[1] ?? f.faq[0])

export default function FeaturesPage() {
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: FEATURES.map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: f.headline, url: absolute(`/features/${f.slug}`) })),
  }
  return (
    <>
      <div className="wrap">
        <Breadcrumbs trail={[{ name: 'Features', path: '/features' }]} />
        <JsonLd data={[webPage({ type: 'CollectionPage', name: 'Amplibee features', description: DESCRIPTION, path: '/features' }), list, faqPage(TOP_FAQ)]} />
        <h1 className="cs-list-h cs-list-h-top">Features</h1>
        <p className="cs-list-sub">What Amplibee checks, what it tells you to fix and what it can do for you. Each page answers the questions people search for.</p>
        <FeatureList />
        <section className="cs-sec" aria-labelledby="ft-faq-h">
          <h2 id="ft-faq-h" className="cs-list-h">Questions people ask</h2>
          <FaqAccordion items={TOP_FAQ} />
        </section>
      </div>
      <ClosingCta />
    </>
  )
}
