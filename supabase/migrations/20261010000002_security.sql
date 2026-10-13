-- Lock the data API down. RLS is on for every table and there are no policies, so the anon and
-- authenticated roles can read and write nothing. Grants are removed as a second layer.

alter table public.domains enable row level security;
alter table public.checks enable row level security;
alter table public.check_steps enable row level security;
alter table public.results enable row level security;
alter table public.leads enable row level security;
alter table public.directories enable row level security;
alter table public.tranco_ranks enable row level security;
alter table public.rate_limits enable row level security;
alter table public.removal_requests enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;

-- Atomic counter used for per-IP and global daily limits. Returns the count after this hit.
create or replace function public.rl_hit(p_key text)
returns integer
language sql
as $$
  insert into public.rate_limits as r (key, window_date, count)
  values (p_key, current_date, 1)
  on conflict (key, window_date) do update set count = r.count + 1
  returning count;
$$;

-- Reads without incrementing, for showing remaining quota.
create or replace function public.rl_peek(p_key text)
returns integer
language sql
stable
as $$
  select coalesce((select count from public.rate_limits where key = p_key and window_date = current_date), 0);
$$;

-- Replace the Tranco table in one statement-level swap of rows older than the import.
create or replace function public.tranco_purge_older_than(p_cutoff timestamptz)
returns integer
language sql
as $$
  with d as (delete from public.tranco_ranks where updated_at < p_cutoff returning 1)
  select count(*)::integer from d;
$$;

revoke all on function public.rl_hit(text) from public, anon, authenticated;
revoke all on function public.rl_peek(text) from public, anon, authenticated;
revoke all on function public.tranco_purge_older_than(timestamptz) from public, anon, authenticated;
grant execute on function public.rl_hit(text) to service_role;
grant execute on function public.rl_peek(text) to service_role;
grant execute on function public.tranco_purge_older_than(timestamptz) to service_role;
