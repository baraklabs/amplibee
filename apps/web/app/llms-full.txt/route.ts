import { absolute } from '../../lib/config.ts'
import { FAQ } from '../../lib/content/faq.ts'
import { GUIDES } from '../../lib/content/guides.ts'
import { stripLinks } from '../../lib/format.ts'

export const dynamic = 'force-static'

// The same facts as the pages, in one plain-text file, so a model can read the whole site in a single request.
export function GET() {
  const faq = FAQ.map((f) => `### ${f.q}\n\n${stripLinks(f.a)}${f.more?.length ? `\n\n${f.more.map(stripLinks).join('\n\n')}` : ''}`).join('\n\n')
  const guides = GUIDES.map((g) => {
    const body = g.sections.map((s) => `### ${s.q}\n\n${stripLinks(s.a)}${s.more?.length ? `\n\n${s.more.map(stripLinks).join('\n\n')}` : ''}`).join('\n\n')
    return `## ${g.title}\n\nURL: ${absolute(`/blog/${g.slug}`)}\nUpdated: ${g.updated}\n\n${stripLinks(g.intro)}\n\n${body}`
  }).join('\n\n')
  const text = `# Amplibee: full text

> Amplibee is a free web tool for founders. Enter a product website and it checks directories, search indexing, mentions, technical SEO and trust signals, compares the product with its competitors, scores it out of 100 and lists the specific gaps with a fix for each.

Site: ${absolute('/')}

## Frequently asked questions

${faq}

# Guides

${guides}
`
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } })
}
