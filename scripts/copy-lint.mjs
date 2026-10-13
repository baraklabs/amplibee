// Fails when shipped copy breaks the writing rules: no em dashes, no emoji, no banned phrases,
// no exclamation marks in text, no "AI" in UI source.  Run: npm run lint:copy

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'lighthouse-reports', '.vercel'])
const SKIP_FILES = new Set(['copy-lint.mjs', 'package-lock.json', 'sample-report.json', 'AGENTS.md', 'CLAUDE.md'])
const EXT = /\.(ts|tsx|mts|mjs|json|sql|md|css|toml|example)$/

const BANNED = [
  'ai-powered', 'ai powered', 'supercharge', 'unlock the power', 'seamless', 'effortless', 'revolutioni', 'game-changer',
  'game changer', 'elevate', 'leverage', "in today's digital landscape", 'cutting-edge', 'cutting edge',
]
const EMOJI = /\p{Extended_Pictographic}/u
const EM_DASH = /—/
const BANG = /[A-Za-z0-9.)]!(?=\s|$|["'`<])/
// UI source where the letters AI must not appear as a word (header, nav, hero, buttons, section titles).
const NO_AI = /^apps[\\/]web[\\/](app|components)[\\/]/
const AI_WORD = /\bAI\b/
// The owner chose to use the word in the home page hero, so that one file is exempt.
const AI_EXEMPT = new Set(['apps/web/app/page.tsx'])

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) yield* walk(join(dir, e.name))
    } else if (EXT.test(e.name) && !SKIP_FILES.has(e.name)) yield join(dir, e.name)
  }
}

let problems = 0
const report = (file, n, msg, text) => {
  problems++
  console.error(`${file}:${n}  ${msg}  ${text.trim().slice(0, 100)}`)
}

for await (const path of walk(root)) {
  const file = relative(root, path)
  if (file.split(sep).includes('tests')) continue
  const isCode = /\.(ts|tsx|mts|mjs)$/.test(path)
  const lines = (await readFile(path, 'utf8')).split(/\r?\n/)
  lines.forEach((line, i) => {
    const lower = line.toLowerCase()
    if (EM_DASH.test(line)) report(file, i + 1, 'em dash', line)
    if (EMOJI.test(line)) report(file, i + 1, 'emoji', line)
    if (!/\.md$/.test(path)) {
      for (const b of BANNED) if (lower.includes(b)) report(file, i + 1, `banned phrase "${b}"`, line)
    }
    if (isCode && !/^\s*(\/\/|\*|\/\*)/.test(line) && BANG.test(line)) report(file, i + 1, 'exclamation mark', line)
    if (NO_AI.test(file) && !AI_EXEMPT.has(file.split(sep).join('/')) && AI_WORD.test(line)) report(file, i + 1, 'the word AI in UI source', line)
  })
}

if (problems) {
  console.error(`\n${problems} copy problem(s)`)
  process.exit(1)
}
console.log('copy lint: clean')
