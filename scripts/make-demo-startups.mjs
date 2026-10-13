// Generates apps/web/data/startups.demo.json: 100 FICTIONAL startups for previewing the "startups launched" section.
// Names are invented combinations, logos are drawn from the names in the component, and nothing here is real.
//   node scripts/make-demo-startups.mjs

import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'web', 'data', 'startups.demo.json')

// small seeded generator so the file is the same every run
let seed = 20261010
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = (a) => a[Math.floor(rnd() * a.length)]

const FIRST = ['Tally', 'Pipe', 'Quill', 'Harbor', 'Lattice', 'North', 'Cobalt', 'Plain', 'Tide', 'Orbit', 'Pixel', 'Ledger', 'Field', 'Mail', 'Stack', 'Bright', 'Fern', 'Kite', 'Lumen', 'Maple', 'Nimbus', 'Oak', 'Pebble', 'Quartz', 'Rally', 'Sable', 'Thistle', 'Umber', 'Vessel', 'Wren', 'Yarrow', 'Zephyr', 'Alder', 'Birch', 'Cinder', 'Dune', 'Ember', 'Flint', 'Glade', 'Hollow', 'Indigo', 'Juniper', 'Kestrel', 'Larch', 'Moss', 'Nettle', 'Onyx', 'Pine', 'Quince', 'Reed']
const LAST = ['book', 'lane', 'note', 'stack', 'forms', 'desk', 'post', 'room', 'wise', 'ly', 'kit', 'base', 'flow', 'hub', 'loop', 'grid', 'mint', 'pad', 'spark', 'works', 'cast', 'dock', 'ify', 'scope', 'sync', 'door', 'path', 'light']

const CATEGORIES = {
  'Developer tools': ['Review pull requests in half the time.', 'Preview every branch on its own address.', 'Turn logs into answers without a query language.', 'Ship feature flags without a redeploy.'],
  Analytics: ['See which pages bring paying customers.', 'Privacy-friendly stats in a single script.', 'Funnels you can read without a data team.', 'Know why users leave before they convert.'],
  Productivity: ['One inbox for every task and message.', 'Plan the week in ten minutes.', 'Meeting notes that write their own follow-ups.', 'A calmer way to run a small team.'],
  Fintech: ['Send invoices that chase themselves.', 'Close the books without a spreadsheet.', 'Track runway across every account.', 'Collect payments in forty currencies.'],
  Marketing: ['Turn one post into a week of content.', 'Find the keywords your buyers actually use.', 'Run email sequences that read like a person wrote them.', 'Track mentions of your product across the web.'],
  Design: ['Hand off designs developers can build from.', 'Brand kits that stay in sync everywhere.', 'Mockups from a one-line brief.', 'Collect feedback right on the page.'],
  'HR and hiring': ['Hire your first ten without an agency.', 'Onboarding checklists that run themselves.', 'Compare offers across countries.', 'Schedule interviews in one click.'],
  'Customer support': ['Answer the same question once.', 'A help center that updates as your product does.', 'Route tickets to the person who can fix them.', 'See what customers ask before they churn.'],
  Security: ['Find leaked secrets before attackers do.', 'Security reviews for small teams.', 'Passwordless login in an afternoon.', 'Know what data leaves your app.'],
  'E-commerce': ['Recover carts without discount spam.', 'Product pages that load before the click.', 'Shipping rates for every region in one place.', 'Reviews you can trust, on your own store.'],
  Education: ['Turn a course into a cohort.', 'Practice problems that adapt to the learner.', 'Grade written work in minutes.', 'Live classes without the setup.'],
  Health: ['Book and remind patients automatically.', 'Wellness plans for remote teams.', 'Track habits without a wearable.', 'Notes clinicians finish before lunch.'],
}
const CATS = Object.keys(CATEGORIES)

const names = new Set()
while (names.size < 100) names.add(pick(FIRST) + pick(LAST))
const MONTHS = []
for (let y = 2025, m = 9; y < 2026 || m <= 9; m++) {
  if (m > 12) { m = 1; y++ }
  MONTHS.push(`${y}-${String(m).padStart(2, '0')}`)
  if (y === 2026 && m === 9) break
}

const startups = [...names].map((n, i) => {
  const category = CATS[i % CATS.length]
  const name = n[0].toUpperCase() + n.slice(1)
  return {
    name,
    domain: `${n.toLowerCase()}.${pick(['com', 'com', 'io', 'co', 'app'])}`,
    tagline: pick(CATEGORIES[category]),
    category,
    launched: pick(MONTHS),
    score: 62 + Math.floor(rnd() * 35),
  }
})
startups.sort((a, b) => (a.launched < b.launched ? 1 : a.launched > b.launched ? -1 : b.score - a.score))

await writeFile(out, JSON.stringify(startups, null, 2) + '\n')
console.log(`wrote ${startups.length} fictional startups`)
