-- Accounts for the site, handled by our own Edge Function (api/v1/auth/*) instead of Supabase Auth: password hashes,
-- email codes, refresh-token sessions and password resets live here. Like every other table: row level security on,
-- no policies, no grants for anon or authenticated. Only the Edge Function using the service role reads or writes them.
-- Ids are uuids so service_requests.user_id (uuid) keeps working.

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  name text,
  password_hash text,                       -- null for accounts that only ever signed in with Google
  verified boolean not null default false,
  active boolean not null default true,
  otp_hash text,
  otp_expires_at timestamptz,
  otp_attempts integer not null default 0,
  verification_token_hash text,
  created_at timestamptz not null default now()
);
create unique index users_verification_token_hash_idx on public.users (verification_token_hash) where verification_token_hash is not null;

create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  refresh_token_hash text not null unique,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked boolean not null default false
);
create index user_sessions_user_idx on public.user_sessions (user_id);

create table public.password_reset_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  otp_hash text not null,
  link_token_hash text not null unique,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
create index password_reset_codes_user_idx on public.password_reset_codes (user_id);

alter table public.users enable row level security;
alter table public.user_sessions enable row level security;
alter table public.password_reset_codes enable row level security;
revoke all on public.users, public.user_sessions, public.password_reset_codes from anon, authenticated;
grant all on public.users, public.user_sessions, public.password_reset_codes to service_role;
