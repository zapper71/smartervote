-- =============================================================
-- 45 — Anonymous outbound-link click counter (tech-debt #1)
--
-- One aggregate count per destination type, across all candidates:
-- source links, candidate website, Facebook, Instagram, YouTube,
-- LinkedIn, TikTok, email, plus "other" for any verified-link platform
-- outside that list (e.g. X) so no click goes uncounted.
--
-- Follows the page_views pattern (supabase/21_page_view_counter.sql)
-- exactly: hourly buckets, counts only, nothing identifying. This
-- table is MORE aggregate than page_views by design — it stores no
-- path, no race slug, no candidate slug, because the item asks for
-- one count per destination type across all candidates.
--
-- What it can never store: there is no parameter for an IP, user
-- agent, cookie, or session id, and the /api/track-click route never
-- reads request headers — so an identifier cannot be smuggled in
-- even by a modified client.
--
-- Numbering note: 42 and 43 belong to the unmerged
-- candidate-input-page branch and 44 to the unmerged SK seeding
-- draft, so this file takes 45 to avoid a numbering collision when
-- those branches land. Numbers are run by hand in the SQL editor,
-- so a gap here is harmless and a duplicate would not be.
--
-- Idempotent: safe to re-run.
-- =============================================================

create table if not exists link_clicks (
  destination_type text not null,
  clicked_hour timestamptz not null,
  click_count integer not null default 1,
  primary key (destination_type, clicked_hour)
);

create or replace function increment_link_click(
  p_destination_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hour timestamptz := date_trunc('hour', now());
begin
  -- Unknown types are ignored, never stored: the allowlist lives here
  -- as well as in the route, so a bad value cannot create a row.
  if p_destination_type not in (
    'source', 'website', 'facebook', 'instagram', 'youtube',
    'linkedin', 'tiktok', 'email', 'other'
  ) then
    return;
  end if;

  insert into link_clicks (destination_type, clicked_hour, click_count)
  values (p_destination_type, v_hour, 1)
  on conflict (destination_type, clicked_hour)
  do update set click_count = link_clicks.click_count + 1;
end;
$$;

-- Only the service role (used server-side by /api/track-click) may call it.
-- There is no public/anon execute grant and no RLS policy for writes.
revoke all on function increment_link_click(text) from public, anon, authenticated;
grant execute on function increment_link_click(text) to service_role;

-- Reading the counts (run by hand, no app display yet):
--   select destination_type, sum(click_count) as clicks
--   from link_clicks group by destination_type order by clicks desc;
