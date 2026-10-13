import type { MetadataRoute } from 'next'
import { absolute } from '../lib/config.ts'

// Crawlers are welcome, including the ones that feed answer engines. Job pages are private and not useful to index.
// Report pages are left crawlable on purpose: they carry a noindex tag, which a crawler can only see if it may fetch them.
const DISALLOW = ['/check/', '/company/', '/auth/']
const WELCOME = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'MistralAI-User', 'cohere-ai']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...WELCOME.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: absolute('/sitemap.xml'),
    host: absolute('/'),
  }
}
