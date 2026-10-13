// Posts a message to the team's Telegram chat. Fire-and-log: a failed delivery (or missing secrets) must never block
// the sign-up that triggered it, so this never throws.

import { env } from './env.ts'

export async function notifyTelegram(text: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  const token = env('TELEGRAM_BOT_TOKEN').trim().replace(/^bot/i, '')
  const chatId = env('TELEGRAM_CHAT_ID').trim()
  if (!token || !chatId) return
  try {
    const res = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) console.error('telegram: API error', res.status)
  } catch (e) {
    console.error('telegram: request failed', e)
  }
}

export const newSignupMessage = (name: string | null, email: string, via: 'Password' | 'Email link' | 'Google') =>
  `🎉 New Amplibee Signup\n\n👤 Name: ${name ?? '(no name)'}\n📧 Email: ${email}\n🔑 Via: ${via}`
