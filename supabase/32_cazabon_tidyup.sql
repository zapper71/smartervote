-- =====================================================================
-- SmarterVote.ca — Bruce Cazabon entry tidy-up (migration 32,
-- Andreas's request, 2026-10-17).
--
-- Cazabon is the acclaimed CSPNE (French public) trustee; the same
-- board-wide acclamation appears on 18 municipal ballots in the
-- expansion seed (plus his original Huntsville row). Audit of all 18
-- expansion rows found two glitch classes:
--   * STATUS: Joly and Magnetawan mark him 'certified', but he is the
--     SOLE candidate in both races (verified against the staged lists)
--     and 'acclaimed' in the other 16 — set both to 'acclaimed'.
--   * NAME FORMAT: five rows carry clerk-list formats — 'CAZABON,
--     Bruce' (Mattawa, Nipissing, East Ferris) and 'Cazabon, Bruce'
--     (Kearney, Powassan) — with reversed slugs (…-cazabon-bruce).
--     Normalize name to 'Bruce Cazabon' and slug to …-bruce-cazabon.
-- He has no positions or website on any row, so nothing else moves.
-- Idempotent: re-running after a successful run changes nothing.
-- =====================================================================

begin;

-- 1. Status: sole candidate in the race -> acclaimed.
update candidates
set status = 'acclaimed', last_reviewed_at = now()
where (slug, race_id) in (
    ('joly-bruce-cazabon',
     (select id from races where slug = 'joly-conseil-scolaire-public-du-nord-est-de-l-ontario')),
    ('magnetawan-bruce-cazabon',
     (select id from races where slug = 'magnetawan-trustee-conseil-scolaire-public-du-nordest-de-l-ontario'))
);

-- 2. Name + slug normalization for the five reversed-format rows.
update candidates c
set name = 'Bruce Cazabon',
    slug = replace(c.slug, '-cazabon-bruce', '-bruce-cazabon'),
    last_reviewed_at = now()
where (c.slug, c.race_id) in (
    ('mattawa-cazabon-bruce',
     (select id from races where slug = 'mattawa-trustees-conseil-scolaire-public-de-nord-east-de-l-ontario-fp')),
    ('nipissing-cazabon-bruce',
     (select id from races where slug = 'nipissing-conseil-scolaire-public-du-nord-est')),
    ('east-ferris-cazabon-bruce',
     (select id from races where slug = 'east-ferris-trustee-conseil-scolaire-public-du-nord-est-de-l-ontario')),
    ('kearney-cazabon-bruce',
     (select id from races where slug = 'kearney-french-public-conseil-scolaire-public-du-nord-est-de-l-ontario')),
    ('powassan-cazabon-bruce',
     (select id from races where slug = 'powassan-trustee-cspne-french-public'))
);

commit;

-- ---------------------------------------------------------------------
-- VERIFY — expect 19 rows (18 expansion + Huntsville's original):
-- every one named 'Bruce Cazabon', status 'acclaimed', and every slug
-- ending in 'bruce-cazabon'.
-- ---------------------------------------------------------------------
select slug, name, status
from candidates
where slug like '%cazabon%'
order by slug;
