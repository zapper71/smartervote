-- =====================================================================
-- Migration 37 — Withdrawn candidates stay visible (grey pill + strike)
--
-- Andreas's direction, 2026-10-18: withdrawn candidates remain on the printed
-- ballot, so the site must SHOW them — struck through with a grey
-- "Withdrawn" pill — instead of silently dropping them. PREPARE ONLY —
-- Andreas runs this in the Supabase SQL Editor after reviewing.
--
-- WHAT CHANGES
-- 1. Six BC candidates get status = 'withdrawn' (verified against the
--    Election BC final candidate list / 1bc.ca; all withdrew after
--    nomination but stay on the printed ballot).
-- 2. public_candidates and the candidates_public_read RLS policy stop
--    filtering withdrawn candidates out — the app renders them with the
--    Withdrawn pill and strikethrough instead (feat/withdrawn-candidate-display).
-- 3. The app's queries no longer exclude withdrawn candidates either; see
--    lib/queries.ts.
--
-- GRACEFUL: before this runs, no rows carry status='withdrawn', so the
-- already-deployed code renders exactly as today. Running this is what flips
-- the six candidates into their withdrawn display.
-- =====================================================================

begin;

-- (1) Flag the six withdrawn BC candidates.
update candidates
set    status = 'withdrawn'
where  slug in (
         'british-columbia-greg-depaco',        -- Greg DePaco,      Green Party (withdrawn Oct 9)
         'british-columbia-gerry-lenoski',      -- Gerry Lenoski,    BC NDP (removed Oct 14)
         'british-columbia-joachim-agou',       -- Joachim Agou,     Conservative Party (withdrawn Oct 8)
         'british-columbia-jordan-zheng-mcintosh', -- Jordan Zheng McIntosh, Conservative Party (withdrawn Oct 15)
         'british-columbia-timothy-webster',    -- Timothy Webster,  Unaffiliated (withdrawn)
         'british-columbia-robert-evans'        -- Robert Evans,     Independent (Richmond-Steveston)
       )
and    status = 'certified';

-- (2) Public views / RLS: withdrawn candidates are visible now.
create or replace view public_candidates as
select c.id, c.race_id, c.name, c.slug, c.status, c.website, c.socials,
       c.photo_url, c.bio, c.incumbent, c.last_reviewed_at,
       r.slug as race_slug, r.name as race_name, r.race_type, r.seats,
       m.slug as municipality_slug
from   candidates c
join   races r          on r.id = c.race_id
join   municipalities m on m.id = r.municipality_id;
-- NOTE: the `where c.status <> 'withdrawn'` clause from 01_schema.sql is
-- intentionally gone. Withdrawn candidates render with the Withdrawn pill.

drop policy if exists candidates_public_read on candidates;
create policy candidates_public_read on candidates
    for select to anon, authenticated
    using (true);

comment on table candidates is
'Certified candidates. Withdrawn candidates are retained AND shown on the public site with a grey Withdrawn pill and struck-through name/positions — they remain on the printed ballot.';

commit;

-- VERIFICATION (run after commit)
select 'withdrawn rows (expect 6)' as check_name, count(*) as n
from candidates where status = 'withdrawn';

select name, slug, status
from candidates
where slug in (
  'british-columbia-greg-depaco',
  'british-columbia-gerry-lenoski',
  'british-columbia-joachim-agou',
  'british-columbia-jordan-zheng-mcintosh',
  'british-columbia-timothy-webster',
  'british-columbia-robert-evans'
)
order by name;
