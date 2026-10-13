// Optional LLM helpers. Everything here is off unless ENABLE_LLM=true and an API key is set.
// The app works fully without it. Built so far: competitor suggestion.
// Not built: product summary, campaign brief drafting, answer engine mentions.

import { env, flag } from './env.ts'

export function llmEnabled(): boolean {
  return flag('ENABLE_LLM', false) && !!env('ANTHROPIC_API_KEY')
}

async function complete(prompt: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  const res = await fetchImpl('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env('ANTHROPIC_API_KEY'), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: env('LLM_MODEL', 'claude-haiku-5-5'), max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`LLM request failed with status ${res.status}`)
  const data = (await res.json()) as { content?: { type: string; text?: string }[] }
  return (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('')
}

/** Returns up to 3 candidate competitor domains. Callers must still normalize and SSRF-check them. */
export async function suggestCompetitors(input: { domain: string | null; summary: string }, fetchImpl: typeof fetch = fetch): Promise<string[]> {
  const prompt =
    `A founder runs ${input.domain ?? 'a product without a website yet'}. Product summary: ${input.summary.slice(0, 600)}\n` +
    `List up to 3 direct competitors as bare domain names, one per line, nothing else. Only real, well known domains.`
  const text = await complete(prompt, fetchImpl)
  return text
    .split(/\r?\n/)
    .map((l) => l.trim().toLowerCase().replace(/^[-*\d.\s]+/, ''))
    .filter((l) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(l))
    .slice(0, 3)
}
