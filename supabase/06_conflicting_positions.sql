-- =====================================================================
-- SmarterVote.ca — support for conflicting positions
--
-- WHY THIS EXISTS
-- Candidates sometimes say different things about the same issue in
-- different places, or change their mind mid-campaign. Picking one
-- statement and discarding the other would be an editorial judgment
-- about which one "really" counts — exactly the kind of judgment this
-- site promises not to make.
--
-- So: show both, each with its own quote, source and date, and flag the
-- pair so a reader knows it isn't a mistake on our part.
--
-- WHAT THIS CHANGES
-- 1. Drops the UNIQUE (candidate_id, issue_id) constraint, which
--    previously allowed only one position per candidate per issue.
-- 2. Adds is_conflicting, set on EVERY row in a conflicting set.
-- 3. Adds a uniqueness rule that still prevents accidental duplicates:
--    you can't have two rows for the same candidate+issue+source_url.
--
-- Run AFTER 05_positions.sql. Safe to re-run.
-- =====================================================================

begin;

-- 1. One position per candidate per issue is no longer the rule.
alter table positions
    drop constraint if exists positions_candidate_id_issue_id_key;

-- 2. The flag. Set true on BOTH (or all) rows of a conflicting set, so
--    the pill renders whichever row you happen to be looking at.
alter table positions
    add column if not exists is_conflicting boolean not null default false;

comment on column positions.is_conflicting is
    'True on every row of a set where the candidate has said materially different things on the same issue. Both statements are shown; the site does not choose between them.';

-- 3. Still prevent genuine duplicates: the same claim, from the same
--    page, entered twice. Two positions on one issue are allowed only
--    when they come from different sources.
create unique index if not exists positions_candidate_issue_source_uniq
    on positions (candidate_id, issue_id, coalesce(source_url, ''));

-- 4. The public view needs to carry the flag through.
--
-- NOTE: is_conflicting is APPENDED at the end, not slotted in next to
-- no_public_position where it logically belongs. CREATE OR REPLACE VIEW can
-- only add columns to the END of a view — try to insert one in the middle
-- and Postgres reports it as an attempt to RENAME an existing column:
--     cannot change name of view column "reviewed_at" to "is_conflicting"
-- Dropping and recreating the view would allow any order, but would also
-- drop its grants, so appending is the safer trade. Column order doesn't
-- matter to the app: supabase-js returns objects keyed by name.
create or replace view public_positions as
select p.id, p.candidate_id, p.issue_id,
       p.summary_short, p.summary_bullets,
       p.verbatim_quote, p.source_url, p.source_title, p.source_type, p.source_date,
       p.no_public_position, p.reviewed_at,
       i.name as issue_name, i.slug as issue_slug, i.sort_order as issue_sort,
       p.is_conflicting
from   positions p
join   issues i on i.id = p.issue_id
where  p.status = 'published';

commit;

-- ---------------------------------------------------------------------
-- VERIFY — single query.
-- Expect: the old unique constraint gone, is_conflicting present,
-- and no candidate+issue pair with more than one row yet.
-- ---------------------------------------------------------------------
select 'is_conflicting column exists' as "Check",
       case when exists (
         select 1 from information_schema.columns
         where table_name = 'positions' and column_name = 'is_conflicting'
       ) then 'PASS' else 'FAIL' end as "Result"
union all
select 'old unique constraint removed',
       case when not exists (
         select 1 from information_schema.table_constraints
         where table_name = 'positions'
           and constraint_name = 'positions_candidate_id_issue_id_key'
       ) then 'PASS' else 'FAIL' end
union all
select 'positions still published',
       count(*)::text || ' published' from positions where status = 'published'
union all
select 'conflicting sets so far',
       coalesce((
         select count(*)::text from (
           select candidate_id, issue_id
           from positions
           where status = 'published'
           group by candidate_id, issue_id
           having count(*) > 1
         ) x
       ), '0') || ' issue(s) with more than one position';
