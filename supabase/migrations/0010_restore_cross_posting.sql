-- Amplibee: cross-platform posting is the primary product again; influencer
-- campaigns stay as a secondary feature. 0009 dropped the posting tables, so
-- this migration recreates them (same shape as 0001/0003/0007) alongside the
-- campaign tables, which are left untouched.

-- =========================================================================
-- platforms — lookup table so new integrations can be added with an
-- insert rather than a schema migration or code enum change.
-- =========================================================================
create table platforms (
  id text primary key,
  name text not null,
  auth_type text not null check (auth_type in ('oauth2', 'api_token', 'manual')),
  color text not null default '#14141A',
  capabilities jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platforms_set_updated_at
  before update on platforms
  for each row execute function set_updated_at();

alter table platforms enable row level security;
create policy "platforms_select_all" on platforms for select using (true);

insert into platforms (id, name, auth_type, color, capabilities) values
  ('x', 'X', 'oauth2', '#000000', '{"connect":true,"refreshToken":true,"publish":true,"schedule":false,"analytics":true}'),
  ('linkedin', 'LinkedIn', 'oauth2', '#0A66C2', '{"connect":true,"refreshToken":false,"publish":true,"schedule":false,"analytics":false}'),
  ('medium', 'Medium', 'api_token', '#000000', '{"connect":true,"refreshToken":false,"publish":true,"schedule":false,"analytics":false}'),
  ('substack', 'Substack', 'manual', '#FF6719', '{"connect":true,"refreshToken":false,"publish":false,"schedule":false,"analytics":false}');

-- =========================================================================
-- connected_accounts — a user can connect many accounts per platform.

-- =========================================================================
-- connected_accounts
-- =========================================================================
create table connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  platform text not null references platforms(id),
  account_type text not null check (account_type in ('profile', 'page', 'publication')),
  external_account_id text,
  display_name text not null,
  handle text,
  avatar_url text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  status text not null default 'connected' check (status in ('connected', 'expired', 'revoked', 'error')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connected_accounts_user_platform_external_unique unique (user_id, platform, external_account_id)
);

create index connected_accounts_user_id_idx on connected_accounts(user_id);
create index connected_accounts_platform_idx on connected_accounts(platform);

create trigger connected_accounts_set_updated_at
  before update on connected_accounts
  for each row execute function set_updated_at();

alter table connected_accounts enable row level security;

-- =========================================================================
-- workflows + workflow_steps
-- =========================================================================
create table workflows (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  name text not null,
  source_type text not null check (source_type in ('x_post', 'text', 'url', 'github_repo', 'product_hunt', 'blog_post')),
  source_account_id uuid references connected_accounts(id) on delete set null,
  content_profile_id uuid references content_profiles(id) on delete set null,
  approval_mode text not null default 'manual' check (approval_mode in ('manual', 'automatic')),
  publish_mode text not null default 'draft' check (publish_mode in ('immediate', 'schedule', 'draft')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workflows_user_id_idx on workflows(user_id);

create trigger workflows_set_updated_at
  before update on workflows
  for each row execute function set_updated_at();

alter table workflows enable row level security;

create table workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  position integer not null,
  step_type text not null check (step_type in ('generate', 'approval', 'publish')),
  target_platform text references platforms(id),
  target_account_id uuid references connected_accounts(id) on delete set null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, position)
);

create index workflow_steps_workflow_id_idx on workflow_steps(workflow_id);

create trigger workflow_steps_set_updated_at
  before update on workflow_steps
  for each row execute function set_updated_at();

alter table workflow_steps enable row level security;

-- =========================================================================
-- source_posts
-- =========================================================================
create table source_posts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  input_type text not null check (input_type in ('x_post', 'text', 'url', 'github_repo', 'product_hunt', 'blog_post')),
  source_account_id uuid references connected_accounts(id) on delete set null,
  title text,
  raw_content text not null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index source_posts_user_id_idx on source_posts(user_id);

create trigger source_posts_set_updated_at
  before update on source_posts
  for each row execute function set_updated_at();

alter table source_posts enable row level security;

-- =========================================================================
-- generated_posts
-- =========================================================================
create table generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  source_post_id uuid references source_posts(id) on delete set null,
  workflow_id uuid references workflows(id) on delete set null,
  platform text not null references platforms(id),
  account_id uuid references connected_accounts(id) on delete set null,
  content_profile_id uuid references content_profiles(id) on delete set null,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed')),
  ai_provider text,
  ai_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generated_posts_user_id_idx on generated_posts(user_id);
create index generated_posts_status_idx on generated_posts(status);

create trigger generated_posts_set_updated_at
  before update on generated_posts
  for each row execute function set_updated_at();

alter table generated_posts enable row level security;

-- =========================================================================
-- scheduled_posts
-- =========================================================================
create table scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  generated_post_id uuid not null references generated_posts(id) on delete cascade,
  account_id uuid not null references connected_accounts(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'canceled')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scheduled_posts_user_id_idx on scheduled_posts(user_id);
create index scheduled_posts_scheduled_for_idx on scheduled_posts(scheduled_for);

create trigger scheduled_posts_set_updated_at
  before update on scheduled_posts
  for each row execute function set_updated_at();

alter table scheduled_posts enable row level security;

-- =========================================================================
-- published_posts
-- =========================================================================
create table published_posts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  generated_post_id uuid not null references generated_posts(id) on delete cascade,
  account_id uuid not null references connected_accounts(id) on delete cascade,
  external_id text,
  external_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index published_posts_user_id_idx on published_posts(user_id);

alter table published_posts enable row level security;

-- =========================================================================
-- analytics
-- =========================================================================
create table analytics (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  published_post_id uuid not null references published_posts(id) on delete cascade,
  impressions integer not null default 0,
  engagements integer not null default 0,
  clicks integer not null default 0,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index analytics_user_id_idx on analytics(user_id);
create index analytics_published_post_id_idx on analytics(published_post_id);

alter table analytics enable row level security;

-- =========================================================================
-- backlinks
-- =========================================================================
create table backlinks (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  generated_post_id uuid references generated_posts(id) on delete set null,
  canonical_url text not null,
  destination_url text not null,
  anchor_text text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  cta_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index backlinks_user_id_idx on backlinks(user_id);

create trigger backlinks_set_updated_at
  before update on backlinks
  for each row execute function set_updated_at();

alter table backlinks enable row level security;

