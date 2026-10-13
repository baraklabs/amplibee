-- Scheduled jobs. Requires the pg_cron and pg_net extensions (enable them in the Supabase dashboard
-- under Database > Extensions, or let this migration do it on a project that allows it).
--
-- Before the Tranco job can run, store two secrets once (see README):
--   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1/maintenance', 'maintenance_url');
--   select vault.create_secret('<same value as the CRON_SECRET function secret>', 'cron_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Weekly cache purge, Sundays 03:15 UTC: scan cache older than 7 days, old rate limit rows, jobs older than 30 days.
select cron.schedule(
  'amplibee-weekly-purge',
  '15 3 * * 0',
  $$
    delete from public.results where kind like 'scan:%' and created_at < now() - interval '7 days';
    delete from public.rate_limits where window_date < current_date - 2;
    delete from public.checks where created_at < now() - interval '30 days';
  $$
);

-- Monthly Tranco refresh, the 2nd of each month at 04:00 UTC. The function does the download and import.
select cron.schedule(
  'amplibee-monthly-tranco',
  '0 4 2 * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'maintenance_url'),
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{"job":"tranco"}'::jsonb,
      timeout_milliseconds := 120000
    );
  $$
);
