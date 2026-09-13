-- =====================================================================
-- SmarterVote.ca — seed data
-- Town of Huntsville, 2026 municipal and school board election
--
-- SOURCE: Town of Huntsville certified candidate list, retrieved 12 Sep 2026
--   https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/certified-candidates/
-- Nominations closed 21 Aug 2026; candidates certified 24 Aug 2026.
-- This list is FINAL — it will not change before voting day.
--
-- Run AFTER 01_schema.sql. Idempotent: re-running updates rather than duplicates.
-- Home addresses from the source list are deliberately omitted.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- MUNICIPALITY
-- ---------------------------------------------------------------------
insert into municipalities
    (name, slug, province, upper_tier, election_date, advance_voting_opens, voting_method, official_url, coverage_status)
values
    ('Town of Huntsville', 'huntsville', 'ON', 'District Municipality of Muskoka',
     '2026-10-26', '2026-10-14', 'Internet and telephone',
     'https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/', 'live')
on conflict (slug) do update set
    election_date        = excluded.election_date,
    advance_voting_opens = excluded.advance_voting_opens,
    voting_method        = excluded.voting_method,
    official_url         = excluded.official_url;

-- ---------------------------------------------------------------------
-- RACES  — 9 council seats + 4 school board seats
-- ---------------------------------------------------------------------
with m as (select id from municipalities where slug = 'huntsville')
insert into races (municipality_id, name, slug, race_type, seats, ward_group_label, description, is_acclaimed, sort_order)
select m.id, v.name, v.slug, v.race_type, v.seats, v.ward_group_label, v.description, v.is_acclaimed, v.sort_order
from m, (values
    ('Mayor', 'mayor', 'mayor', 1, null,
     'Head of council for the Town of Huntsville, and a member of District of Muskoka council.', false, 1),

    ('District and Town Councillor', 'district-and-town-councillor', 'council_at_large', 3, null,
     'Elected by all Huntsville electors. Sits on both Town council and District of Muskoka council.', false, 2),

    ('Councillor — Wards 1 & 2', 'wards-1-2', 'council_ward', 2, 'Wards 1 & 2 (Huntsville & Chaffey)',
     'Six candidates for two seats — the most contested race on the Huntsville ballot.', false, 3),

    ('Councillor — Wards 3, 4 & 5', 'wards-3-4-5', 'council_ward', 2, 'Wards 3, 4 & 5 (Stisted, Stephenson & Port Sydney)',
     'Three candidates for two seats.', false, 4),

    ('Councillor — Ward 6', 'ward-6', 'council_ward', 1, 'Ward 6 (Brunel)',
     'Three candidates for one seat.', false, 5),

    ('School Trustee — Trillium Lakelands DSB', 'trustee-tldsb', 'school_board', 1, null,
     'English public board. One trustee represents the Town of Huntsville and the Township of Lake of Bays.', false, 6),

    ('School Trustee — Simcoe Muskoka Catholic DSB (Area 5)', 'trustee-smcdsb', 'school_board', 1, null,
     'English Catholic board. Decided by acclamation — only one candidate came forward.', true, 7),

    ('Conseiller scolaire — Conseil scolaire public du Nord-Est (Zone A)', 'trustee-cspne', 'school_board', 1, null,
     'Conseil de langue française. Élu par acclamation.', true, 8),

    ('Conseiller scolaire — Conseil scolaire catholique MonAvenir', 'trustee-monavenir', 'school_board', 1, null,
     'Conseil catholique de langue française pour Simcoe Muskoka.', false, 9)
) as v(name, slug, race_type, seats, ward_group_label, description, is_acclaimed, sort_order)
on conflict (municipality_id, slug) do update set
    name = excluded.name, seats = excluded.seats,
    ward_group_label = excluded.ward_group_label,
    description = excluded.description,
    is_acclaimed = excluded.is_acclaimed,
    sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------
-- WARDS — six geographic wards mapped to three ward races
-- ---------------------------------------------------------------------
with m as (select id from municipalities where slug = 'huntsville')
insert into wards (municipality_id, number, name, race_id)
select m.id, v.number, v.name,
       (select r.id from races r where r.municipality_id = m.id and r.slug = v.race_slug)
from m, (values
    (1, 'Huntsville',   'wards-1-2'),
    (2, 'Chaffey',      'wards-1-2'),
    (3, 'Stisted',      'wards-3-4-5'),
    (4, 'Stephenson',   'wards-3-4-5'),
    (5, 'Port Sydney',  'wards-3-4-5'),
    (6, 'Brunel',       'ward-6')
) as v(number, name, race_slug)
on conflict (municipality_id, number) do update set
    name = excluded.name, race_id = excluded.race_id;

-- ---------------------------------------------------------------------
-- CANDIDATES
-- socials stored as jsonb; only what the Town published is recorded.
-- ---------------------------------------------------------------------
with m as (select id from municipalities where slug = 'huntsville')
insert into candidates (race_id, name, slug, status, email, phone, website, socials)
select (select r.id from races r where r.municipality_id = m.id and r.slug = v.race_slug),
       v.name, v.slug, v.status, v.email, v.phone, v.website, v.socials::jsonb
from m, (values

-- ---- Mayor (1 to elect, 4 candidates) ----
('mayor','Dan Armour','dan-armour','certified','darmour@cogeco.ca','705-789-7958',
 'http://danarmour4mayor.ca','{"facebook":"Dan Armour for Mayor"}'),
('mayor','Dan Caswell','dan-caswell','certified','dan@caswellformayor.ca','705-788-5656',
 'https://www.caswellformayor.ca','{"facebook":"Caswell for Mayor","instagram":"Caswell for Mayor"}'),
('mayor','Rebecca Mello','rebecca-mello','certified','rmelloish@gmail.com','705-952-0515',
 null,'{"facebook":"RebeccaMello","instagram":"rebeccactually"}'),
('mayor','Scott Morrison','scott-morrison','certified','scott@scottmorrison.ca','705-783-8199',
 null,'{"facebook":"scott.morrison.14606"}'),

-- ---- District and Town Councillor (3 to elect, 6 running + 1 withdrawn) ----
('district-and-town-councillor','James Bowler','james-bowler','certified','james.p.bowler@live.com','705-783-9483',
 null,'{"facebook":"jamesbowler"}'),
('district-and-town-councillor','Brian Ellas','brian-ellas','certified','brianellas27@gmail.com','705-571-1132',
 null,'{}'),
('district-and-town-councillor','Leland Maw','leland-maw','certified','lelandgmaw@outlook.com','705-349-8081',
 'http://www.lelandmawforcouncil.ca','{}'),
('district-and-town-councillor','Peggy Peterson','peggy-peterson','certified','PeggyPetersonforDistrict2026@proton.me',null,
 null,'{"facebook":"Peggy Peterson for Huntsville and Muskoka District Council"}'),
('district-and-town-councillor','Helena Renwick','helena-renwick','certified','helena.renwick07@gmail.com','705-783-9107',
 null,'{}'),
('district-and-town-councillor','Bob Stone','bob-stone','certified','bobstonexx@gmail.com','705-783-5818',
 'https://votebobstone.ca','{}'),
('district-and-town-councillor','Rod Ward','rod-ward','withdrawn',null,null,
 null,'{}'),

-- ---- Wards 1 & 2, Huntsville & Chaffey (2 to elect, 6 running) ----
('wards-1-2','Louisa Chiaramonte','louisa-chiaramonte','certified','louisa@louisachiaramonte.ca','647-262-2080',
 'https://louisachiaramonte.ca','{"facebook":"Louisa Chiaramonte","x":"lou_chiaramonte","instagram":"louisachiaramonte"}'),
('wards-1-2','Rylind Davis','rylind-davis','certified','rylinddavis4huntsvillechaffey@gmail.com','705-380-2600',
 'https://www.rylinddavis4huntsvillechaffey.ca','{"facebook":"Rylind Davis for Huntsville/Chaffey Ward Councillor","instagram":"RylindDavis4HuntsvilleChaffey"}'),
('wards-1-2','Stephen Hernen','stephen-hernen','certified','hernenbrunel@gmail.com','705-788-4008',
 null,'{}'),
('wards-1-2','Michael Lowe','michael-lowe','certified','michaellowe.huntsvillechaffey@gmail.com','705-787-8489',
 null,'{}'),
('wards-1-2','Geordie Sabbagh','geordie-sabbagh','certified','geordie@yourneighbourgeordie.ca',null,
 'https://yourneighbourgeordie.ca','{"facebook":"geordieyourneighbour","instagram":"geordieyourneighbour"}'),
('wards-1-2','Karin Terziano','karin-terziano','certified','terzianok@gmail.com','705-783-4088',
 null,'{}'),

-- ---- Wards 3, 4 & 5 (2 to elect, 3 running) ----
('wards-3-4-5','Tyler Ellis','tyler-ellis','certified','tylerellisbusiness@gmail.com','705-380-4106',
 'https://tylerwilliamellis.com','{"facebook":"tylerelliscouncilor"}'),
('wards-3-4-5','Jason FitzGerald','jason-fitzgerald','certified','jason.fitz@hotmail.com','705-706-1540',
 null,'{}'),
('wards-3-4-5','Dione Schumacher','dione-schumacher','certified','dionenschumacher@gmail.com','705-646-8260',
 null,'{"instagram":"schumacherdione"}'),

-- ---- Ward 6, Brunel (1 to elect, 3 running) ----
('ward-6','Michael Ankenmann','michael-ankenmann','certified','michael@michaelankenmann.ca','249-700-1742',
 'http://michaelankenmann.ca','{"facebook":"michael.r.ankenmann","instagram":"michaelankenmann"}'),
('ward-6','Monty Clouthier','monty-clouthier','certified','muskokacrane@gmail.com','705-783-5471',
 null,'{"facebook":"MontyClouthier"}'),
('ward-6','Kirsty Koop','kirsty-koop','certified','hello@kirstyforbrunel.ca','705-571-1244',
 'http://kirstyforbrunel.ca','{"facebook":"kirstyforbrunel","instagram":"kirstyforBrunel"}'),

-- ---- School boards ----
('trustee-tldsb','Elizabeth Purcell','elizabeth-purcell','certified','epurcelltrustee@gmail.com',null,
 null,'{"facebook":"Elizabeth Purcell for Huntsville/Lake of Bays TLDSB Trustee"}'),
('trustee-tldsb','Bruce Reain','bruce-reain','certified','breain46@gmail.com','705-788-0102',
 null,'{}'),
('trustee-smcdsb','Joshua Boutotte','joshua-boutotte','acclaimed','jboutotte@gmail.com','705-706-5596',
 null,'{}'),
('trustee-cspne','Bruce Cazabon','bruce-cazabon','acclaimed','b.cazabon@cogeco.net','705-499-0164',
 null,'{}'),
('trustee-monavenir','Donald Blais','donald-blais','certified','donaldjblais@bell.net','416-688-4009',
 null,'{}'),
('trustee-monavenir','Innocent Legrand','innocent-legrand','certified','WNIBL@yahoo.com','416-779-4241',
 null,'{}')

) as v(race_slug, name, slug, status, email, phone, website, socials)
on conflict (race_id, slug) do update set
    name    = excluded.name,
    status  = excluded.status,
    email   = excluded.email,
    phone   = excluded.phone,
    website = excluded.website,
    socials = excluded.socials;

-- Record provenance on every candidate row.
update candidates set source_url =
    'https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/certified-candidates/'
where source_url is null;

commit;

-- ---------------------------------------------------------------------
-- Done. Now run 03_verify.sql to confirm everything landed correctly.
--
-- (The checks live in their own file because the Supabase SQL Editor
-- only displays the result of the LAST statement in a script — so
-- verification queries tacked on here would mostly be invisible.)
-- ---------------------------------------------------------------------
