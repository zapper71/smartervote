-- =====================================================================
-- Migration 49 -- widen races.race_type to admit 'federal_riding'
--
-- PREPARE ONLY -- Andreas runs this in the Supabase SQL Editor
-- after reviewing. Nothing here runs or publishes by itself.
-- Run BEFORE 50 (the federal byelections seed, which uses the new
-- race type). Idempotent: drop-then-add keeps this re-runnable;
-- does not touch any existing rows.
--
-- Precedent: migration 24 did exactly this to admit
-- 'provincial_district' for BC. The check list below is the
-- migration-24 list plus 'federal_riding'.
-- =====================================================================

begin;

alter table races drop constraint if exists races_race_type_check;

alter table races
    add constraint races_race_type_check
    check (race_type in ('mayor','council_at_large','council_ward','school_board','provincial_district','federal_riding'));

commit;

-- VERIFY (runs after commit; the SQL editor shows only this result)
select 'races_race_type_check admits federal_riding' as check_name,
       pg_get_constraintdef(oid) like '%federal_riding%' as ok
from pg_constraint
where conname = 'races_race_type_check';
