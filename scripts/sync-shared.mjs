// Copies the few files the web app shares with the Edge Functions, so the Vercel build never depends on
// files outside apps/web. Run automatically before dev and build. The copies are committed.

import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const files = [
  ['supabase/functions/_shared/types.ts', 'apps/web/lib/shared/types.ts'],
  ['supabase/functions/_shared/scoring.config.ts', 'apps/web/lib/shared/scoring.config.ts'],
  ['supabase/seed/directories.json', 'apps/web/data/directories.json'],
]

const check = process.argv.includes('--check')
let stale = 0
for (const [from, to] of files) {
  const src = join(root, from)
  const dst = join(root, to)
  if (check) {
    const [a, b] = await Promise.all([readFile(src, 'utf8'), readFile(dst, 'utf8').catch(() => '')])
    if (a !== b) {
      console.error(`out of date: ${to}`)
      stale++
    }
    continue
  }
  await mkdir(dirname(dst), { recursive: true })
  await copyFile(src, dst)
}
if (check && stale) process.exit(1)
if (!check) console.log(`synced ${files.length} shared files`)
