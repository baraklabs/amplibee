// Transactional email through Resend or Brevo (EMAIL_PROVIDER).

import { env } from './env.ts'

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
  /** Overrides EMAIL_FROM for this message. */
  from?: string
  replyTo?: string
}

/** Sign-in codes and password resets. */
export const AUTH_FROM = 'Amplibee <auth@mail.amplibee.com>'
/** Welcome and other personal mail; people can reply to a real inbox. */
export const WELCOME_FROM = 'Amplibee <hello@mail.amplibee.com>'
export const REPLY_TO = 'hello@amplibee.com'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Email clients ignore most CSS, so the layout is tables with inline styles.
const INK = '#1d1b16'
const MUTED = '#6b655a'
const HONEY = '#e0a100'
const FONT = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"

function shell(preheader: string, inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f7f3e8"><span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3e8"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px"><tr><td style="padding:0 4px 18px;font:700 20px/1 ${FONT};color:${INK}">&#128029; Amplibee</td></tr><tr><td style="background:#ffffff;border-radius:20px;border-top:6px solid ${HONEY};padding:36px 32px;font:16px/1.6 ${FONT};color:${INK}">${inner}</td></tr><tr><td style="padding:20px 8px;font:12px/1.6 ${FONT};color:${MUTED};text-align:center">Amplibee &middot; <a href="https://amplibee.com" style="color:${MUTED}">amplibee.com</a></td></tr></table></td></tr></table></body></html>`
}

const heading = (t: string) => `<h1 style="margin:0 0 14px;font:700 26px/1.2 ${FONT};color:${INK}">${esc(t)}</h1>`
const para = (t: string) => `<p style="margin:0 0 16px;font:16px/1.6 ${FONT};color:${INK}">${t}</p>`
const small = (t: string) => `<p style="margin:20px 0 0;font:13px/1.6 ${FONT};color:${MUTED}">${t}</p>`
const button = (href: string, label: string) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 24px"><tr><td style="background:${HONEY};border-radius:999px"><a href="${esc(href)}" style="display:inline-block;padding:14px 28px;font:700 16px/1 ${FONT};color:${INK};text-decoration:none">${esc(label)}</a></td></tr></table>`

/** The code as one box per digit. */
function codeBoxes(code: string): string {
  const cells = code.split('').map((d) => `<td align="center" width="44" height="56" style="background:#fff8e1;border:1px solid #f0d98a;border-radius:10px;font:700 28px/56px ${FONT};color:${INK}">${esc(d)}</td><td width="8"></td>`).join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 22px"><tr>${cells}</tr></table>`
}

/** A row of three honey-dotted points. */
function points(items: string[]): string {
  const rows = items.map((t) => `<tr><td valign="top" width="22" style="padding:6px 0;font:16px/1.5 ${FONT};color:${HONEY}">&#9679;</td><td style="padding:6px 0;font:16px/1.5 ${FONT};color:${INK}">${esc(t)}</td></tr>`).join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 8px">${rows}</table>`
}

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
  const html = shell(scoreLine, heading(opts.score === null ? 'Your launch plan is ready' : `Your score is ${opts.score} out of 100`) + para(esc(scoreLine)) + para('Open the full report, with every gap, the competitor comparison and the fix plan.') + button(opts.link, 'Open your report') + small('You are getting this one email because you asked to unlock the report. You can reply to ask us to delete your address.'))
  return { subject: `Your Amplibee report for ${opts.domain}`, text, html }
}

/** Sent once, when an account is first confirmed. */
export function welcomeEmail(name: string | null, site: string): Omit<EmailMessage, 'to'> {
  const first = (name ?? '').trim().split(/\s+/)[0]
  const hi = first ? `Hi ${first},` : 'Hi,'
  const text = [
    hi,
    '',
    'Welcome to Amplibee. Your account is ready.',
    '',
    `Check how visible your product is, see the gaps and get a plan to fix them: ${site}`,
    '',
    'Just reply to this email if you have a question. A person reads every reply.',
  ].join('\n')
  const html = shell('Your account is ready. Here is where to start.', heading(first ? `Welcome, ${first}` : 'Welcome to Amplibee') + para('Your account is ready. Amplibee shows you why people cannot find your product, and what to do about it.') + points(['Scan your site, directories, mentions and page speed', 'See every gap ranked, with the fix for each', 'Get listed on directories and plan a month of content']) + button(site, 'Check your product') + para('Questions? Just reply to this email. A person reads every reply.'))
  return { subject: 'Welcome to Amplibee', text, html }
}

/** The email that carries a six-digit code and a one-click link, for confirming an address or resetting a password. */
export function codeEmail(kind: 'verify' | 'reset', code: string, link: string): Omit<EmailMessage, 'to'> {
  const verify = kind === 'verify'
  const subject = verify ? `Your Amplibee confirmation code: ${code}` : `Reset your Amplibee password (code ${code})`
  const lead = verify ? 'Confirm your email to finish creating your Amplibee account.' : 'Someone asked to reset the password for your Amplibee account.'
  const action = verify ? 'Confirm my email' : 'Choose a new password'
  const text = [
    lead,
    '',
    `Your code: ${code}`,
    `Or open this link: ${link}`,
    '',
    `The code and link work for ${verify ? '10' : '15'} minutes. If this was not you, ignore this email.`,
  ].join('\n')
  const mins = verify ? '10' : '15'
  const html = shell(`Your code is ${code}`, heading(verify ? 'Confirm your email' : 'Reset your password') + para(esc(lead)) + para('Enter this code:') + codeBoxes(code) + para('Or skip the typing:') + button(link, action) + small(`The code and link work for ${mins} minutes. If this was not you, ignore this email.`))
  return { subject, text, html }
}

export async function sendEmail(msg: EmailMessage, fetchImpl: typeof fetch = fetch): Promise<{ ok: boolean; error?: string }> {
  const provider = env('EMAIL_PROVIDER', 'resend')
  const from = msg.from || env('EMAIL_FROM')
  const key = env('EMAIL_API_KEY') || env('RESEND_API_KEY')
  if (!key || !from) return { ok: false, error: 'email_not_configured' }
  try {
    if (provider === 'brevo') {
      const m = /^(.*)<(.+)>$/.exec(from)
      const sender = m ? { name: m[1].trim().replace(/^"|"$/g, ''), email: m[2].trim() } : { email: from }
      const res = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender, to: [{ email: msg.to }], subject: msg.subject, htmlContent: msg.html, textContent: msg.text, ...(msg.replyTo ? { replyTo: { email: msg.replyTo } } : {}) }),
        signal: AbortSignal.timeout(10_000),
      })
      return res.ok ? { ok: true } : { ok: false, error: `brevo_${res.status}` }
    }
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, ...(msg.replyTo ? { reply_to: msg.replyTo } : {}) }),
      signal: AbortSignal.timeout(10_000),
    })
    return res.ok ? { ok: true } : { ok: false, error: `resend_${res.status}` }
  } catch {
    return { ok: false, error: 'email_unreachable' }
  }
}
