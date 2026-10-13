-- Requests from signed-in users: directory submission, competitor tracking, and a launch done for them.
-- Like every other table: row level security on, no policies, no grants for anon or authenticated.
-- Only Edge Functions using the service role read or write it, after verifying the caller's login.

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  check_id uuid references public.checks (id) on delete set null,
  domain text,
  type text not null check (type in ('directory_submission', 'track_competitors', 'launch_done_for_you')),
  details jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done', 'declined')),
  created_at timestamptz not null default now(),
  unique (user_id, check_id, type)
);
create index service_requests_user_idx on public.service_requests (user_id, created_at desc);
create index service_requests_status_idx on public.service_requests (status, created_at);

alter table public.service_requests enable row level security;
revoke all on public.service_requests from anon, authenticated;
