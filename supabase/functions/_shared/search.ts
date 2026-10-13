// Search provider interface. Swap the provider with SEARCH_PROVIDER (brave | serper | you | none).

export interface SearchHit {
  title: string
  url: string
  snippet: string
}

export interface SearchProvider {
  name: string
  search(query: string, count?: number): Promise<SearchHit[]>
}

export class SearchError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'SearchError'
    this.code = code
  }
}

async function json(res: Response, provider: string): Promise<Record<string, unknown>> {
  if (res.status === 401 || res.status === 403) throw new SearchError('auth', `${provider} rejected the API key.`)
  if (res.status === 429) throw new SearchError('quota', `${provider} rate limit or quota reached.`)
  if (!res.ok) throw new SearchError('http', `${provider} answered with status ${res.status}.`)
  return (await res.json()) as Record<string, unknown>
}

export function createSearchProvider(
  cfg: { provider: string; apiKey: string },
  fetchImpl: typeof fetch = fetch,
): SearchProvider | null {
  if (!cfg.apiKey) return null
  const timeout = () => AbortSignal.timeout(12_000)

  if (cfg.provider === 'brave') {
    return {
      name: 'brave',
      async search(query, count = 10) {
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${Math.min(count, 20)}`
        const res = await fetchImpl(url, { headers: { accept: 'application/json', 'x-subscription-token': cfg.apiKey }, signal: timeout() })
        const data = (await json(res, 'Brave Search')) as { web?: { results?: { title?: string; url?: string; description?: string }[] } }
        return (data.web?.results ?? []).filter((r) => r.url).map((r) => ({ title: r.title ?? '', url: r.url as string, snippet: r.description ?? '' }))
      },
    }
  }

  if (cfg.provider === 'serper') {
    return {
      name: 'serper',
      async search(query, count = 10) {
        const res = await fetchImpl('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey },
          body: JSON.stringify({ q: query, num: Math.min(count, 10) }),
          signal: timeout(),
        })
        const data = (await json(res, 'Serper')) as { organic?: { title?: string; link?: string; snippet?: string }[] }
        return (data.organic ?? []).filter((r) => r.link).map((r) => ({ title: r.title ?? '', url: r.link as string, snippet: r.snippet ?? '' }))
      },
    }
  }

  if (cfg.provider === 'you') {
    return {
      name: 'you',
      async search(query, count = 10) {
        const res = await fetchImpl('https://ydc-index.io/v1/search', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey },
          body: JSON.stringify({ query, count: Math.min(count, 20) }),
          signal: timeout(),
        })
        const data = (await json(res, 'You.com')) as { results?: { web?: { url?: string; title?: string; description?: string; snippets?: string[] }[] } }
        return (data.results?.web ?? []).filter((r) => r.url).map((r) => ({ title: r.title ?? '', url: r.url as string, snippet: r.snippets?.[0] ?? r.description ?? '' }))
      },
    }
  }

  return null
}
