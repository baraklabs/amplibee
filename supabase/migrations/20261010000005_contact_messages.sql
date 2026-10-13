-- Messages from the contact form. Like every other table: row level security on, no policies, no grants for
-- anon or authenticated. Only the Edge Function using the service role writes it.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  topic text not null default 'general',
  message text not null,
  status text not null default 'new' check (status in ('new', 'replied', 'spam')),
  created_at timestamptz not null default now()
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
