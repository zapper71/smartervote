-- ---------------------------------------------------------------------
-- Migration 30: allow multiple distinct position rows from one source page.
--
-- WHY — Andreas's decision (2026-10-17): "I want all duplicate position rows
-- to import." The "duplicates" are NOT exact duplicates — verified zero
-- exact-duplicate rows exist. They are distinct statements that happen to
-- share (candidate, issue, source_url): e.g. several answers from one
-- questionnaire page (Build Canada), or several bullet points from one
-- candidate platform page. Each statement is its own position and must
-- import as its own row.
--
-- The hard case: Olivia Chow / environment / one survey page — 5 rows,
-- same source, same verbatim quote "YES", differing only in summary_short
-- (different survey questions). So the new uniqueness must include BOTH
-- verbatim_quote and summary_short.
--
-- SAFETY — this index is strictly LESS restrictive than the old
-- (candidate_id, issue_id, source_url) index from migration 06: it adds
-- two more columns. Existing data cannot violate the new index, because
-- rows unique under the old index are trivially unique under the superset.
-- The md5() hashes keep the index within Postgres size limits for long
-- quotes; hash collisions are not a real-world concern at this scale.
--
-- RUN BEFORE the Phase 2 /admin/import pastes, and keep in sync with the
-- importer dedupe in app/admin/actions.ts (dedupeKey), which mirrors this
-- index: only a true re-import of the same statement (same quote AND
-- same summary) is skipped as a no-op.
-- ---------------------------------------------------------------------
begin;

drop index if exists positions_candidate_issue_source_uniq;

create unique index if not exists positions_multi_statement_uniq
    on positions (candidate_id,
                  issue_id,
                  coalesce(source_url, ''),
                  md5(coalesce(verbatim_quote, '')),
                  md5(coalesce(summary_short, '')));

commit;

-- ---------------------------------------------------------------------
-- VERIFY
-- Expect: the old index gone, the new index present.
-- ---------------------------------------------------------------------
select 'old index positions_candidate_issue_source_uniq removed' as "Check",
       case when not exists (
         select 1 from pg_indexes
         where schemaname = 'public'
           and indexname = 'positions_candidate_issue_source_uniq'
       ) then 'PASS' else 'FAIL' end as "Result"
union all
select 'new index positions_multi_statement_uniq present',
       case when exists (
         select 1 from pg_indexes
         where schemaname = 'public'
           and indexname = 'positions_multi_statement_uniq'
       ) then 'PASS' else 'FAIL' end as "Result";
