import { createClient } from '@supabase/supabase-js'
import { env } from './env.ts'

// deno-lint-ignore no-explicit-any
export type Db = ReturnType<typeof createClient<any>>

let client: Db | null = null

/** Service-role client. Only ever used inside Edge Functions. */
export function getDb(): Db {
  if (!client) {
    client = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client
}
