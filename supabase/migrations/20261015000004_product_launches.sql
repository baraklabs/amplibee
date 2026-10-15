-- Product submissions from /launch-your-product. Each one is reviewed by hand: status starts at 'pending' and only
-- 'approved' rows are meant to be shown publicly. Like every other table: row level security on, no policies, no
-- grants for anon or authenticated. Only the Edge Function using the service role reads or writes it.

create table public.product_launches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  url text,
  domain text,
  tagline text not null,
  category text not null,
  pricing text not null,
  description text,
  audience text,
  problem text,
  differentiator text,
  logo text,
  x_handle text,
  github text,
  founder text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index product_launches_status_idx on public.product_launches (status, created_at desc);
create index product_launches_user_idx on public.product_launches (user_id, created_at desc);
-- One live submission per person per product name, so a double click or a retry does not create a second row.
create unique index product_launches_user_name_uidx on public.product_launches (user_id, lower(name)) where status <> 'rejected';

alter table public.product_launches enable row level security;
revoke all on public.product_launches from anon, authenticated;
