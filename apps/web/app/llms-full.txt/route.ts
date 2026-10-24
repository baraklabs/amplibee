import { absolute } from '../../lib/config.ts'
import { FEATURES } from '../../lib/content/features.ts'
import { FAQ } from '../../lib/content/faq.ts'
import { GUIDES } from '../../lib/content/guides.ts'
import { LAUNCHES } from '../../lib/content/launches.ts'
import { stripLinks } from '../../lib/format.ts'

export const dynamic = 'force-static'

// The same facts as the pages, in one plain-text file, so a model can read the whole site in a single request.
export function GET() {
  const faq = FAQ.map((f) => `### ${f.q}\n\n${stripLinks(f.a)}${f.more?.length ? `\n\n${f.more.map(stripLinks).join('\n\n')}` : ''}`).join('\n\n')
  const guides = GUIDES.map((g) => {
    const body = g.sections.map((s) => `### ${s.q}\n\n${stripLinks(s.a)}${s.table ? `\n\n${s.table.rows.map((r) => `- ${r.join(': ')}`).join('\n')}` : ''}${s.bullets?.length ? `\n\n${s.bullets.map((b) => `- ${b.replace(/\*\*/g, '')}`).join('\n')}` : ''}${s.more?.length ? `\n\n${s.more.map(stripLinks).join('\n\n')}` : ''}`).join('\n\n')
    const qa = g.faq?.length ? `\n\n### Questions people ask\n\n${g.faq.map((f) => `**${f.q}**\n${stripLinks(f.a)}`).join('\n\n')}` : ''
    return `## ${g.title}\n\nURL: ${absolute(`/blog/${g.slug}`)}\nUpdated: ${g.updated}\n\n${stripLinks(g.intro)}${g.summary ? `\n\n${g.summary}` : ''}\n\n${body}${qa}`
  }).join('\n\n')
  const launches = LAUNCHES.map((l) => {
    const sections = l.sections.map((s) => `### ${s.h}\n\n${s.a}${s.more?.length ? `\n\n${s.more.join('\n\n')}` : ''}${s.bullets?.length ? `\n\n${s.bullets.map((b) => `- ${b}`).join('\n')}` : ''}`).join('\n\n')
    const alts = l.compare.alternatives.map((x) => `- ${x.name}${x.url ? ` (${x.url})` : ''}: ${x.what} Best for: ${x.bestFor}. Trade-off: ${x.tradeoff}.`).join('\n')
    const qa = l.faq.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')
    return `## ${l.name}\n\nURL: ${absolute(`/launches/${l.slug}`)}\nWebsite: ${l.url}\nLaunched: ${new Date(l.launched).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}\n\n${l.intro}\n\n${sections}\n\n### Alternatives to ${l.name}\n\n${l.compare.intro}\n\n${alts}\n\n${l.compare.verdict}\n\n### Questions about ${l.name}\n\n${qa}`
  }).join('\n\n')
  const features = FEATURES.map((f) => {
    const body = f.sections.map((x) => `### ${x.h}\n\n${x.body.join('\n\n')}${x.bullets?.length ? `\n\n${x.bullets.map((b) => `- ${b}`).join('\n')}` : ''}`).join('\n\n')
    const qa = f.faq.map((q) => `**${q.q}**\n${q.a}`).join('\n\n')
    return `## ${f.headline}\n\nURL: ${absolute(`/features/${f.slug}`)}\nUpdated: ${f.updated}\n\n${f.answer}\n\n${body}\n\n### Questions about ${f.name.toLowerCase()}\n\n${qa}`
  }).join('\n\n')
  const text = `# Amplibee: full text

> Amplibee is a free web tool for founders. Enter a product website and it checks directories, search indexing, mentions, technical SEO and trust signals, compares the product with its competitors, scores it out of 100 and lists the specific gaps with a fix for each.

Site: ${absolute('/')}

## Frequently asked questions

${faq}

# Product launches

${launches}

# Features

${features}

# Guides

${guides}
`
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } })
}
