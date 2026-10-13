-- Amplibee schema. Every table is reachable only through Edge Functions using the service role.

create extension if not exists pgcrypto;

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  first_seen_at timestamptz not null default now(),
  last_checked_at timestamptz,
  removed boolean not null default false
);

-- One row per check job.
create table public.checks (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references public.domains (id) on delete set null,
  domain text,                                   -- null in no-website mode
  mode text not null default 'website' check (mode in ('website', 'no_website')),
  input jsonb not null default '{}'::jsonb,      -- no-website answers
  status text not null default 'running' check (status in ('running', 'awaiting_input', 'done', 'error')),
  tier text not null default 'free' check (tier in ('free', 'full')),
  product jsonb not null default '{}'::jsonb,    -- step 1 output, editable by the user
  competitors jsonb not null default '[]'::jsonb,
  competitors_confirmed boolean not null default false,
  scan jsonb not null default '{}'::jsonb,       -- domain -> TargetScan
  query_count integer not null default 0,
  ip_hash text,
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unlocked_at timestamptz
);
create index checks_domain_idx on public.checks (domain, created_at desc);
create index checks_created_idx on public.checks (created_at);

-- One row per visible step (1 research, 2 competitors, 3 scan, 4 score, 5 plan, 6 launch).
create table public.check_steps (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references public.checks (id) on delete cascade,
  step smallint not null check (step between 1 and 6),
  key text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'awaiting_input', 'done', 'error')),
  state jsonb not null default '{}'::jsonb,      -- step-internal progress, e.g. finished scan tasks
  log jsonb not null default '[]'::jsonb,        -- [{ t, level, msg }]
  lease_until timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  unique (check_id, step)
);

-- Versioned results. kind is 'report' or 'scan:<task>'. Scan rows are the per-domain cache.
create table public.results (
  id uuid primary key default gen_random_uuid(),
  check_id uuid references public.checks (id) on delete cascade,
  domain text,
  kind text not null,
  version integer not null default 1,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index results_cache_idx on public.results (domain, kind, created_at desc);
create index results_check_idx on public.results (check_id, kind, version desc);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  domain text,
  check_id uuid references public.checks (id) on delete set null,
  consent boolean not null,
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index leads_email_idx on public.leads (lower(email));

create table public.directories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  url text not null,
  category text not null,
  submit_url text,
  check_method text not null default 'none' check (check_method in ('slug_url', 'search_hit', 'hn_api', 'none')),
  check_url_template text,
  priority integer not null default 100,
  description text not null default '',
  verified boolean not null default false,
  todo text,
  verified_at date
);

create table public.tranco_ranks (
  domain text primary key,
  rank integer not null,
  updated_at timestamptz not null default now()
);
create index tranco_updated_idx on public.tranco_ranks (updated_at);

create table public.rate_limits (
  key text not null,
  window_date date not null default current_date,
  count integer not null default 0,
  primary key (key, window_date)
);

create table public.removal_requests (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  email text,
  reason text,
  status text not null default 'hidden' check (status in ('hidden', 'reviewed', 'declined')),
  created_at timestamptz not null default now()
);
