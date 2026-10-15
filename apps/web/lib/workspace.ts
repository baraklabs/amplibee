// What a signed-in person sets up in the dashboard. Kept in this browser, per account, until the tracking tables exist.

export type DirStatus = 'todo' | 'submitted' | 'listed'
export type ContentKind = 'blog' | 'comparison' | 'post'
export type ContentState = 'idea' | 'drafting' | 'scheduled' | 'published'

export interface ContentItem {
  id: string
  title: string
  kind: ContentKind
  state: ContentState
  date: string // yyyy-mm-dd, or '' when not scheduled
}

export interface Workspace {
  domain: string
  competitors: string[]
  keywords: string[]
  directories: Record<string, DirStatus>
  content: ContentItem[]
  history: { date: string; score: number }[]
}

export const EMPTY: Workspace = { domain: '', competitors: [], keywords: [], directories: {}, content: [], history: [] }

const key = (userId: string) => `amplibee_ws_${userId}`

export function loadWorkspace(userId: string): Workspace {
  try {
    const raw = localStorage.getItem(key(userId))
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Workspace>) } : EMPTY
  } catch {
    return EMPTY
  }
}

export function saveWorkspace(userId: string, ws: Workspace): void {
  try {
    localStorage.setItem(key(userId), JSON.stringify(ws))
  } catch {
    // storage blocked: changes last until the tab closes
  }
}

/** "https://www.Example.com/pricing" -> "example.com". Empty when it does not look like a domain. */
export function cleanDomain(input: string): string {
  const host = input.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#\s]/)[0]
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : ''
}

/** The brand part of a domain: "acme-crm.io" -> "acme-crm". */
export const brandOf = (domain: string) => domain.split('.')[0]

export const today = () => new Date().toISOString().slice(0, 10)
