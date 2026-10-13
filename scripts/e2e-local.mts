// End-to-end run of the real pipeline (all six steps, real network requests) against an in-memory stand-in
// for the Supabase client. It proves the step logic, leasing, gating and unlock path without Docker.
//
//   npx tsx scripts/e2e-local.mts [domain] [competitor ...]
//
// It does not test SQL, RLS or the HTTP layer. Run scripts/verify-anon.mjs against a real project for those.

import dns from 'node:dns/promises'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import {
  advance, buildView, createCheck, loadCheck, parseCompetitorList, setCompetitors, unlockCheck, type PipelineEnv,
} from '../supabase/functions/_shared/pipeline.ts'
import { createFetcher } from '../supabase/functions/_shared/safe-fetch.ts'
import { normalizeDomain } from '../supabase/functions/_shared/domain.ts'

type Row = Record<string, any>

class Q {
  op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select'
  filters: ((r: Row) => boolean)[] = []
  payload: any
  returning = false
  orderBy: { col: string; asc: boolean } | null = null
  max = Infinity
  conflict = ''
  constructor(private db: FakeDb, private table: string) {}
  select(_c?: string, _o?: unknown) { if (this.op !== 'select') this.returning = true; return this }
  insert(p: any) { this.op = 'insert'; this.payload = p; return this }
  update(p: any) { this.op = 'update'; this.payload = p; return this }
  upsert(p: any, o?: { onConflict?: string }) { this.op = 'upsert'; this.payload = p; this.conflict = o?.onConflict ?? ''; return this }
  delete() { this.op = 'delete'; return this }
  eq(c: string, v: unknown) { this.filters.push((r) => r[c] === v); return this }
  in(c: string, v: unknown[]) { this.filters.push((r) => v.includes(r[c])); return this }
  gte(c: string, v: any) { this.filters.push((r) => r[c] !== null && r[c] >= v); return this }
  lt(c: string, v: any) { this.filters.push((r) => r[c] !== null && r[c] !== undefined && r[c] < v); return this }
  like(c: string, v: string) { const p = v.replace('%', ''); this.filters.push((r) => String(r[c]).startsWith(p)); return this }
  or(expr: string) {
    // Only the lease pattern used by advance(): status.eq.pending,and(status.eq.running,lease_until.lt.<iso>)
    const m = /lease_until\.lt\.(.+)\)$/.exec(expr)
    if (!m) throw new Error('fake db: unsupported or() ' + expr)
    this.filters.push((r) => r.status === 'pending' || (r.status === 'running' && r.lease_until !== null && r.lease_until < m[1]))
    return this
  }
  order(col: string, o?: { ascending?: boolean }) { this.orderBy = { col, asc: o?.ascending !== false }; return this }
  limit(n: number) { this.max = n; return this }
  maybeSingle() { return this.run().then((r) => ({ data: (r.data as Row[])[0] ?? null, error: r.error })) }
  single() { return this.maybeSingle() }
  then(res: (v: any) => any, rej?: (e: any) => any) { return this.run().then(res, rej) }

  private async run(): Promise<{ data: Row[] | null; error: { message: string } | null }> {
    const rows = this.db.t(this.table)
    const match = (r: Row) => this.filters.every((f) => f(r))
    if (this.op === 'insert' || this.op === 'upsert') {
      const list: Row[] = Array.isArray(this.payload) ? this.payload : [this.payload]
      const out: Row[] = []
      for (const p of list) {
        if (this.op === 'upsert' && this.conflict) {
          const ex = rows.find((r) => r[this.conflict] === p[this.conflict])
          if (ex) { Object.assign(ex, p); out.push(ex); continue }
        }
        const row = this.db.defaults(this.table, p)
        rows.push(row)
        out.push(row)
      }
      return { data: this.returning ? structuredClone(out) : null, error: null }
    }
    let hit = rows.filter(match)
    if (this.op === 'update') {
      for (const r of hit) for (const [k, v] of Object.entries(this.payload)) if (v !== undefined) r[k] = v
      return { data: this.returning ? structuredClone(hit) : null, error: null }
    }
    if (this.op === 'delete') {
      this.db.tables[this.table] = rows.filter((r) => !match(r))
      return { data: null, error: null }
    }
    if (this.orderBy) {
      const { col, asc } = this.orderBy
      hit = [...hit].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (asc ? 1 : -1))
    }
    return { data: structuredClone(hit.slice(0, this.max)), error: null }
  }
}

class FakeDb {
  tables: Record<string, Row[]> = {}
  t(name: string) { return (this.tables[name] ??= []) }
  from(name: string) { return new Q(this, name) }
  async rpc(name: string, args: Row) {
    if (name === 'rl_hit') {
      const r = this.t('rate_limits')
      let row = r.find((x) => x.key === args.p_key)
      if (!row) r.push((row = { key: args.p_key, count: 0 }))
      row.count++
      return { data: row.count, error: null }
    }
    return { data: null, error: null }
  }
  defaults(table: string, p: Row): Row {
    const now = new Date().toISOString()
    const base: Row = { id: randomUUID(), created_at: now }
    const per: Record<string, Row> = {
      checks: { status: 'running', tier: 'free', product: {}, competitors: [], competitors_confirmed: false, scan: {}, query_count: 0, utm: {}, input: {}, unlocked_at: null, updated_at: now },
      check_steps: { status: 'pending', state: {}, log: [], lease_until: null, started_at: null, finished_at: null },
      domains: { removed: false },
    }
    return { ...base, ...(per[table] ?? {}), ...p }
  }
}

const [, , rawDomain = 'linear.app', ...rawComps] = process.argv
const domain = normalizeDomain(rawDomain)
const comps = (rawComps.length ? rawComps : ['asana.com']).map(normalizeDomain)

const fake = new FakeDb()
const dirs = JSON.parse(await readFile(new URL('../supabase/seed/directories.json', import.meta.url), 'utf8'))
fake.tables.directories = dirs.map((d: Row) => ({ id: randomUUID(), ...d }))
const csv = await (await fetch('https://tranco-list.eu/download/8PX5V/100000')).text()
fake.tables.tranco_ranks = csv.split('\n').filter(Boolean).map((l) => {
  const i = l.indexOf(',')
  return { rank: Number(l.slice(0, i)), domain: l.slice(i + 1).trim() }
})

const resolve = async (h: string) => (await dns.lookup(h, { all: true })).map((r) => r.address)
const env: PipelineEnv = {
  db: fake as any,
  fetcher: createFetcher({ resolve, siteUrl: 'https://example.com' }),
  resolve,
  search: null,
  fetchImpl: fetch,
  psiKey: process.env.PSI_API_KEY ?? '',
  githubToken: process.env.GITHUB_TOKEN ?? '',
  suggestEnabled: false,
}

const assert = (cond: unknown, msg: string) => {
  if (!cond) { console.error('FAIL:', msg); process.exit(1) }
  console.log('ok  ', msg)
}

async function drive(id: string, stopAt: 'awaiting_input' | 'done') {
  for (let i = 0; i < 200; i++) {
    const c = await loadCheck(env.db, id)
    if (!c || c.status === 'error') throw new Error('check errored')
    if (c.status === stopAt) return i
    if (c.status === 'done' || c.status === 'awaiting_input') return i
    await advance(env, id)
  }
  throw new Error('did not settle in 200 advances')
}

const load = async () => (await loadCheck(env.db, id)) as NonNullable<Awaited<ReturnType<typeof loadCheck>>>
const id = await createCheck(env.db, { domain, mode: 'website', input: {}, ipHash: 'test', utm: {} })
console.log(`check ${id} for ${domain}`)

let n = await drive(id, 'awaiting_input')
let c = await load()
assert(c.status === 'awaiting_input', `step 2 pauses for competitors after ${n} advances`)
let v = await buildView(env.db, c)
assert(v.steps[0].status === 'done' && v.steps[1].status === 'awaiting_input', 'step 1 done, step 2 waiting')
assert(v.product.title !== undefined, 'step 1 produced product details')

await setCompetitors(env, c, parseCompetitorList(comps, domain))
n = await drive(id, 'done')
c = await load()
v = await buildView(env.db, c)
assert(c.status === 'done', `job finished after ${n} more advances`)
assert(v.steps.every((s) => s.status === 'done'), 'all six steps are done')
assert(v.steps.every((s) => s.log.length > 0), 'every step wrote log lines')
assert(v.report?.locked === true, 'free tier report is locked')
assert((v.report?.gaps.length ?? 99) <= 3, 'free tier shows at most 3 gaps')
assert(v.report?.competitors.length === 0 && v.report?.plan.length === 0, 'competitor table and fix plan are hidden when locked')
console.log(`score ${v.report?.score}, ${v.report?.gap_total} gaps, queries ${v.query_count}/${v.query_cap}`)

await unlockCheck(env.db, c)
await drive(id, 'done')
c = await load()
v = await buildView(env.db, c)
assert(v.unlocked && v.report?.locked === false, 'unlock removes the gate')
assert((v.report?.competitors.length ?? 0) === comps.length, 'competitor comparison present after unlock')
assert((v.report?.plan.length ?? 0) === v.report?.gaps.length, 'fix plan covers every gap after unlock')
assert((v.report?.version ?? 0) >= 2, 'report was re-versioned after the deep scan')

console.log('\n--- log ---')
for (const s of v.steps) {
  console.log(`Step ${s.step}: ${s.title}`)
  for (const l of s.log) console.log(`  ${l.t.slice(11, 19)} [${l.level}] ${l.msg}`)
}
