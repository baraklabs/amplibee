import raw from '../data/directories.json'

export interface Directory {
  slug: string
  name: string
  url: string
  category: string
  priority: number
  description: string
  submit_url: string | null
  check_method: 'slug_url' | 'search_hit' | 'hn_api' | 'none'
  check_url_template: string | null
  verified: boolean
  todo: string | null
  verified_at: string
}

export const DIRECTORIES = raw as Directory[]

export const getDirectory = (slug: string) => DIRECTORIES.find((d) => d.slug === slug)

export const CATEGORY_NAME: Record<string, string> = {
  launch: 'Launch sites',
  community: 'Communities',
  alternatives: 'Alternatives directories',
  reviews: 'Review sites',
  developer: 'Developer tools',
  'company-data': 'Company data',
  software: 'Software directories',
  publishing: 'Publishing',
}

export const CHECK_NOTE: Record<Directory['check_method'], string> = {
  slug_url: 'We request the public profile address built from your brand name and look for your domain on the page.',
  search_hit: 'We cannot predict the profile address, so a listing counts only when it appears in search results for your domain.',
  hn_api: 'We count Hacker News stories that link to your domain through the Algolia search API.',
  none: 'Not checked automatically. Use it as a place to post or publish.',
}
