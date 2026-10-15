-- What a signed-in person sets up in the dashboard: their site, competitors, keywords, directory submissions,
-- content ideas and daily score readings. Like every other table: row level security on, no policies, no grants for
-- anon or authenticated. Only the Edge Function using the service role reads or writes them, after checking the login
-- and the limits of the person's plan.

create table public.workspaces (
  user_id uuid primary key references public.users (id) on delete cascade,
  domain text not null default '',
  updated_at timestamptz not null default now()
);

create table public.tracked_competitors (
  user_id uuid not null references public.users (id) on delete cascade,
  domain text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, domain)
);

create table public.tracked_keywords (
  user_id uuid not null references public.users (id) on delete cascade,
  keyword text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, keyword)
);

create table public.directory_tracking (
  user_id uuid not null references public.users (id) on delete cascade,
  slug text not null,
  status text not null default 'todo' check (status in ('todo', 'submitted', 'listed')),
  updated_at timestamptz not null default now(),
  primary key (user_id, slug)
);

create table public.content_items (
  user_id uuid not null references public.users (id) on delete cascade,
  id uuid not null,
  title text not null,
  kind text not null check (kind in ('blog', 'comparison', 'post')),
  state text not null default 'idea' check (state in ('idea', 'drafting', 'scheduled', 'published')),
  publish_date date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.score_history (
  user_id uuid not null references public.users (id) on delete cascade,
  domain text not null,
  day date not null,
  score integer not null check (score between 0 and 100),
  primary key (user_id, domain, day)
);

alter table public.workspaces enable row level security;
alter table public.tracked_competitors enable row level security;
alter table public.tracked_keywords enable row level security;
alter table public.directory_tracking enable row level security;
alter table public.content_items enable row level security;
alter table public.score_history enable row level security;
revoke all on public.workspaces, public.tracked_competitors, public.tracked_keywords, public.directory_tracking, public.content_items, public.score_history from anon, authenticated;

-- Replaces a person's whole workspace in one transaction. The Edge Function has already validated the document and
-- cut it down to the plan's limits. Score readings are only ever added or corrected, never deleted.
create or replace function public.save_workspace(p_user uuid, p_doc jsonb)
returns void
language plpgsql
set search_path = public
as $$
begin
  insert into workspaces (user_id, domain, updated_at) values (p_user, coalesce(p_doc ->> 'domain', ''), now())
  on conflict (user_id) do update set domain = excluded.domain, updated_at = now();

  delete from tracked_competitors where user_id = p_user;
  insert into tracked_competitors (user_id, domain, position)
  select p_user, x.v, x.n::integer from jsonb_array_elements_text(coalesce(p_doc -> 'competitors', '[]'::jsonb)) with ordinality as x(v, n)
  on conflict do nothing;

  delete from tracked_keywords where user_id = p_user;
  insert into tracked_keywords (user_id, keyword, position)
  select p_user, x.v, x.n::integer from jsonb_array_elements_text(coalesce(p_doc -> 'keywords', '[]'::jsonb)) with ordinality as x(v, n)
  on conflict do nothing;

  delete from directory_tracking where user_id = p_user;
  insert into directory_tracking (user_id, slug, status)
  select p_user, e.key, e.value from jsonb_each_text(coalesce(p_doc -> 'directories', '{}'::jsonb)) as e;

  delete from content_items where user_id = p_user;
  insert into content_items (user_id, id, title, kind, state, publish_date, position)
  select p_user, (e.v ->> 'id')::uuid, e.v ->> 'title', e.v ->> 'kind', e.v ->> 'state', nullif(e.v ->> 'date', '')::date, e.n::integer
  from jsonb_array_elements(coalesce(p_doc -> 'content', '[]'::jsonb)) with ordinality as e(v, n)
  on conflict do nothing;

  insert into score_history (user_id, domain, day, score)
  select p_user, coalesce(p_doc ->> 'domain', ''), (h ->> 'date')::date, (h ->> 'score')::integer
  from jsonb_array_elements(coalesce(p_doc -> 'history', '[]'::jsonb)) as h
  on conflict (user_id, domain, day) do update set score = excluded.score;
end;
$$;

revoke all on function public.save_workspace(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_workspace(uuid, jsonb) to service_role;
