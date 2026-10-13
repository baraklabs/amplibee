// Checks every address in supabase/seed/directories.src.json over HTTP and writes directories.json.
// An entry is kept as verified only if its home page answers. A submit_url or check_url_template that does
// not answer is dropped and noted in `todo`. Nothing is invented: unknown means null.
//
//   node supabase/scripts/verify-directories.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = JSON.parse(await readFile(join(here, '../seed/directories.src.json'), 'utf8'))
const UA = 'AmplibeeBot/1.0 (directory verification script)'

async function probe(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(15000) })
    await res.body?.cancel()
    // 401/403/429 mean the page exists but a bot filter answered.
    const exists = res.status < 400 || [401, 403, 429].includes(res.status)
    return { status: res.status, exists, definite: res.status < 400 }
  } catch (e) {
    return { status: 0, exists: false, definite: false, error: String(e.cause?.code ?? e.message) }
  }
}

const out = []
for (const d of src) {
  const todo = []
  const home = await probe(d.url)
  console.log(`${home.exists ? 'ok  ' : 'FAIL'} ${home.status} ${d.url}`)
  if (!home.exists) {
    console.log(`     dropped ${d.slug}`)
    continue
  }
  let submit = d.submit_url ?? null
  if (submit) {
    const s = await probe(submit)
    console.log(`     submit ${s.status} ${submit}`)
    if (!s.exists) {
      todo.push(`submit_url ${submit} did not answer (${s.status}); find the current submission page`)
      submit = null
    } else if (!s.definite) todo.push('submit_url answered with a bot-filter status; open it in a browser to confirm')
  } else todo.push('no submit_url recorded; find the current submission page')

  let template = d.check_url_template ?? null
  let method = d.check_method ?? (template ? 'slug_url' : 'none')
  if (template) {
    const test = template.replace('{slug}', d.known_slug).replace('{domain}', d.known_slug)
    const t = await probe(test)
    console.log(`     template ${t.status} ${test}`)
    if (!t.definite || t.status !== 200) {
      todo.push(`check_url_template ${template} could not be confirmed (${t.status}); presence is checked by search results only`)
      template = null
      method = 'search_hit'
    }
  }
  out.push({
    slug: d.slug, name: d.name, url: d.url, category: d.category, priority: d.priority, description: d.description,
    submit_url: submit, check_method: method, check_url_template: template, verified: home.definite, todo: todo.join('; ') || null,
    verified_at: new Date().toISOString().slice(0, 10),
  })
}

await writeFile(join(here, '../seed/directories.json'), JSON.stringify(out, null, 2) + '\n')
console.log(`\nwrote ${out.length} of ${src.length} entries`)
