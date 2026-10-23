-- =====================================================================
-- Migration 41 — Winner / election-result flags on candidates
--
-- Andreas's direction, 2026-10-23: when results come in, a winning
-- candidate gets a checkmark badge beside their name everywhere it
-- renders — GREEN "Elected" once the result is OFFICIAL/certified,
-- AMBER "Elected — unofficial result" while it is still UNOFFICIAL.
-- Applies to ALL races (Ontario municipal + BC provincial), whether or
-- not the race has deep-dive positions. PREPARE ONLY — Andreas runs
-- this in the Supabase SQL Editor after reviewing.
--
-- WHAT CHANGES
-- 1. Three new columns on candidates:
--      is_winner        boolean, default false
--      result_status    'unofficial' | 'official' (null until a result
--                       is recorded; meaningful only when is_winner)
--      result_source    text — where the result came from (e.g.
--                       "Elections BC results, 2026-10-24" or a Town of
--                       Huntsville results URL). Recorded for every
--                       winner so the checkmark is checkable, same
--                       evidence standard as positions.
-- 2. public_candidates view gains the three columns (appended LAST —
--    Postgres rejects dropping/reordering view columns, 42P16; see
--    migration 37's note).
--
-- No rows are flagged by this migration. Winners are set by separate
-- reviewed updates/imports once results are published, exactly like
-- positions: nothing reaches the public site without Andreas.
--
-- GRACEFUL: the app (feature/winner-checkmarks) treats the new fields
-- as optional — before this runs, queries return rows without them and
-- no badge renders anywhere. Running this changes nothing visually
-- until a winner is actually flagged.
-- =====================================================================

begin;

alter table candidates
  add column if not exists is_winner boolean not null default false;

alter table candidates
  add column if not exists result_status text
  check (result_status in ('unofficial', 'official'));

alter table candidates
  add column if not exists result_source text;

-- A result status with no win is a data error; keep the pair consistent.
alter table candidates
  drop constraint if exists candidates_result_status_requires_winner;
alter table candidates
  add constraint candidates_result_status_requires_winner
  check (is_winner or result_status is null);

comment on column candidates.is_winner is
  'True when this candidate won their race (see result_status / result_source). Drives the Elected checkmark badge.';
comment on column candidates.result_status is
  '''unofficial'' = winner declared on preliminary/unofficial results; ''official'' = certified/final result. Null unless is_winner.';
comment on column candidates.result_source is
  'Where the recorded result came from (election authority name and/or results URL). Required by convention for every flagged winner.';

-- Public view: same column list as migration 37, new columns appended last.
create or replace view public_candidates as
select c.id, c.race_id, c.name, c.slug, c.status, c.website, c.socials,
       c.photo_url, c.bio, c.incumbent, c.last_reviewed_at,
       r.slug as race_slug, r.name as race_name, r.race_type, r.seats,
       m.slug as municipality_slug,
       c.verified_links,
       c.contacted_at,
       c.responded_at,
       c.is_winner,
       c.result_status,
       c.result_source
from   candidates c
join   races r          on r.id = c.race_id
join   municipalities m on m.id = r.municipality_id;

commit;

-- VERIFICATION (run after commit)
select 'columns present (expect 3)' as check_name, count(*) as n
from information_schema.columns
where table_name = 'candidates'
  and column_name in ('is_winner', 'result_status', 'result_source');

select 'winners flagged (expect 0 until results are loaded)' as check_name,
       count(*) as n
from candidates where is_winner;
