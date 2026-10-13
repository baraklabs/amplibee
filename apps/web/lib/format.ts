export const num = (n: number) => n.toLocaleString('en-US')

export function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export const CATEGORY_LABEL: Record<string, string> = {
  discoverability: 'Discoverability',
  buzz: 'Buzz',
  trust: 'Trust',
  technical: 'Technical',
}

export const SEVERITY_LABEL: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' }

export const FIX_LABEL: Record<string, string> = {
  free_guide: 'Guide',
  directory_submission: 'Directory submission',
  review_collection: 'Review collection',
  content: 'Content',
  oyekool_campaign: 'Mentions campaign',
}

/** First sentence of a message, always ending in exactly one full stop. */
export function firstSentence(s: string): string {
  return s.split('. ')[0].replace(/\.$/, '') + '.'
}

/** Plain text of a string that may contain [label](/path) links. */
export function stripLinks(s: string): string {
  return s.replace(/\[([^\]]+)\]\(\/[^)\s]*\)/g, '$1')
}

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}
