import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap not-found">
      <p className="nf-code" aria-label="404">
        <span className="nf-digit" aria-hidden="true">4</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nf-bee" src="/logo.png" alt="" width={140} height={140} />
        <span className="nf-digit d2" aria-hidden="true">4</span>
      </p>
      <h1>That page does not exist</h1>
      <p className="lede">The address may be wrong, or a report may have been removed or expired.</p>
      <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link className="btn" href="/">Run a new check</Link>
        <Link className="btn secondary" href="/blog">Read the blog</Link>
      </p>
    </div>
  )
}
