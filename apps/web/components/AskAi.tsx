import { SITE } from '../lib/config.ts'

/** "Ask AI about Amplibee": opens each assistant with a ready-made question about the product. Icons are in public/ai. */
export function AskAi() {
  const prompt = `Tell me about ${SITE.name} (${SITE.url}): what it does, who it is for and how it works.`
  const q = encodeURIComponent(prompt)
  const links = [
    { name: 'ChatGPT', href: `https://chatgpt.com/?q=${q}`, icon: '/ai/chatgpt.png', brand: '#10a37f' },
    { name: 'Claude', href: `https://claude.ai/new?q=${q}`, icon: '/ai/claude.svg', brand: '#d97757' },
    { name: 'Perplexity', href: `https://www.perplexity.ai/search?q=${q}`, icon: '/ai/perplexity.svg', brand: '#20808d' },
    { name: 'Grok', href: `https://grok.com/?q=${q}`, icon: '/ai/grok.png', brand: '#6b7280' },
  ]
  return (
    <section className="ask-ai" aria-labelledby="ask-ai-h">
      <h2 id="ask-ai-h" className="label">Ask AI about {SITE.name}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.name}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ '--brand': l.brand } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.icon} alt="" width={22} height={22} loading="lazy" />
              {l.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
