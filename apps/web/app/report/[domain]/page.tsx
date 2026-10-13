import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '../../../components/Breadcrumbs.tsx'
import { ReportView } from '../../../components/ReportView.tsx'
import { api, ApiError } from '../../../lib/api.ts'
import { reportsIndexable, SITE } from '../../../lib/config.ts'
import { dateLabel, num, SEVERITY_LABEL } from '../../../lib/format.ts'
import { pageMeta } from '../../../lib/seo.ts'

type Props = { params: Promise<{ domain: string }>; searchParams: Promise<{ k?: string }> }

export async function generateMetadata({ params }: Props) {
  const { domain } = await params
  const d = decodeURIComponent(domain)
  return pageMeta({
    title: `Visibility report for ${d}`,
    description: `Visibility score and top gaps for ${d}, from the Amplibee check.`,
    path: `/report/${encodeURIComponent(d)}`,
    noindex: !reportsIndexable(),
    image: `/report/${encodeURIComponent(d)}/opengraph-image`,
  })
}

export default async function ReportPage({ params, searchParams }: Props) {
  const domain = decodeURIComponent((await params).domain)
  const { k } = await searchParams
  let data
  try {
    data = await api.report(domain, typeof k === 'string' ? k : undefined)
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) notFound()
    throw e
  }

  return (
    <div className="wrap">
      <div className="page-head">
        <Breadcrumbs trail={[{ name: 'Reports', path: '/' }, { name: domain, path: `/report/${domain}` }]} />
        <span className="label">Visibility report</span>
        <h1 style={{ overflowWrap: 'anywhere' }}>{domain}</h1>
        <p className="updated">Generated {dateLabel(data.report.generated_at)}</p>
      </div>

      {data.access === 'full' ? (
        <ReportView report={data.report} />
      ) : (
        <article className="report">
          <div className="report-head">
            <div>
              <span className="label">Visibility score</span>
              <p className="score">{data.report.score ?? 'n/a'}{data.report.score !== null ? <small>/100</small> : null}</p>
            </div>
            <div className="table-wrap">
              <table>
                <caption className="label">Top {data.report.gaps.length} of {data.report.gap_total} gaps</caption>
                <thead><tr><th>Severity</th><th>What we found</th></tr></thead>
                <tbody>
                  {data.report.gaps.map((g) => (
                    <tr key={g.id}><td><span className={`sev ${g.severity}`}>{SEVERITY_LABEL[g.severity]}</span></td><td className="gap-msg">{g.message}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="report-body">
            <p>This is the public summary. The full list of {num(data.report.gap_total)} gaps, the competitor comparison and the fix plan are in the owner&rsquo;s report. <Link href="/">Run your own check</Link> to see yours.</p>
          </div>
        </article>
      )}

      {SITE.contactEmail ? (
        <p style={{ marginTop: 24 }} className="caption">
          Is this your site and you want the report hidden? <a href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`Hide the report for ${domain}`)}`}>Ask us to hide it</a>.
        </p>
      ) : null}
    </div>
  )
}
