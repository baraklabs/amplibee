// Types shared by the Edge Functions and (via scripts/sync-shared.mjs) the web app.

export type Severity = 'high' | 'medium' | 'low'
export type Category = 'discoverability' | 'buzz' | 'trust' | 'technical'
export type FixType =
  | 'free_guide'
  | 'directory_submission'
  | 'review_collection'
  | 'content'
  | 'oyekool_campaign'
export type OyekoolTask = 'post' | 'write' | 'engage'

export interface LogLine {
  t: string
  level: 'info' | 'ok' | 'warn' | 'error'
  msg: string
}

export interface TechCheck {
  id: string
  pass: boolean
  detail: string
  value?: string | number | string[] | null
}

export interface TechnicalResult {
  reachable: boolean
  error?: string
  final_url: string
  status: number
  checks: TechCheck[]
  passed: number
  total: number
  profile_links: string[]
  about_found: boolean
  title: string | null
  description: string | null
}

export interface SpeedResult {
  score: number
  lcp_ms: number | null
  cls: number | null
  tbt_ms: number | null
}

export interface MentionSet {
  count: number
  top: { title: string; url: string }[]
  hosts?: string[]
  query?: string
}

export interface DirectoryStatus {
  listed: string[]
  not_found: string[]
  unknown: string[]
  checked: number
}

export interface TargetScan {
  domain: string
  technical?: TechnicalResult
  speed?: SpeedResult
  rank?: { rank: number | null }
  directories?: DirectoryStatus
  indexing?: { count: number; provider: string; query: string }
  web?: MentionSet
  hn?: MentionSet
  github?: MentionSet
  reddit?: MentionSet
  linkedin?: MentionSet
  x?: MentionSet
  reviews?: MentionSet
  skipped?: Record<string, string>
}

export interface OyekoolPrefill {
  task: OyekoolTask
  brief: string
  price_usd: number
}

export interface Gap {
  id: string
  category: Category
  severity: Severity
  message: string
  impact: number // estimated points on the 0-100 score
  fix_type: FixType
  fix_ref?: string // guide slug, or comma separated directory slugs
  oyekool?: OyekoolPrefill
}

export interface PlanItem {
  gap_id: string
  title: string
  fix_type: FixType
  href?: string
  oyekool?: OyekoolPrefill
}

export interface CompetitorRow {
  domain: string
  rank: number | null | undefined
  tech_passed: number | null
  tech_total: number | null
  og_image: boolean | null
  structured_data: boolean | null
  hn: number | null
  github: number | null
  indexed: number | null
  web: number | null
}

export interface Report {
  domain: string
  mode: 'website' | 'no_website'
  generated_at: string
  version: number
  score: number | null
  sub_scores: Record<Category, number | null>
  gaps: Gap[]
  gap_total: number
  self: CompetitorRow | null
  competitors: CompetitorRow[]
  plan: PlanItem[]
  directories: { slug: string; name: string; status: 'listed' | 'not_found' | 'unknown'; submit_url: string | null }[]
  checklist: string[]
  locked: boolean
  query_count: number
  query_cap: number
}

export interface DirectoryRow {
  slug: string
  name: string
  url: string
  category: string
  submit_url: string | null
  check_method: 'slug_url' | 'search_hit' | 'hn_api' | 'none'
  check_url_template: string | null
  priority: number
  description: string
  verified: boolean
}
