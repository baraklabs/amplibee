# Oyekool

## Stack

- **Next.js** (App Router) + React + TypeScript
- **Tailwind CSS v4**
- **Supabase** — Postgres only. Auth is **not** Supabase Auth — see [Notes](#notes).
- **Custom auth** — bcrypt password hashes + HMAC JWTs (`jose`), issued by Supabase Edge Functions (`supabase/functions/auth-*`) and verified in Next.js (`src/lib/auth/`, `src/proxy.ts`).

## Dev

**UI**

```bash
npm install
npm run dev
```

http://localhost:3000

**Backend (Supabase)**

1. Create a Supabase project, then create `env/dev.env` (gitignored, loaded by `next.config.ts`) and fill in — see that file's own comments for details:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API. The service_role key is used server-side only (`src/lib/supabase/admin.ts`); there's no anon/publishable key anywhere in the app.
   - `JWT_SECRET` — `openssl rand -hex 32`. Must match `JWT_SECRET` in `supabase/functions/.env` exactly — both sides sign/verify the same tokens.
   - `ENCRYPTION_SECRET` — `openssl rand -hex 32`. Encrypts OAuth tokens and BYOK AI keys at rest.
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth 2.0 Client ID (Web application) for "Sign in with Google", from https://console.cloud.google.com/apis/credentials. Must match `GOOGLE_CLIENT_ID` in `supabase/functions/.env`.
   - `X_CLIENT_ID`/`X_CLIENT_SECRET`, `LINKEDIN_CLIENT_ID`/`LINKEDIN_CLIENT_SECRET`, `YOUTUBE_CLIENT_ID`/`YOUTUBE_CLIENT_SECRET`, `META_CLIENT_ID`/`META_CLIENT_SECRET` — optional, only needed to connect those platforms (Meta covers both Facebook and Instagram).
   - `CRON_SECRET` — optional. Required once `/api/cron/publish-scheduled` is wired up to a real scheduler in production; see [Notes](#notes).
   - `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` — optional, only needed for newsletter-signup Telegram notifications (`src/lib/telegram.ts`); new-signup notifications fire from the edge functions instead (their own copy lives in `supabase/functions/.env`). Left blank, they just log to the console instead of failing.
   - `NEXT_PUBLIC_GA_ID` — optional, GA4 measurement ID (`G-XXXXXXX`) for Google Analytics (`src/components/analytics/google-analytics.tsx`). Left blank, no analytics script loads at all. When set, it still only fires after the cookie banner/settings modal records analytics opt-in (`src/lib/cookie-consent.ts`).
2. Run migrations:
   ```bash
   supabase db push
   ```
3. Fill in `supabase/functions/.env` (its own copy of secrets, not shared with `env/dev.env` — see its comments), then deploy the auth edge functions and push their secrets:
   ```bash
   supabase functions deploy
   supabase secrets set --env-file supabase/functions/.env
   ```
   The Next.js app never talks to Supabase Auth — sign-up, sign-in, Google sign-in, refresh, verify, and password reset all go through these `auth-*` functions.

## Prod

**UI**

```bash
npm run build
npm start
```

**Backend**

```bash
supabase db push          # migrations
supabase functions deploy # auth-* edge functions
npx supabase functions deploy --no-verify-jwt  
npx supabase db push  
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit
- `npm run format` — Prettier

## Notes

- **Auth**: hand-rolled, not Supabase Auth. `public.users` / `user_sessions` / `password_reset_codes` (bigint ids, bcrypt password hashes) replace `auth.users`. Sign-up/in/Google/refresh/verify/password-reset are Supabase Edge Functions (`supabase/functions/auth-*`, Deno) that mint HMAC JWTs; Next.js only ever verifies them (`src/lib/auth/jwt.ts`) and reads the current user id from a cookie (`src/lib/auth/session.ts`). `src/proxy.ts` refreshes an expiring access token and gates `/dashboard`. RLS isn't in play for these tables — every access goes through either an edge function or `src/lib/supabase/admin.ts`, both using the `service_role` key.
- **Env files** (`env/`): `env/dev.env` and `env/prod.env` are gitignored and loaded by `next.config.ts` via `process.loadEnvFile`, picked by `NODE_ENV`/`APP_ENV`. It never overrides a variable already set in `process.env`, so on Vercel the dashboard-configured values always win over whatever (if anything) is in `env/prod.env` — that file is just a local reference for what production needs, with secrets left blank.
- **Edge function secrets** (`supabase/functions/.env`): a separate, Deno-side set of secrets for the `auth-*` functions — not read by Next.js or `next.config.ts`. Push it with `supabase secrets set --env-file supabase/functions/.env`. `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, and `GOOGLE_CLIENT_ID` must match the same values in `env/dev.env`/`env/prod.env`, or tokens minted by the functions won't verify in Next.js (and vice versa).
- **Platform integrations** (`src/lib/platforms/`): one adapter per platform behind a shared `PlatformProvider` interface, all OAuth 2.0. X, LinkedIn, and Facebook can publish a text post directly through their own API. YouTube and Instagram connect (OAuth + account lookup) but can't publish yet — both require uploading actual media (a video file, or an already-hosted image/video URL) and the composer is text-only today; see each provider's `limitations` string for specifics.
- **AI providers** (`src/lib/ai/`): BYOK via OpenAI, Anthropic, or OpenRouter (or a custom OpenAI-compatible endpoint) behind a shared `AIProvider` interface. Keys are encrypted with AES-256-GCM (`src/lib/crypto.ts`), decrypted server-side only.
- **Scheduling**: scheduling a post writes a `scheduled_posts` row. `GET /api/cron/publish-scheduled` publishes every due row — nothing in this codebase calls it on a timer yet. `vercel.json` already declares it as a Vercel Cron Job (every 5 minutes) for a Vercel deploy; elsewhere, point any cron-to-HTTP scheduler (Supabase Cron, QStash, etc.) at that route with `Authorization: Bearer $CRON_SECRET`.
- **Stubbed**: each platform's OAuth needs an app registered with that platform (and its client id/secret set) before "Connect" does anything — see `env/dev.env`'s comments. YouTube and Instagram publishing needs media upload added to the composer first (see above). Scheduled publishing needs the cron route above actually scheduled; until then, rows sit in `scheduled_posts` with status `pending`.
