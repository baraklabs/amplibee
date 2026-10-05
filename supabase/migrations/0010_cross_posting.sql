-- Oyekool pivot: from the influencer marketplace (0009) back to cross-platform
-- scheduling and publishing — connect your own accounts, write once, post or
-- schedule to each one directly. This restores the shape of the product from
-- before 0009 (connected_accounts, generated/scheduled/published posts,
-- analytics, backlinks), updated for the current custom-auth bigint user id
-- and for the current platform list (x, linkedin, youtube, instagram,
-- facebook — medium/substack are dropped, workflows/automation are not
-- restored yet). A plain `check` constraint replaces the old `platforms`
-- lookup table, matching how 0009 already modeled `channel` columns.
-- Pre-launch, no real rows to preserve — same destructive-migration approach
-- as 0007_custom_auth.sql and 0009_influencer_marketplace.sql.

drop table if exists campaign_metrics cascade;
drop table if exists campaign_deliverables cascade;
drop table if exists campaign_applications cascade;
drop table if exists campaign_links cascade;
drop table if exists campaign_briefs cascade;
drop table if exists campaigns cascade;
drop table if exists network_profiles cascade;

-- =========================================================================
-- connected_accounts — a user can connect many accounts per platform.
-- =========================================================================
create table connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('x', 'linkedin', 'youtube', 'instagram', 'facebook')),
  account_type text not null default 'profile' check (account_type in ('profile', 'page', 'channel')),
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
-- source_posts — the original input a user brought into Oyekool to adapt
-- per platform (pasted text, a URL, a GitHub repo, etc).
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
-- generated_posts — the platform-native draft for one destination, adapted
-- from a source post (or written by hand). The unit the composer, posts
-- list, and scheduler all operate on.
-- =========================================================================
create table generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  source_post_id uuid references source_posts(id) on delete set null,
  platform text not null check (platform in ('x', 'linkedin', 'youtube', 'instagram', 'facebook')),
  account_id uuid references connected_accounts(id) on delete set null,
  content_profile_id uuid references content_profiles(id) on delete set null,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed')),
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
-- scheduled_posts — a generated post queued for a connected account at a
-- future time. A cron-triggered worker (see /api/cron/publish-scheduled)
-- publishes these when due; nothing in this codebase runs that on a timer
-- yet, it needs to be wired to Vercel Cron, Supabase Cron, or similar.
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
create index scheduled_posts_pending_idx on scheduled_posts(status) where status = 'pending';

create trigger scheduled_posts_set_updated_at
  before update on scheduled_posts
  for each row execute function set_updated_at();

alter table scheduled_posts enable row level security;

-- =========================================================================
-- published_posts — proof of what actually went out: the platform's own id
-- and URL for a generated post that was published, immediately or via the
-- scheduler.
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
-- analytics — point-in-time snapshots pulled from platforms that expose
-- post-level performance.
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
-- backlinks — the tracked link handed to a generated post, so clicks are
-- attributable back to the specific post and platform that drove them.
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
