-- =====================================================================
-- Migration 50 -- Federal byelections, Monday December 7, 2026:
-- 6 ridings, 6 races, 42 candidates -- LISTINGS ONLY
--
-- PREPARE ONLY -- Andreas runs this in the Supabase SQL Editor
-- after reviewing. Nothing here runs or publishes by itself.
-- Run AFTER 49 (which admits race_type 'federal_riding').
--
-- Approved by Andreas Nov 23, 2026: cover ALL SIX ridings,
-- including the three Quebec ridings (overrides the earlier
-- 'Quebec and French OUT' rule for these byelections).
-- LISTINGS ONLY: races + candidates, no deep dives, no position
-- rows, no issues rows. (A federal issue set has not been decided;
-- issues can be added later the way migrations 46/47 attached the
-- SK RM sets, if Andreas decides a federal set.)
--
-- SOURCE OF TRUTH, every name + party: Elections Canada's Voter
-- Information Service "List of candidates" for each riding,
-- "issued on Wednesday, November 18, 2026" (after close of
-- nominations Nov 16). All 42 candidates carry EC status
-- "Confirmed"; none withdrawn, none acclaimed. Names and party
-- labels are EC's verbatim, including EC's own spellings where
-- they differ from news coverage:
--   "Caroline Emond" (no accent), "Dave Carrol" (one r, one l),
--   "Nimâ Machouf" (circumflex), "Ingénieur Hu" (given name as
--   filed), "Travis M. Patron" (middle initial as listed).
-- Party labels are EC's full registered names
-- ("Conservative Party of Canada", "Liberal Party of Canada",
-- "New Democratic Party", "Bloc Québécois", "Green Party of
-- Canada", "People's Party of Canada", "Centrist Party of
-- Canada", "Christian Heritage Party of Canada",
-- "Parti Rhinocéros Party", "Independent", "No Affiliation").
-- Verbatim full names are deliberate: the site's PartyPill maps
-- the short label "Conservative Party" to the BC Conservative
-- logo, so shortening a federal label would show the WRONG
-- party's logo. Full EC labels render as neutral text pills.
-- "No Affiliation" (Philippe Tessier, Rosemont) is preserved as
-- distinct from "Independent" -- EC labels them differently.
--
-- Riding names are EC's own, en dashes included
-- ("Rosemont–La Petite-Patrie", "Brantford–Brant South").
-- Slugs follow the SK convention: riding slug from the riding
-- name (dashes to hyphens, accents stripped); candidate slug =
-- riding slug + "-" + name slug (accents stripped, apostrophes
-- dropped). Race name is the office, "Member of Parliament"
-- (SK/Ontario precedent: race name is the office, e.g.
-- "Councillor, Division 4", "Mayor"). Municipality name is the
-- riding name -- each riding is its own municipality entry, the
-- SK RM shape (NOT the BC shape of one province-level entry
-- holding all districts).
--
-- Candidate websites: EC lists a website for many candidates.
-- Included ONLY where it is the candidate's own campaign site
-- (personal domain or candidate-specific party subdomain).
-- Generic party homepages EC also lists are EXCLUDED:
-- blocquebecois.org (Curzi, Arkin), greenparty.ca (Jewt),
-- centristcanada.ca (Hu). URLs are stored as https:// + the
-- domain exactly as EC shows it.
--
-- Per-riding sources (all Elections Canada, verified live
-- Nov 24, 2026):
--   Rosemont–La Petite-Patrie (QC, ED 24065), 8 candidates:
--     https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=
--   Laurier–Sainte-Marie (QC, ED 24037), 8 candidates:
--     https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=
--   Saint-Hyacinthe–Bagot–Acton (QC, ED 24066), 6 candidates:
--     https://www.elections.ca/scripts/vis/candidates?L=e&ED=24066&EV=66&EV_TYPE=3&PROV=CA&PROVID=99&QID=-1&PAGEID=17
--   Scarborough North (ON, ED 35095), 5 candidates:
--     https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35095&EV=66&EV_TYPE=3&PC=&PROV=QC&PROVID=13&MAPID=&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1
--   Brantford–Brant South (ON, ED 35015), 9 candidates:
--     https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1
--   Yorkton–Melville (SK, ED 47014), 6 candidates:
--     https://www.elections.ca/Scripts/vis/candidates?L=e&ED=47014&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=47014&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1
-- Riding pages (election day Mon Dec 7, 2026; advance polls
-- Nov 27-30): https://www.elections.ca/content.aspx?section=ele&dir=2026/<ED>&document=index&lang=e
--   (ED 24065, 24037, 24066, 35095, 35015, 47014 -- each verified
--   live Nov 24, 2026.)
--
-- No winner flags are set here; results will be recorded by the
-- results runs after Dec 7.
-- Idempotent: ON CONFLICT DO NOTHING, existing rows untouched.
-- Municipality pages ALSO need the static index patch (branch
-- federal-byelections-dec2026-index) -- DB seeding alone does not
-- make the new races appear on municipality pages.
-- Numbering: 49 is the race_type widening; 50 follows 48 (SK
-- seed addendum). 45 is link-click counting; 42/43 are files-only
-- candidate-input migrations; 44 is parked.
-- =====================================================================

begin;

insert into municipalities
    (name, slug, province, election_date, advance_voting_opens, official_url, coverage_status)
values
    ('Rosemont–La Petite-Patrie', 'rosemont-la-petite-patrie', 'QC', '2026-12-07', '2026-11-27', 'https://www.elections.ca/content.aspx?section=ele&dir=2026/24065&document=index&lang=e', 'partial'),
    ('Laurier–Sainte-Marie', 'laurier-sainte-marie', 'QC', '2026-12-07', '2026-11-27', 'https://www.elections.ca/content.aspx?section=ele&dir=2026/24037&document=index&lang=e', 'partial'),
    ('Saint-Hyacinthe–Bagot–Acton', 'saint-hyacinthe-bagot-acton', 'QC', '2026-12-07', '2026-11-27', 'https://www.elections.ca/content.aspx?section=ele&dir=2026/24066&document=index&lang=e', 'partial'),
    ('Scarborough North', 'scarborough-north', 'ON', '2026-12-07', '2026-11-27', 'https://www.elections.ca/content.aspx?section=ele&dir=2026/35095&document=index&lang=e', 'partial'),
    ('Brantford–Brant South', 'brantford-brant-south', 'ON', '2026-12-07', '2026-11-27', 'https://www.elections.ca/content.aspx?section=ele&dir=2026/35015&document=index&lang=e', 'partial'),
    ('Yorkton–Melville', 'yorkton-melville', 'SK', '2026-12-07', '2026-11-27', 'https://www.elections.ca/content.aspx?section=ele&dir=2026/47014&document=index&lang=e', 'partial')
on conflict (slug) do nothing;

insert into races
    (municipality_id, name, slug, race_type, seats, is_acclaimed, sort_order)
select m.id, v.name, v.slug, v.race_type, v.seats, v.is_acclaimed, v.sort_order
from municipalities m
join (values
    ('rosemont-la-petite-patrie', 'Member of Parliament', 'rosemont-la-petite-patrie', 'federal_riding', 1, false, 1),
    ('laurier-sainte-marie', 'Member of Parliament', 'laurier-sainte-marie', 'federal_riding', 1, false, 1),
    ('saint-hyacinthe-bagot-acton', 'Member of Parliament', 'saint-hyacinthe-bagot-acton', 'federal_riding', 1, false, 1),
    ('scarborough-north', 'Member of Parliament', 'scarborough-north', 'federal_riding', 1, false, 1),
    ('brantford-brant-south', 'Member of Parliament', 'brantford-brant-south', 'federal_riding', 1, false, 1),
    ('yorkton-melville', 'Member of Parliament', 'yorkton-melville', 'federal_riding', 1, false, 1)
) as v(municipality_slug, name, slug, race_type, seats, is_acclaimed, sort_order)
  on v.municipality_slug = m.slug
on conflict (municipality_id, slug) do nothing;

insert into candidates
    (race_id, name, slug, status, incumbent, source_url, party, website)
select r.id, v.name, v.slug, v.status, v.incumbent, v.source_url, v.party, v.website
from races r
join (values
    -- Rosemont–La Petite-Patrie (8)
    ('rosemont-la-petite-patrie', 'Pierre Céré', 'rosemont-la-petite-patrie-pierre-cere', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'New Democratic Party', 'https://pierrecere.org'),
    ('rosemont-la-petite-patrie', 'Alexandre Curzi', 'rosemont-la-petite-patrie-alexandre-curzi', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Bloc Québécois', NULL),
    ('rosemont-la-petite-patrie', 'Yahia Ghzala', 'rosemont-la-petite-patrie-yahia-ghzala', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Green Party of Canada', NULL),
    ('rosemont-la-petite-patrie', 'Ingénieur Hu', 'rosemont-la-petite-patrie-ingenieur-hu', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Centrist Party of Canada', NULL),
    ('rosemont-la-petite-patrie', 'Osmar Llanos Martinez', 'rosemont-la-petite-patrie-osmar-llanos-martinez', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Conservative Party of Canada', NULL),
    ('rosemont-la-petite-patrie', 'François Tessier', 'rosemont-la-petite-patrie-francois-tessier', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Parti Rhinocéros Party', NULL),
    ('rosemont-la-petite-patrie', 'Philippe Tessier', 'rosemont-la-petite-patrie-philippe-tessier', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'No Affiliation', NULL),
    ('rosemont-la-petite-patrie', 'Jean-Sébastien Vallée', 'rosemont-la-petite-patrie-jean-sebastien-vallee', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24065&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Liberal Party of Canada', 'https://jeansebastienvallee.liberal.ca'),
    -- Laurier–Sainte-Marie (8)
    ('laurier-sainte-marie', 'Zumretay Arkin', 'laurier-sainte-marie-zumretay-arkin', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Bloc Québécois', NULL),
    ('laurier-sainte-marie', 'Chinook Blais-Leduc', 'laurier-sainte-marie-chinook-blais-leduc', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Parti Rhinocéros Party', NULL),
    ('laurier-sainte-marie', 'Guy Cormier', 'laurier-sainte-marie-guy-cormier', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Liberal Party of Canada', 'https://guycormier.liberal.ca'),
    ('laurier-sainte-marie', 'Jocelyn Simon Daigle', 'laurier-sainte-marie-jocelyn-simon-daigle', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Independent', NULL),
    ('laurier-sainte-marie', 'Eugène Duplessis', 'laurier-sainte-marie-eugene-duplessis', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'People''s Party of Canada', NULL),
    ('laurier-sainte-marie', 'Jean Duval', 'laurier-sainte-marie-jean-duval', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Independent', NULL),
    ('laurier-sainte-marie', 'Mathieu Fournier', 'laurier-sainte-marie-mathieu-fournier', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'Conservative Party of Canada', NULL),
    ('laurier-sainte-marie', 'Nimâ Machouf', 'laurier-sainte-marie-nima-machouf', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=24037&EV=66&EV_TYPE=3&PROV=QC&PROVID=24&QID=-1&PAGEID=17&TPAGEID=', 'New Democratic Party', 'https://nimamachouf.ca'),
    -- Saint-Hyacinthe–Bagot–Acton (6)
    ('saint-hyacinthe-bagot-acton', 'Mathieu Boisvert', 'saint-hyacinthe-bagot-acton-mathieu-boisvert', 'certified', false, 'https://www.elections.ca/scripts/vis/candidates?L=e&ED=24066&EV=66&EV_TYPE=3&PROV=CA&PROVID=99&QID=-1&PAGEID=17', 'New Democratic Party', NULL),
    ('saint-hyacinthe-bagot-acton', 'Luc Brodeur-Jourdain', 'saint-hyacinthe-bagot-acton-luc-brodeur-jourdain', 'certified', false, 'https://www.elections.ca/scripts/vis/candidates?L=e&ED=24066&EV=66&EV_TYPE=3&PROV=CA&PROVID=99&QID=-1&PAGEID=17', 'Conservative Party of Canada', 'https://lucbrodeurjourdain.ca'),
    ('saint-hyacinthe-bagot-acton', 'Caroline Emond', 'saint-hyacinthe-bagot-acton-caroline-emond', 'certified', false, 'https://www.elections.ca/scripts/vis/candidates?L=e&ED=24066&EV=66&EV_TYPE=3&PROV=CA&PROVID=99&QID=-1&PAGEID=17', 'Bloc Québécois', NULL),
    ('saint-hyacinthe-bagot-acton', 'Martin Grenier', 'saint-hyacinthe-bagot-acton-martin-grenier', 'certified', false, 'https://www.elections.ca/scripts/vis/candidates?L=e&ED=24066&EV=66&EV_TYPE=3&PROV=CA&PROVID=99&QID=-1&PAGEID=17', 'Green Party of Canada', NULL),
    ('saint-hyacinthe-bagot-acton', 'Chantal Soucy', 'saint-hyacinthe-bagot-acton-chantal-soucy', 'certified', false, 'https://www.elections.ca/scripts/vis/candidates?L=e&ED=24066&EV=66&EV_TYPE=3&PROV=CA&PROVID=99&QID=-1&PAGEID=17', 'Liberal Party of Canada', NULL),
    ('saint-hyacinthe-bagot-acton', 'Joanne Voyer', 'saint-hyacinthe-bagot-acton-joanne-voyer', 'certified', false, 'https://www.elections.ca/scripts/vis/candidates?L=e&ED=24066&EV=66&EV_TYPE=3&PROV=CA&PROVID=99&QID=-1&PAGEID=17', 'People''s Party of Canada', NULL),
    -- Scarborough North (5)
    ('scarborough-north', 'Dameon Halstead', 'scarborough-north-dameon-halstead', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35095&EV=66&EV_TYPE=3&PC=&PROV=QC&PROVID=13&MAPID=&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Conservative Party of Canada', NULL),
    ('scarborough-north', 'Victoria Drisana Jewt', 'scarborough-north-victoria-drisana-jewt', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35095&EV=66&EV_TYPE=3&PC=&PROV=QC&PROVID=13&MAPID=&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Green Party of Canada', NULL),
    ('scarborough-north', 'Kingsley Kwok', 'scarborough-north-kingsley-kwok', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35095&EV=66&EV_TYPE=3&PC=&PROV=QC&PROVID=13&MAPID=&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'New Democratic Party', 'https://kingsleykwok.ndp.ca'),
    ('scarborough-north', 'James Li', 'scarborough-north-james-li', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35095&EV=66&EV_TYPE=3&PC=&PROV=QC&PROVID=13&MAPID=&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Liberal Party of Canada', 'https://jamesli.liberal.ca'),
    ('scarborough-north', 'Ayub Sipra', 'scarborough-north-ayub-sipra', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35095&EV=66&EV_TYPE=3&PC=&PROV=QC&PROVID=13&MAPID=&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Centrist Party of Canada', NULL),
    -- Brantford–Brant South (9)
    ('brantford-brant-south', 'Leslie Bory', 'brantford-brant-south-leslie-bory', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Independent', 'https://labourfirst.ca'),
    ('brantford-brant-south', 'Dirk Byers', 'brantford-brant-south-dirk-byers', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Christian Heritage Party of Canada', NULL),
    ('brantford-brant-south', 'Dave Carrol', 'brantford-brant-south-dave-carrol', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Independent', 'https://davecarrol.ca'),
    ('brantford-brant-south', 'Mike Clancy', 'brantford-brant-south-mike-clancy', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Independent', 'https://www.maturedemocracy.ca'),
    ('brantford-brant-south', 'Kevin Davis', 'brantford-brant-south-kevin-davis', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Conservative Party of Canada', 'https://fightingforbrantfordbrant.ca'),
    ('brantford-brant-south', 'Kathryn Kissinger', 'brantford-brant-south-kathryn-kissinger', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Green Party of Canada', 'https://votekathrynkissinger.ca'),
    ('brantford-brant-south', 'Joy O''Donnell', 'brantford-brant-south-joy-odonnell', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Liberal Party of Canada', 'https://joyodonnell.liberal.ca'),
    ('brantford-brant-south', 'Anthony Tarrant', 'brantford-brant-south-anthony-tarrant', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'People''s Party of Canada', NULL),
    ('brantford-brant-south', 'Brad Ward', 'brantford-brant-south-brad-ward', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=35015&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=35015&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'New Democratic Party', 'https://bradward.ndp.ca'),
    -- Yorkton–Melville (6)
    ('yorkton-melville', 'Tammy Bobyk-Jacquemart', 'yorkton-melville-tammy-bobyk-jacquemart', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=47014&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=47014&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'New Democratic Party', NULL),
    ('yorkton-melville', 'Valerie Brooks', 'yorkton-melville-valerie-brooks', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=47014&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=47014&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Green Party of Canada', NULL),
    ('yorkton-melville', 'Dionne Fehler', 'yorkton-melville-dionne-fehler', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=47014&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=47014&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'People''s Party of Canada', NULL),
    ('yorkton-melville', 'Aaron Kienle', 'yorkton-melville-aaron-kienle', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=47014&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=47014&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Liberal Party of Canada', 'https://aaronkienle.liberal.ca'),
    ('yorkton-melville', 'Travis M. Patron', 'yorkton-melville-travis-m-patron', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=47014&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=47014&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Independent', 'https://travispatron.ca'),
    ('yorkton-melville', 'Nelson Pohl', 'yorkton-melville-nelson-pohl', 'certified', false, 'https://www.elections.ca/Scripts/vis/candidates?L=e&ED=47014&EV=66&EV_TYPE=3&PC=&PROV=&PROVID=&MAPID=47014&QID=8&PAGEID=17&TPAGEID=&PD=&STAT_CODE_ID=-1', 'Conservative Party of Canada', 'https://www.yorkton-melville.ca')
) as v(race_slug, name, slug, status, incumbent, source_url, party, website)
  on v.race_slug = r.slug
on conflict (race_id, slug) do nothing;

commit;

-- VERIFY
select 'federal byelections municipalities' as check_name, count(*) as n from municipalities
where slug in ('rosemont-la-petite-patrie', 'laurier-sainte-marie', 'saint-hyacinthe-bagot-acton', 'scarborough-north', 'brantford-brant-south', 'yorkton-melville');
select 'federal byelections races' as check_name, count(*) as n from races
where slug in ('rosemont-la-petite-patrie', 'laurier-sainte-marie', 'saint-hyacinthe-bagot-acton', 'scarborough-north', 'brantford-brant-south', 'yorkton-melville');
select 'federal byelections candidates' as check_name, count(*) as n from candidates c
join races r on r.id = c.race_id
where r.slug in ('rosemont-la-petite-patrie', 'laurier-sainte-marie', 'saint-hyacinthe-bagot-acton', 'scarborough-north', 'brantford-brant-south', 'yorkton-melville');
select r.slug as race_slug, c.name, c.slug, c.status, c.party from candidates c
join races r on r.id = c.race_id
where r.slug in ('rosemont-la-petite-patrie', 'laurier-sainte-marie', 'saint-hyacinthe-bagot-acton', 'scarborough-north', 'brantford-brant-south', 'yorkton-melville')
order by r.slug, c.slug;
