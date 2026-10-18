-- =====================================================================
-- Migration 35 — Expansion trustee issues: set applies_to = 'school_board'
--
-- Andreas's direction, 2026-10-18: side-discovery flagged during the
-- Huntsville slug work. PREPARE ONLY — Andreas runs this in the Supabase
-- SQL Editor after reviewing. Nothing here runs or publishes by itself.
--
-- THE BUG
-- Migration 28 seeded the same 18-issue taxonomy for each of the 18
-- in-depth expansion municipalities with:
--     insert into issues (municipality_id, name, slug, voter_question,
--                         description, sort_order)
-- The insert does NOT set applies_to. Migration 16 defined
-- issues.applies_to as `text not null default 'municipal'` (check
-- constraint: 'municipal' / 'school_board'). So the two school-board
-- issues seeded for every expansion municipality — trustee-role and
-- student-wellbeing — are tagged 'municipal' in the live database.
--
-- Migration 28's own header says trustee-role and student-wellbeing
-- "are for school board races only" — the intent was school_board;
-- the column was simply forgotten in the INSERT column list.
--
-- CONSEQUENCE (verified live 2026-10-18)
-- lib/queries.ts getIssues(raceType, municipalityId) filters
-- .eq("applies_to", raceType === "school_board" ? "school_board" : "municipal").
-- A school-board compare in ANY expansion municipality gets ZERO issues,
-- and the compare page renders UnavailableNotice ("This comparison isn't
-- available right now") when issues.length === 0.
--   * Huntsville control (trustee issues correctly tagged 'school_board'
--     by migration 16): /races/trustee-monavenir/compare renders the full
--     compare with "What a trustee actually does" and
--     "Student wellbeing and learning" columns. CORRECT.
--   * /races/bracebridge-school-board-trustee-monavenir-simcoe-muskoka/compare
--     → error page, even though 2 published Donald Blais position rows
--     (trustee-role + student-wellbeing, Phase 2) exist for it. INVISIBLE.
--   * /races/wilmot-waterloo-region-district-school-board-trustee/compare
--     → error page (no positions yet; should render the two empty trustee
--     issue columns like other empty expansion compares). WRONG EMPTY STATE.
-- Blast radius: every school-board race in all 18 expansion municipalities
-- (36 trustee issue rows, all wrongly tagged); 10 published trustee rows
-- currently invisible to voters — 4 in Bracebridge (2 Blais / MonAvenir,
-- 2 TLDSB: Inkster + Struthers), 2 each in Georgian Bay, Lake of Bays
-- and Muskoka Lakes (all Blais / MonAvenir), all from the published
-- Phase 2 import files.
--
-- WHAT THIS MIGRATION DOES
-- Sets applies_to = 'school_board' on trustee-role and student-wellbeing
-- in every non-Huntsville municipality that currently has them tagged
-- otherwise. Huntsville's own rows (correctly 'school_board' since
-- migration 16) are excluded and verified untouched. No names, orders,
-- or position rows change; municipal compares are unaffected.
-- IDEMPOTENT: only rows not already 'school_board' are updated.
-- Wrapped in begin/commit like the other migrations.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Pre-flight: what are we about to fix? Expect 36 rows (2 per each of
-- the 18 expansion municipalities). If the count is not 36, STOP and
-- look at the detail rows before continuing.
-- ---------------------------------------------------------------------
select count(*) as trustee_issues_wrongly_tagged
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug <> 'huntsville'
  and i.slug in ('trustee-role', 'student-wellbeing')
  and i.applies_to <> 'school_board';

select m.slug as municipality, i.slug, i.name, i.applies_to
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug <> 'huntsville'
  and i.slug in ('trustee-role', 'student-wellbeing')
  and i.applies_to <> 'school_board'
order by m.slug, i.slug;

-- Huntsville's rows must already be 'school_board' (migration 16).
-- If either is not, something unexpected happened — stop and check.
do $$
declare n int;
begin
    select count(*) into n
    from issues i
    join municipalities m on m.id = i.municipality_id
    where m.slug = 'huntsville'
      and i.slug in ('trustee-role', 'student-wellbeing')
      and i.applies_to <> 'school_board';
    if n > 0 then
        raise exception 'migration 35 guard: % Huntsville trustee issue row(s) are not school_board — investigate before running', n;
    end if;
end $$;

-- ---------------------------------------------------------------------
-- The fix: tag the two trustee issues 'school_board' everywhere except
-- Huntsville. Idempotent — re-running is a no-op.
-- ---------------------------------------------------------------------
update issues i
set applies_to = 'school_board'
from municipalities m
where m.id = i.municipality_id
  and m.slug <> 'huntsville'
  and i.slug in ('trustee-role', 'student-wellbeing')
  and i.applies_to <> 'school_board';

commit;

-- ---------------------------------------------------------------------
-- Post-checks. Expect: 36 rows now 'school_board'; Huntsville unchanged
-- (2 school_board); every affected municipality at 16 municipal + 2
-- school_board; zero trustee issues left tagged 'municipal' anywhere.
-- ---------------------------------------------------------------------
select count(*) as trustee_issues_now_school_board
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug <> 'huntsville'
  and i.slug in ('trustee-role', 'student-wellbeing')
  and i.applies_to = 'school_board';

select count(*) as trustee_issues_still_municipal
from issues
where slug in ('trustee-role', 'student-wellbeing')
  and applies_to = 'municipal';
-- expect 0: no trustee issue anywhere is still tagged 'municipal'

select count(*) as huntsville_school_board_issues
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug = 'huntsville'
  and i.applies_to = 'school_board';
-- expect 2 (migration 16's three school-board issues, less the one folded
-- into student-wellbeing by migration 29) — unchanged by this migration

select m.slug as municipality,
       count(*) filter (where i.applies_to = 'municipal')   as municipal_issues,
       count(*) filter (where i.applies_to = 'school_board') as school_board_issues
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug <> 'huntsville'
  and m.id in (select municipality_id from issues
               where slug = 'trustee-role')
group by m.slug
order by m.slug;
-- expect every row: 16 municipal / 2 school_board
-- (the five Huntsville seed issues from migration 34 are Huntsville-only
-- and do not appear here)

-- positions untouched: no position references issue rows by anything
-- except issue_id, and no issue rows were renamed, merged or deleted.
select count(*) as orphaned_positions
from positions p
left join issues i on i.id = p.issue_id
where i.id is null;
-- expect 0

-- ---------------------------------------------------------------------
-- Rollback (commented — only if you need to undo):
-- BEGIN;
-- update issues i
-- set applies_to = 'municipal'
-- from municipalities m
-- where m.id = i.municipality_id
--   and m.slug <> 'huntsville'
--   and i.slug in ('trustee-role', 'student-wellbeing')
--   and i.applies_to = 'school_board';
-- COMMIT;
-- ---------------------------------------------------------------------
