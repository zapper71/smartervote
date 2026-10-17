-- =====================================================================
-- SmarterVote.ca — Huntsville issue-slug rename to the final 18-slug taxonomy
--
-- DRAFT, committed 2026-10-17, updated same day with Andreas's district-table
-- decision. Andreas to run in its launch slot (after the Phase 2 compares,
-- before the Phase 3 wave cities); nothing here runs or publishes by itself.
--
-- WHAT THIS DOES
-- Huntsville's issue rows were created with the old taxonomy (migrations
-- 04_issues.sql, 09_two_more_issues.sql, 16_social_and_school_board.sql).
-- The rest of the site now uses the final taxonomy (migration 28). This
-- migration brings Huntsville in line, scoped to Huntsville only:
--   * four pure renames (below), and
--   * one FOLD: district-table -> government (Andreas's decision,
--     2026-10-17), because Huntsville already has a government-bound row
--     (how-council-works), and issues are unique per (municipality, slug).
-- The other ten Huntsville slugs already match the final taxonomy and are
-- untouched. After this runs, Huntsville has 14 issue rows.
--
-- KEYING (verified against 01_schema.sql)
-- issues is MUNICIPALITY-scoped: unique (municipality_id, slug). Huntsville
-- holds ONE row per slug, and positions reference issues by issue_id.
-- positions are unique per (candidate_id, issue_id, coalesce(source_url,'')).
-- The 15 Huntsville slugs before this migration: taxes-and-spending,
-- roads-and-infrastructure, how-council-works, growth-and-development,
-- housing, healthcare-and-hospital, environment, district-table,
-- economy-and-downtown, parks-and-trails, emergency-services, transit,
-- school-services, trustee-role, student-wellbeing.
--
-- RENAMES (old -> new, plus display label from migration 28)
--   how-council-works       -> government            'Government'
--   healthcare-and-hospital -> healthcare            'Healthcare'
--   economy-and-downtown    -> economy               'Economy'
--   parks-and-trails        -> active-transportation 'Active transportation'
-- Only slug and name change. voter_question, description and sort_order keep
-- Huntsville's own wording/order.
--
-- THE district-table FOLD (step 2)
-- district-table ("Huntsville's place at the District table" — two-tier
-- Town/District governance) folds into the renamed government row:
--   2a. district-table positions whose candidate has no government row from
--       the same source are simply re-pointed to the government issue.
--   2b. Where the candidate already has a government row from the SAME
--       source (e.g. Caswell, Sabbagh — both facets came from one page), the
--       district row is merged into it: bullets unioned (government first,
--       no duplicates), the district quote appended to the quote if new,
--       headline kept from the government row. The district row is then
--       deleted. Statuses must match for a merge — if any colliding pair
--       has different statuses, this migration ABORTS with a message
--       rather than publishing or hiding anything silently.
--   2c. Once no positions point at district-table, its issue row is
--       deleted (guarded — the delete only happens at zero positions,
--       because positions.issue_id cascades on issue delete).
--
-- STILL UNMAPPED — left untouched, needs Andreas's decision:
--   school-services  Huntsville trustee issue (programs, busing, before/
--                    after-school care). The final taxonomy has trustee-role
--                    and student-wellbeing but nothing covering "services".
--                    Renaming this to either would mislabel published rows,
--                    so it is left alone deliberately.
--
-- IDEMPOTENT: renames match OLD slugs, the fold matches the district-table
-- slug; re-running after a successful run is a no-op.
-- Wrapped in begin/commit like the other migrations.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Step 1 — pure renames (how-council-works -> government creates the
-- fold target for step 2).
-- ---------------------------------------------------------------------
with m as (select id from municipalities where slug = 'huntsville')
update issues i set
    slug = v.new_slug,
    name = v.new_name
from (values
    ('how-council-works',      'government',            'Government'),
    ('healthcare-and-hospital','healthcare',            'Healthcare'),
    ('economy-and-downtown',   'economy',               'Economy'),
    ('parks-and-trails',       'active-transportation', 'Active transportation')
) as v(old_slug, new_slug, new_name)
where i.municipality_id = m.id
  and i.slug = v.old_slug;

-- ---------------------------------------------------------------------
-- Step 2 — fold district-table into government.
-- ---------------------------------------------------------------------

-- Guard: refuse to merge a district row into a government row whose
-- status differs (never silently publish or hide a position).
do $$
declare n int;
begin
    select count(*) into n
    from positions d
    join issues di on di.id = d.issue_id and di.slug = 'district-table'
    join municipalities m on m.id = di.municipality_id and m.slug = 'huntsville'
    join issues gi on gi.municipality_id = m.id and gi.slug = 'government'
    join positions g on g.candidate_id = d.candidate_id
                    and g.issue_id = gi.id
                    and coalesce(g.source_url, '') = coalesce(d.source_url, '')
    where d.status <> g.status;
    if n > 0 then
        raise exception 'district-table fold: % colliding position(s) have a different status under government — resolve manually in /admin before running migration 29', n;
    end if;
end $$;

-- 2a. Re-point district positions with no same-source government row.
with m as (select id from municipalities where slug = 'huntsville'),
     gov as (select i.id from issues i, m where i.municipality_id = m.id and i.slug = 'government'),
     dist as (select i.id from issues i, m where i.municipality_id = m.id and i.slug = 'district-table')
update positions p set issue_id = (select id from gov)
from dist
where p.issue_id = dist.id
  and not exists (
      select 1 from positions g
      where g.candidate_id = p.candidate_id
        and g.issue_id = (select id from gov)
        and coalesce(g.source_url, '') = coalesce(p.source_url, '')
  );

-- 2b. Merge the remaining district positions (same candidate, same
-- source already under government) into the government row.
with m as (select id from municipalities where slug = 'huntsville'),
     gov as (select i.id from issues i, m where i.municipality_id = m.id and i.slug = 'government'),
     dist as (select i.id from issues i, m where i.municipality_id = m.id and i.slug = 'district-table')
update positions g set
    summary_bullets = coalesce((
        select jsonb_agg(val order by first_ord)
        from (
            select val, min(ord) as first_ord
            from (
                select elem as val, ord
                from jsonb_array_elements(coalesce(g.summary_bullets, '[]'::jsonb)) with ordinality as t(elem, ord)
                union all
                select elem, 10000 + ord
                from jsonb_array_elements(coalesce(d.summary_bullets, '[]'::jsonb)) with ordinality as t(elem, ord)
            ) u
            group by val
        ) s
    ), g.summary_bullets),
    verbatim_quote = case
        when d.verbatim_quote is null then g.verbatim_quote
        when g.verbatim_quote is null then d.verbatim_quote
        when position(d.verbatim_quote in g.verbatim_quote) > 0 then g.verbatim_quote
        else g.verbatim_quote || E'\n' || d.verbatim_quote
    end,
    summary_short = coalesce(g.summary_short, d.summary_short),
    updated_at = now()
from positions d, gov, dist
where d.issue_id = dist.id
  and g.candidate_id = d.candidate_id
  and g.issue_id = gov.id
  and coalesce(g.source_url, '') = coalesce(d.source_url, '');

-- 2c. Delete the merged district rows, then the district issue row —
-- only once nothing points at it (positions cascade on issue delete).
with m as (select id from municipalities where slug = 'huntsville'),
     gov as (select i.id from issues i, m where i.municipality_id = m.id and i.slug = 'government'),
     dist as (select i.id from issues i, m where i.municipality_id = m.id and i.slug = 'district-table')
delete from positions p
using dist
where p.issue_id = dist.id
  and exists (
      select 1 from positions g
      where g.candidate_id = p.candidate_id
        and g.issue_id = (select id from gov)
        and coalesce(g.source_url, '') = coalesce(p.source_url, '')
  );

do $$
declare n int;
begin
    select count(*) into n
    from positions p
    join issues i on i.id = p.issue_id and i.slug = 'district-table'
    join municipalities m on m.id = i.municipality_id and m.slug = 'huntsville';
    if n > 0 then
        raise exception 'district-table fold: % position(s) still point at district-table — aborting before the issue row is deleted', n;
    end if;
end $$;

delete from issues i
using municipalities m
where i.municipality_id = m.id
  and m.slug = 'huntsville'
  and i.slug = 'district-table';

commit;

-- ---------------------------------------------------------------------
-- VERIFY — expect: 14 Huntsville issues; government, healthcare, economy
-- and active-transportation present; district-table GONE; school-services
-- still present (unmapped); zero orphaned positions.
-- ---------------------------------------------------------------------
select i.sort_order as "#",
       i.slug,
       i.name,
       i.applies_to
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug = 'huntsville'
order by i.sort_order;

-- expect 0 rows: every position still points at an existing issue
select count(*) as orphaned_positions
from positions p
left join issues i on i.id = p.issue_id
where i.id is null;

-- sanity: Huntsville positions now under government (both facets)
select count(*) as huntsville_government_positions
from positions p
join issues i on i.id = p.issue_id and i.slug = 'government'
join municipalities m on m.id = i.municipality_id and m.slug = 'huntsville';
