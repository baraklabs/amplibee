import { breadcrumbs } from '../lib/jsonld.ts'
import { JsonLd } from './JsonLd.tsx'

/**
 * No visible trail on the page. The breadcrumb structured data stays, because search engines use it to show
 * the path to a page in results and it costs visitors nothing.
 */
export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return <JsonLd data={breadcrumbs(trail)} />
}
