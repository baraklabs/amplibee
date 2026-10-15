-- The plan an account is on. Billing is confirmed by email for now, so this is set by hand; everyone starts on free.

alter table public.users
  add column plan text not null default 'free'
  check (plan in ('free', 'starter', 'plus', 'growth', 'scale', 'authority'));
