import { absolute } from '../../lib/config.ts'
import { GUIDES } from '../../lib/content/guides.ts'

export const dynamic = 'force-static'

export function GET() {
  const body = `# Amplibee

> Amplibee is a free web tool for founders. Enter a product website and it checks directories, search indexing, mentions, technical SEO and trust signals, compares the product with its competitors, scores it out of 100 and lists the specific gaps with a fix for each.

Checks are deterministic and use public information only.

## Key pages

- [Home and sample report](${absolute('/')}): run a check and see a real report
- [How the check works](${absolute('/how-it-works')}): the six steps, what is requested and what is stored
- [FAQ](${absolute('/faq')}): short answers about cost, data and accuracy
- [Pricing](${absolute('/pricing')}): what is free and what the paid plans add
- [About](${absolute('/about')}): who it is for and what it will not do
- [Case studies](${absolute('/case-studies')}): customer outcomes
- [Contact](${absolute('/contact')}): support and questions
- [Full text for models](${absolute('/llms-full.txt')}): the guides and FAQ in one file

## Blog

${GUIDES.map((g) => `- [${g.title}](${absolute(`/blog/${g.slug}`)}): ${g.description}`).join('\n')}

## Notes

- Report pages are private by default and marked noindex.
- The free check scores a site out of 100 and shows the top 3 gaps. Signing in unlocks every gap, the competitor comparison and the launch plan.
- Domain rank is looked up live from the public Tranco list; no private data is read.
- The crawler identifies itself as AmplibeeBot and respects robots.txt.
`
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } })
}
