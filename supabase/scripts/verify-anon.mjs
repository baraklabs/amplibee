// Acceptance check: the public (anon) key must read and write nothing through the data API.
//
//   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_ANON_KEY=<anon key> node supabase/scripts/verify-anon.mjs

const url = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '')
const key = process.env.SUPABASE_ANON_KEY ?? ''
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY.')
  process.exit(2)
}

const tables = ['domains', 'checks', 'check_steps', 'results', 'leads', 'directories', 'tranco_ranks', 'rate_limits', 'removal_requests']
const headers = { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' }
let bad = 0

for (const t of tables) {
  const read = await fetch(`${url}/rest/v1/${t}?select=*&limit=1`, { headers })
  const body = await read.text()
  const rows = read.ok ? JSON.parse(body) : null
  const readOk = !read.ok || (Array.isArray(rows) && rows.length === 0)

  const write = await fetch(`${url}/rest/v1/${t}`, { method: 'POST', headers: { ...headers, prefer: 'return=minimal' }, body: '{}' })
  const writeOk = !write.ok

  console.log(`${readOk && writeOk ? 'ok  ' : 'FAIL'} ${t.padEnd(18)} read ${read.status}${rows ? ` (${rows.length} rows)` : ''}  write ${write.status}`)
  if (!readOk || !writeOk) bad++
}

for (const fn of ['rl_hit', 'rl_peek']) {
  const r = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify({ p_key: 'anon-test' }) })
  const ok = !r.ok
  console.log(`${ok ? 'ok  ' : 'FAIL'} rpc ${fn.padEnd(14)} ${r.status}`)
  if (!ok) bad++
}

if (bad) {
  console.error(`\n${bad} problem(s): the anon key can reach data.`)
  process.exit(1)
}
console.log('\nanon key reads and writes nothing.')
