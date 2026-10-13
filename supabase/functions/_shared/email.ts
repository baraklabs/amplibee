// Transactional email through Resend or Brevo (EMAIL_PROVIDER).

import { env } from './env.ts'

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function reportEmail(opts: { domain: string; score: number | null; link: string }): Omit<EmailMessage, 'to'> {
  const scoreLine = opts.score === null ? 'Your launch plan is ready.' : `Your visibility score for ${opts.domain} is ${opts.score} out of 100.`
  const text = [
    scoreLine,
    '',
    `Open the full report, with every gap, the competitor comparison and the fix plan:`,
    opts.link,
    '',
    'You are getting this one email because you asked to unlock the report. You can reply to ask us to delete your address.',
  ].join('\n')
  const html = `<p>${esc(scoreLine)}</p><p>Open the full report, with every gap, the competitor comparison and the fix plan:</p><p><a href="${esc(opts.link)}">${esc(opts.link)}</a></p><p style="color:#6b655a;font-size:13px">You are getting this one email because you asked to unlock the report. You can reply to ask us to delete your address.</p>`
  return { subject: `Your Amplibee report for ${opts.domain}`, text, html }
}

export async function sendEmail(msg: EmailMessage, fetchImpl: typeof fetch = fetch): Promise<{ ok: boolean; error?: string }> {
  const provider = env('EMAIL_PROVIDER', 'resend')
  const from = env('EMAIL_FROM')
  const key = env('EMAIL_API_KEY')
  if (!key || !from) return { ok: false, error: 'email_not_configured' }
  try {
    if (provider === 'brevo') {
      const m = /^(.*)<(.+)>$/.exec(from)
      const sender = m ? { name: m[1].trim().replace(/^"|"$/g, ''), email: m[2].trim() } : { email: from }
      const res = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender, to: [{ email: msg.to }], subject: msg.subject, htmlContent: msg.html, textContent: msg.text }),
        signal: AbortSignal.timeout(10_000),
      })
      return res.ok ? { ok: true } : { ok: false, error: `brevo_${res.status}` }
    }
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
      signal: AbortSignal.timeout(10_000),
    })
    return res.ok ? { ok: true } : { ok: false, error: `resend_${res.status}` }
  } catch {
    return { ok: false, error: 'email_unreachable' }
  }
}
