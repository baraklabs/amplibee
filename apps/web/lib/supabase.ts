// Browser client for Supabase Auth only. It uses the project's public anon key, which is meant to be public.
// All Amplibee data stays behind Edge Functions: the tables have row level security with no policies and no
// grants for this key, so this client can sign people in and nothing else.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

let client: SupabaseClient | null = null

export const authConfigured = () => !!URL && !!KEY

export function getAuth(): SupabaseClient | null {
  if (!authConfigured()) return null
  if (!client) {
    client = createClient(URL, KEY, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        // The callback pages exchange the code themselves, so it is used exactly once.
        detectSessionInUrl: false,
      },
    })
  }
  return client
}

export const NOT_CONFIGURED = 'Sign-in is not set up on this site yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'

/** Turn a Supabase Auth error into a plain sentence. */
export function authMessage(err: { message?: string; status?: number; code?: string } | null | undefined): string {
  const m = (err?.message ?? '').toLowerCase()
  if (m.includes('invalid login credentials')) return 'That email and password do not match. Check them and try again.'
  if (m.includes('email not confirmed')) return 'Confirm your email first. We sent you a link when you created the account.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with that email already exists. Sign in instead.'
  if (m.includes('password should be') || m.includes('weak')) return 'Choose a password of at least 8 characters.'
  if (m.includes('rate limit') || err?.status === 429) return 'Too many attempts. Wait a minute and try again.'
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return 'Google sign-in is not turned on for this site yet.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Could not reach the sign-in service. Check your connection and try again.'
  return err?.message ? `Could not sign you in: ${err.message}` : 'Something went wrong. Try again.'
}
