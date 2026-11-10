-- =====================================================================
-- Migration 48 -- Saskatchewan seed addendum: Prince Albert Div 4 +
-- Rosthern Div 5
--
-- PREPARE ONLY -- Andreas runs this in the Supabase SQL Editor
-- after reviewing. Nothing here runs or publishes by itself.
--
-- Approved by Andreas Nov 10, 2026 (seed both).
-- LISTINGS ONLY (Andreas, Oct 29): no deep dives, no position rows.
-- Link scour Oct 29 found 0 qualifying campaign websites/socials
-- across SK candidates, so no website/social columns are populated
-- here. The municipalities + their 13-issue RM sets already exist
-- (migrations 46/47); this file adds ONLY 2 races + 4 candidates.
--
-- Prince Albert No. 461, Councillor Division 4 (contested):
--   Richard Wilson, DJ Harris. Names + office verified from the
--   RM's own Form CC Declaration of Results, posted Nov 9, 2026,
--   9:00 PM (Wilson 57 elected, Harris 55 defeated), corroborated
--   by the RM's Nov 3 "DIVISION 4 CANDIDATES" post:
--   https://rmprincealbert.ca/index.asp?SEC=7D92208B-2835-4A10-B777-5CBC99E7127B&DE=D26EE6E6-9688-438D-BAF6-38588381AADD
--   (The same Form CC confirms Tyler Hazelwood acclaimed Div 2
--   and Richard Sayers acclaimed Div 6 -- both already seeded;
--   untouched here.)
-- Rosthern No. 403, Councillor Division 5 (contested by-election,
--   vacant seat): Ken Guedo, Patrick Hylkema. Names + office
--   verified from the RM's own elections page, Notice of Poll and
--   Notice of Advance Poll (both dated Oct 9, 2026):
--   https://www.rmofrosthern.ca/elections.html
--   Winner still missing (result declared Nov 10, 9:00 a.m. SK
--   time) -- NO winner flag is set here; the results sweep will
--   record it when published.
--
-- Race type 'council_ward' = division analogue (existing check).
-- Idempotent: ON CONFLICT DO NOTHING, existing rows untouched.
-- Municipality pages ALSO need the static index patch (branch
-- sk-seed-pa-div4-rosthern-div5) -- DB seeding alone does not
-- make the new races appear on municipality pages.
-- Numbering: 48 follows 47 (second SK batch); 45 is link-click
-- counting, 42/43 are files-only candidate-input migrations,
-- 44 is parked.
-- =====================================================================

begin;

insert into races
    (municipality_id, name, slug, race_type, seats, is_acclaimed, sort_order, ward_group_label)
select m.id, v.name, v.slug, v.race_type, v.seats, v.is_acclaimed, v.sort_order, v.ward_group_label
from municipalities m
join (values
    ('prince-albert-no-461', 'Councillor, Division 4', 'prince-albert-no-461-councillor-division-4', 'council_ward', 1, false, 4, 'Division 4'),
    ('rosthern-no-403', 'Councillor, Division 5', 'rosthern-no-403-councillor-division-5', 'council_ward', 1, false, 5, 'Division 5')
) as v(municipality_slug, name, slug, race_type, seats, is_acclaimed, sort_order, ward_group_label)
  on v.municipality_slug = m.slug
on conflict (municipality_id, slug) do nothing;

insert into candidates
    (race_id, name, slug, status, incumbent, source_url)
select r.id, v.name, v.slug, v.status, v.incumbent, v.source_url
from races r
join (values
    ('prince-albert-no-461-councillor-division-4', 'Richard Wilson', 'prince-albert-no-461-richard-wilson', 'certified', false, 'https://rmprincealbert.ca/'),
    ('prince-albert-no-461-councillor-division-4', 'DJ Harris', 'prince-albert-no-461-dj-harris', 'certified', false, 'https://rmprincealbert.ca/'),
    ('rosthern-no-403-councillor-division-5', 'Ken Guedo', 'rosthern-no-403-ken-guedo', 'certified', false, 'https://www.rmofrosthern.ca/elections.html'),
    ('rosthern-no-403-councillor-division-5', 'Patrick Hylkema', 'rosthern-no-403-patrick-hylkema', 'certified', false, 'https://www.rmofrosthern.ca/elections.html')
) as v(race_slug, name, slug, status, incumbent, source_url)
  on v.race_slug = r.slug
on conflict (race_id, slug) do nothing;

commit;

-- VERIFY
select 'sk seed addendum races' as check_name, count(*) as n from races
where slug in ('prince-albert-no-461-councillor-division-4', 'rosthern-no-403-councillor-division-5');
select 'sk seed addendum candidates' as check_name, count(*) as n from candidates c
join races r on r.id = c.race_id
where r.slug in ('prince-albert-no-461-councillor-division-4', 'rosthern-no-403-councillor-division-5');
select r.slug as race_slug, c.name, c.slug, c.status from candidates c
join races r on r.id = c.race_id
where r.slug in ('prince-albert-no-461-councillor-division-4', 'rosthern-no-403-councillor-division-5')
order by r.slug, c.slug;
