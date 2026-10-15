-- The 7-day free trial on every paid plan. One per account: trial_used stays true after it has been taken.
-- trial_ends_at is set while a trial runs; when it passes, the Edge Function moves the account back to free.

alter table public.users
  add column trial_ends_at timestamptz,
  add column trial_used boolean not null default false;
