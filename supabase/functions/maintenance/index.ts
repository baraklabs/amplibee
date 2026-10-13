// Scheduled maintenance, called by pg_cron through pg_net with the x-cron-secret header.
//   { "job": "tranco" }  monthly: import the Tranco top list into tranco_ranks
//   { "job": "purge" }   weekly: also available here if you prefer a function over the SQL job

import { getDb } from '../_shared/db.ts'
import { env, int } from '../_shared/env.ts'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

async function importTranco(): Promise<{ imported: number; list_id: string }> {
  const topN = int('TRANCO_TOP_N', 100_000)
  const meta = await fetch('https://tranco-list.eu/api/lists/date/latest', { signal: AbortSignal.timeout(20_000) })
  if (!meta.ok) throw new Error(`Tranco metadata answered ${meta.status}`)
  const { list_id, download } = (await meta.json()) as { list_id: string; download: string }
  const url = download.replace(/\/\d+$/, `/${topN}`)
  const res = await fetch(url, { signal: AbortSignal.timeout(90_000) })
  if (!res.ok) throw new Error(`Tranco download answered ${res.status}`)
  const text = await res.text()

  const started = new Date().toISOString()
  const db = getDb()
  const rows: { domain: string; rank: number; updated_at: string }[] = []
  for (const line of text.split('\n')) {
    const i = line.indexOf(',')
    if (i < 1) continue
    const rank = Number(line.slice(0, i))
    const domain = line.slice(i + 1).trim().toLowerCase()
    if (Number.isInteger(rank) && domain) rows.push({ domain, rank, updated_at: started })
  }
  if (rows.length < 1000) throw new Error('Tranco list looks too short; keeping the previous import.')

  for (let i = 0; i < rows.length; i += 5000) {
    const { error } = await db.from('tranco_ranks').upsert(rows.slice(i, i + 5000), { onConflict: 'domain' })
    if (error) throw new Error(`upsert failed: ${error.message}`)
  }
  // Rows not touched by this import dropped out of the list.
  const { error } = await db.rpc('tranco_purge_older_than', { p_cutoff: started })
  if (error) throw new Error(`purge failed: ${error.message}`)
  return { imported: rows.length, list_id }
}

Deno.serve(async (req) => {
  const secret = env('CRON_SECRET')
  if (!secret || req.headers.get('x-cron-secret') !== secret) return json(401, { ok: false })
  let job = ''
  try {
    job = ((await req.json()) as { job?: string }).job ?? ''
  } catch {
    return json(400, { ok: false, error: 'invalid_json' })
  }
  try {
    if (job === 'tranco') return json(200, { ok: true, ...(await importTranco()) })
    if (job === 'purge') {
      const db = getDb()
      const week = new Date(Date.now() - 7 * 86_400_000).toISOString()
      await db.from('results').delete().like('kind', 'scan:%').lt('created_at', week)
      await db.from('checks').delete().lt('created_at', new Date(Date.now() - 30 * 86_400_000).toISOString())
      return json(200, { ok: true })
    }
    return json(400, { ok: false, error: 'unknown_job' })
  } catch (e) {
    console.error('maintenance', job, e)
    return json(500, { ok: false, error: e instanceof Error ? e.message : 'failed' })
  }
})
