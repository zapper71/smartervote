-- =====================================================================
-- SmarterVote.ca — expansion schema changes (Ontario 265 + BC 93)
--
-- (a) candidates.party — party affiliation, used for BC provincial
--     districts where Elections BC publishes the affiliation on the
--     certified list. NULL for Ontario municipal races (non-partisan).
-- (b) widen the races.race_type check to admit 'provincial_district'
--     for BC's 93 electoral districts.
--
-- Run BEFORE 25/26/27. Idempotent: safe to re-run.
-- Does not touch any existing rows.
-- =====================================================================

begin;

alter table candidates add column if not exists party text;

comment on column candidates.party is
'Party affiliation as published by the election authority (Elections BC labels, verbatim). NULL for non-partisan Ontario municipal races.';

-- The check was declared inline in 01_schema.sql, so Postgres named it
-- races_race_type_check. Drop-then-add keeps this re-runnable.
alter table races drop constraint if exists races_race_type_check;

alter table races
    add constraint races_race_type_check
    check (race_type in ('mayor','council_at_large','council_ward','school_board','provincial_district'));

commit;

-- VERIFY (runs after commit; the SQL editor shows only this result)
select 'candidates.party exists' as check_name,
       count(*) > 0 as ok
from information_schema.columns
where table_name = 'candidates' and column_name = 'party'
union all
select 'races_race_type_check admits provincial_district',
       pg_get_constraintdef(oid) like '%provincial_district%'
from pg_constraint
where conname = 'races_race_type_check';
