-- =============================================================
-- 21 — Anonymous page-view counter function
--
-- The page_views table (01_schema.sql) was designed for anonymous
-- aggregate counts but nothing ever wrote to it. This is the only
-- writer: a single function the /api/track route calls.
--
-- What it stores per call: path, hour, count (+ race/candidate
-- slugs parsed from the path). What it can never store: there is
-- no parameter for an IP, user agent, cookie, or session id, and
-- the route never reads request headers — so an identifier cannot
-- be smuggled in even by a modified client.
--
-- Idempotent: safe to re-run.
-- =============================================================

create or replace function increment_page_view(
  p_path text,
  p_race_slug text,
  p_candidate_slug text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hour timestamptz := date_trunc('hour', now());
begin
  insert into page_views (path, race_slug, candidate_slug, viewed_hour, view_count)
  values (p_path, p_race_slug, p_candidate_slug, v_hour, 1)
  on conflict (path, viewed_hour)
  do update set view_count = page_views.view_count + 1;
end;
$$;

-- Only the service role (used server-side by /api/track) may call it.
-- There is no public/anon execute grant and no RLS policy for writes.
revoke all on function increment_page_view(text, text, text) from public, anon, authenticated;
grant execute on function increment_page_view(text, text, text) to service_role;
