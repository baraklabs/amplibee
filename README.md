# Amplibee

A free visibility checker for founders. Enter a product website, and Amplibee checks directories, search indexing, mentions, technical SEO and trust signals, compares the product with its competitors, scores it out of 100 and lists the gaps. The paid fix path is a prefilled campaign on [Oyekool](https://oyekool.com).

```
apps/web/     Next.js 16 (App Router, TypeScript). A pure client of the JSON API. Deploys to Vercel.
supabase/     Postgres migrations, seed, and two Edge Functions (Deno):
  functions/api/          the JSON API under /v1
  functions/maintenance/  monthly Tranco import
  functions/_shared/      scanning, scoring, SSRF guard, pipeline (pure TypeScript, unit tested)
scripts/      copy lint, sample report generator, local end-to-end run, shared-file sync
```

> **Vercel Hobby is non-commercial.** Vercel's free Hobby plan is restricted to non-commercial use. Amplibee links to a paid marketplace and collects leads, so put the site on a paid Vercel plan, or host the Next.js app somewhere else, before you launch it as a business.

## Status

Verified in this repo: 165 unit tests (domain normalization, SSRF guard and safe fetcher, scoring, gaps, API envelope, Oyekool link, copy rules), type checks for both halves, a production build, Lighthouse mobile 96 or higher on Home, Methodology and guide pages (measured against a local production server), and a full six-step run of the real pipeline against live sites with an in-memory stand-in for the database (`npm run e2e`).

Not verified here, because it needs your accounts: the SQL migrations running on a real Postgres, RLS behaviour (run `supabase/scripts/verify-anon.mjs`), the Edge Functions running on the Deno runtime, Turnstile, email delivery, and any search provider. Treat the first deploy as the test of those.

## Local setup

Requirements: Node 22, Docker Desktop and the [Supabase CLI](https://supabase.com/docs/guides/cli) for the local stack.

```bash
npm install
cp .env.example supabase/functions/.env     # then fill in values
cp apps/web/.env.example apps/web/.env.local

supabase start                              # local Postgres, applies migrations and seed.sql
supabase functions serve --env-file supabase/functions/.env --no-verify-jwt
npm run dev                                 # http://localhost:3000
```

The API is then at `http://127.0.0.1:54321/functions/v1/api/v1`. Check it: `curl http://127.0.0.1:54321/functions/v1/api/v1/health`.

Useful commands:

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests for both halves |
| `npm run lint:copy` | Fails on em dashes, emoji, banned phrases, exclamation marks, or the word AI in UI source |
| `npm run typecheck` | Type-checks the Edge Function sources and the web app |
| `npm run e2e -- example.com competitor.com` | Runs all six steps for a real domain against an in-memory database |
| `npm run sample -- yourdomain.com rival.com` | Regenerates the sample report and the live-log and walkthrough data on the home page |
| `npx tsx scripts/generate-examples.mts a.com b.com c.com d.com` | Regenerates the four example cards on the home page from live checks |
| `npm run seed:build` | Rebuilds `supabase/seed.sql` from `supabase/seed/directories.json` |
| `node supabase/scripts/verify-directories.mjs` | Re-checks every directory URL over HTTP |
| `node supabase/scripts/verify-anon.mjs` | Confirms the anon key reads and writes nothing |

## Environment variables

Edge Function secrets are listed in `.env.example`, public web variables in `apps/web/.env.example`. The service role key lives only in the Edge Function environment, which Supabase provides. It is never read by the web app.

Key behaviours:

- **No search key:** indexing, web mentions, Reddit, LinkedIn, X and review checks are skipped, logged as skipped, and left out of the score. Scores then rest on the other measurements.
- **No email key:** unlock still works and returns the report. The response says `email_sent: false` and shows the report address.
- **`ENABLE_LLM=false` (default):** nothing calls a model. Only competitor suggestion is built behind the flag. Product summary, brief drafting and answer engine mentions are not implemented.

## Deploy

### Supabase

```bash
supabase link --project-ref <ref>
supabase db push                              # migrations
psql "$DB_URL" -f supabase/seed.sql           # or run supabase/seed.sql in the SQL editor
supabase secrets set --env-file .env
supabase functions deploy api --no-verify-jwt
supabase functions deploy maintenance --no-verify-jwt
node supabase/scripts/verify-anon.mjs         # with SUPABASE_URL and SUPABASE_ANON_KEY set
```

Accounts are handled by the same function under `/v1/auth/*` (migration `20261013000001_custom_auth.sql`). Set `JWT_SECRET` (and `GOOGLE_CLIENT_ID` for Google sign-in) before deploying, and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on the web app. Confirmation and reset emails need the email settings below.

The API is public by design and does its own bot protection (Turnstile) and rate limiting, so it is deployed without JWT verification. The browser never needs the anon key. RLS is on for every table with no policies, and table and function grants are revoked from `anon` and `authenticated`.

### Scheduled jobs

Migration `20261010000003_schedules.sql` creates two pg_cron jobs. Before the Tranco job works, store two secrets once in the SQL editor:

```sql
select vault.create_secret('https://<ref>.supabase.co/functions/v1/maintenance', 'maintenance_url');
select vault.create_secret('<the CRON_SECRET value>', 'cron_secret');
```

- **Weekly purge**, Sundays 03:15 UTC: scan cache older than 7 days, rate limit rows older than 2 days, checks older than 30 days.
- **Monthly Tranco import**, the 2nd at 04:00 UTC: downloads the top `TRANCO_TOP_N` (default 100,000) domains. Run it once by hand after deploy:
  `curl -X POST <maintenance_url> -H "x-cron-secret: <value>" -H "content-type: application/json" -d '{"job":"tranco"}'`

Until the first import, the rank check is skipped and logged as skipped.

### Current production deployment

- **Vercel:** project `amplibee` (team `gourabp17-6842s-projects`), production domain https://amplibee.com. Root Directory `apps/web`, install command `cd ../.. && npm install`. Deploy with `vercel deploy --prod` from the repo root.
- **Supabase:** project ref `ozkvpuvgxzlgtslstehj`. Link with `supabase link --project-ref ozkvpuvgxzlgtslstehj`, push the schema with `supabase db push`, and deploy with `supabase functions deploy --no-verify-jwt`. The previous app's schema and `auth-*` functions were replaced in this project.
- **Still to set:** real `TURNSTILE_SECRET_KEY` and site key (test keys are in use), `SEARCH_API_KEY`, `EMAIL_API_KEY`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sign-in needs it) in Vercel. Run the one-off Tranco import described above.

### Vercel

1. Import the repo, set **Root Directory** to `apps/web`, and leave "Include source files outside of the Root Directory" on.
2. Add the variables from `apps/web/.env.example`. `NEXT_PUBLIC_API_URL` is `https://<ref>.supabase.co/functions/v1/api/v1`.
3. Set `SITE_URL` (Edge secret) to the production origin so CORS allows it. Add preview URLs to `ALLOWED_ORIGINS` if you test on previews.
4. Use a paid plan (see the note at the top).

`apps/web/lib/shared/` and `apps/web/data/directories.json` are copies of files in `supabase/`. `npm run sync:shared` refreshes them, and dev and build do it automatically.

## How the job runs

`POST /v1/check` creates a job with six step rows. The browser then calls `POST /v1/check/{id}/advance` in a loop. Each call claims the first unfinished step with a 90 second lease, runs one short slice (a fetch round, or one scan task), writes real log lines, and releases it, so no invocation approaches a time limit and two tabs cannot run a step twice. Step 2 pauses until `PATCH /v1/check/{id}/competitors`. `GET /v1/check/{id}` returns step states, log lines and partial results at any time.

`advance` and `PATCH /v1/check/{id}/product` are additions to the endpoint list in the brief.

## Cost notes

- **Supabase:** the free plan covers a small launch. Edge Functions on the free plan have a short CPU budget per invocation, which is why scanning is split into one task per call. A Pro plan removes most of that pressure.
- **Search provider:** the dominant cost. A free check is at most 2 queries. A full check is at most 30, in practice about 12 (4 for you, 2 each for 3 competitors, plus 2 at the free stage). Scan results are cached per domain for 7 days and cached tasks cost no queries. `GLOBAL_DAILY_CAP` bounds the worst case: 500 checks a day at 2 queries is 1,000 queries.
- **PageSpeed Insights:** free with a key, and the shared quota without one is often exhausted.
- **Email:** one message per unlock.
- **Tranco table:** 100,000 rows is a few megabytes of the free database allowance.

## Security notes

- Every user-supplied URL goes through `assertSafeUrl`: http and https only, ports 80 and 443 only, no credentials, hostnames resolved with `Deno.resolveDns`, private, loopback, link-local, CGNAT, multicast and metadata ranges refused (IPv4, IPv6, IPv4-mapped, NAT64, 6to4), repeated on every redirect, max 3 redirects, 8 second timeout, 2 MB cap, robots.txt obeyed.
- **Known limit:** the guard resolves DNS itself, but `fetch` resolves again when it connects, so a hostile DNS server that answers differently the second time (DNS rebinding) is not fully closed. Deno offers no way to pin the connection to a vetted address. If this matters for your threat model, route outbound fetches through an egress proxy that enforces the same ranges.
- Input is validated with zod. Bodies over 16 KB are refused. CORS allows only `SITE_URL` and `ALLOWED_ORIGINS`.
- IP addresses are stored only as a salted hash.
- Report pages are `noindex` unless `REPORT_INDEXABLE=true`. Anyone can request removal, and the report is hidden immediately and reviewed afterwards. This favours privacy and can be abused to hide someone else's public report. Change `postRemoval` if you want proof of ownership.

## Things for the owner to check

- **Landing page modelled on explee.com:** warm gray page, white cards, Geist type, dark primary button, emerald accent, light and dark themes, and Explee's section order (hero, example results, step-by-step walkthrough, pricing tiers, FAQ, closing call to action). The walkthrough and example cards use real data from `apps/web/data/sample-report.json` and `examples.json`, with no invented numbers. The "What our customers got out of it" cards and the "What customers are saying" three-row marquee are built but data-driven. Add real entries to `apps/web/data/customers.json` (`name`, `company`, `quote`, `url`, `avatar`, two `stats`) and `testimonials.json` (`quote`, `name`, `company`, `url`, `avatar`). Until then the results section shows real example checks and the quote section is hidden. There is one set of data files for local and production. Do not add customers or quotes you cannot source. The pill at the top rotates real facts computed from the config, directory list and example checks.

- **Oyekool prefill parameter names** (`task_type`, `brief`, `budget_usd`) in `apps/web/lib/oyekool.ts` are placeholders. Oyekool has not confirmed them. Change `PREFILL_PARAMS` in that one file, or set `NEXT_PUBLIC_OYEKOOL_PREFILL=false`. The suggested budgets are in `supabase/functions/_shared/fixes.config.ts`.
- **Relationship disclosure:** the About page says Amplibee earns nothing from a user's choice to use Oyekool. Confirm that is true, and state any ownership link to Oyekool plainly there.
- **Legal pages** (Privacy, Terms) describe what the code does. They are not legal advice. Have them reviewed.
- **Directories:** `supabase/seed/directories.json` holds 20 entries whose home pages answered over HTTP on 2026-10-10. Submission pages that did not answer are `null` with a note. Profile-address checks are kept only where a known product answered 200. Bot-protected sites (AlternativeTo, G2, Trustpilot, Indie Hackers, StackShare) return `not confirmed` rather than a guess.
- **Sample report:** `apps/web/data/sample-report.json` was generated with no search key and no PageSpeed key, so those checks are skipped in it, and the page says so. Regenerate with keys set for a fuller sample.
- **OG images** use the default font. Add a font file to `apps/web/lib/og.tsx` if you want the serif.
- Set a real contact address in `NEXT_PUBLIC_CONTACT_EMAIL`.
