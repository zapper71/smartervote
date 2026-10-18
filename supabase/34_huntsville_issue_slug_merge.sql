-- =====================================================================
-- Migration 34 — Huntsville issue-slug merge into the shared 18-issue taxonomy
--
-- Andreas's direction, 2026-10-17 late evening: "let's merge the
-- Huntsville issue slugs." PREPARE ONLY — Andreas runs this in the
-- Supabase SQL Editor after reviewing the mapping below. Nothing here
-- runs or publishes by itself.
--
-- CONTEXT — WHAT IS ALREADY DONE (verify, don't assume)
-- Migration 29 (RUN by Andreas 2026-10-17) did all the slug-level work:
--   * 4 renames:  how-council-works      -> government
--                  healthcare-and-hospital -> healthcare
--                  economy-and-downtown    -> economy
--                  parks-and-trails        -> active-transportation
--   * 2 folds:    district-table  -> government
--                  school-services -> student-wellbeing
-- After 29, Huntsville has 13 issue rows and EVERY one of its slugs is
-- already identical to the shared expansion taxonomy (migration 28).
-- There are NO renames and NO folds left to do.
--
-- WHAT REMAINS — WHAT THIS MIGRATION DOES (scoped to Huntsville only)
--  1. ALIGN display names + voter questions + descriptions to the shared
--     taxonomy wording, so the same issue reads the same everywhere.
--     This CHANGES what readers see as section headings on the live
--     Huntsville compares (e.g. "Housing and affordability" becomes
--     "Housing", "Police, fire and emergency services" becomes
--     "Emergency services").
--  2. ALIGN sort_order to the shared taxonomy order, so Huntsville
--     compares show issues in the same order as every other municipality
--     (housing first … bylaw enforcement, then the two trustee issues).
--     This REORDERS the live Huntsville compare columns.
--  3. SEED the 5 taxonomy issues Huntsville lacks, as EMPTY rows:
--     social-and-community-services, arts-and-culture, data-centres,
--     water-and-waste, bylaw-enforcement. They render as blank /
--     research-in-progress cells until positions are published for them —
--     exactly how empty issues already render on expansion compares
--     (e.g. Wilmot ward compares).
--
-- WHAT IT DOES NOT DO
-- No position rows are touched — no renames means no re-pointing, no
-- merges, no status changes. The migration-30 dedupe index
-- (candidate_id, issue_id, source_url, quote, summary) is structurally
-- unaffected; the post-checks verify zero duplicates anyway.
--
-- IDEMPOTENT: the section-1 update matches on existing slugs, the section-2
-- insert upserts on (municipality_id, slug). Re-running is a no-op.
-- Wrapped in begin/commit like migrations 29–33.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- PRE-FLIGHT — read these first. Expectations are in the Result column.
-- ---------------------------------------------------------------------

-- Huntsville's current issues (expect 13: 11 municipal + 2 school_board)
select i.sort_order as "#",
       i.slug,
       i.name,
       i.applies_to
from   issues i
join   municipalities m on m.id = i.municipality_id
where  m.slug = 'huntsville'
order  by i.applies_to, i.sort_order;

-- Positions per Huntsville issue, by status (informational — for the
-- post-check comparison after this migration runs)
select i.slug,
       count(*) filter (where p.status = 'published') as published,
       count(*) filter (where p.status = 'in_review') as in_review,
       count(*) filter (where p.status not in ('published','in_review')) as other
from   issues i
join   municipalities m on m.id = i.municipality_id and m.slug = 'huntsville'
left   join positions p on p.issue_id = i.id
group  by i.slug
order  by i.slug;

-- ---------------------------------------------------------------------
-- GUARD: migration 29 must be fully live. district-table and
-- school-services must already be gone from Huntsville. If either is
-- present, STOP and run migration 29 first — do not run this one.
-- ---------------------------------------------------------------------
do $$
declare n int;
begin
    select count(*) into n
    from issues i
    join municipalities m on m.id = i.municipality_id
    where m.slug = 'huntsville'
      and i.slug in ('district-table', 'school-services');
    if n > 0 then
        raise exception 'migration 34 guard: found % Huntsville issue row(s) with slug district-table or school-services — migration 29 has not fully run. Run 29 first, then re-run 34.', n;
    end if;
end $$;

-- Snapshot of per-issue position counts for the post-check.
create temporary table _h34_before as
select i.slug,
       count(p.id) as positions
from   issues i
join   municipalities m on m.id = i.municipality_id and m.slug = 'huntsville'
left   join positions p on p.issue_id = i.id
group  by i.slug;

-- ---------------------------------------------------------------------
-- SECTION 1 — align name, voter question, description and sort order to
-- the shared taxonomy for the 13 existing Huntsville issues.
-- Labels below are verbatim from migration 28 (the final taxonomy).
-- ---------------------------------------------------------------------
with m as (select id from municipalities where slug = 'huntsville')
update issues i
set name           = v.name,
    voter_question = v.voter_question,
    description    = v.description,
    sort_order     = v.sort_order
from (values

('housing',
 'Housing',
 'Will I be able to afford to live here?',
 'Rents, home prices and new supply -- plus homelessness and encampments, and short-term rentals. Absorbs the old homelessness-and-encampments issue: shelter capacity, outreach, enforcement, and what the municipality controls versus the province.',
 1),

('taxes-and-spending',
 'Taxes & spending',
 'What happens to my tax bill, and where does the money go?',
 'The municipal levy, what drives it up, and what the candidate would cut, protect or spend more on. The most universal issue in any local election.',
 2),

('emergency-services',
 'Emergency services',
 'When I call for help, will it come fast enough?',
 'Police, fire and paramedics together: response times, station and detachment coverage, budgets and priorities, and how the candidate balances enforcement with prevention. Absorbs the old policing issue.',
 3),

('transit',
 'Transit',
 'Can I get where I need to go without driving?',
 'Bus routes and frequency, fares, paratransit, and whether transit reaches the places people actually go -- jobs, schools, medical appointments.',
 4),

('government',
 'Government',
 'Will decisions be made in the open, and will anyone answer for them?',
 'Transparency, public consultation, conflicts of interest, and how the candidate would run meetings and make decisions once elected. Renamed from how-council-works.',
 5),

('roads-and-infrastructure',
 'Roads & infrastructure',
 'Will the things I use every day actually get fixed?',
 'Roads, sidewalks, bridges, snow clearing, water and wastewater. The unglamorous work a municipality is mostly judged on.',
 6),

('economy',
 'Economy',
 'Will our main streets and local jobs thrive?',
 'Downtown vitality, small business support, attracting employers, and what the town offers beyond bedroom-community status. Renamed from economy-and-downtown.',
 7),

('environment',
 'Environment',
 'Is the candidate protecting the nature we live in?',
 'Tree canopy, shoreline and greenspace protection, climate adaptation, and balancing growth with the natural assets that define the area.',
 8),

('healthcare',
 'Healthcare',
 'Will there be a doctor and a hospital when we need one?',
 'Physician recruitment, hospital funding advocacy, long-term care. Mostly provincial files where the municipality lobbies, partners and plans. Renamed from healthcare-and-hospital.',
 9),

('growth-and-development',
 'Growth & development',
 'How fast should we grow, and who decides what gets built where?',
 'Official plans, intensification versus sprawl, development charges, and whether growth pays for itself.',
 10),

('active-transportation',
 'Active transportation',
 'Can I walk and bike safely around town?',
 'Sidewalks, bike lanes, trails as transportation, safe routes to school and to transit. Renamed from parks-and-trails -- note the narrower focus: getting around under your own power, not arenas and pools.',
 12),

('trustee-role',
 'What a trustee actually does',
 'Does the candidate understand the trustee job?',
 'Trustees govern a school board, not a school: budgets, policy, and hiring the director. For school board races only.',
 17),

('student-wellbeing',
 'Student wellbeing and learning',
 'Will kids be safe, supported and learning well?',
 'Mental health supports, special education, bullying, and achievement gaps. For school board races only.',
 18)

) as v(slug, name, voter_question, description, sort_order), m
where i.municipality_id = m.id
  and i.slug = v.slug;

-- ---------------------------------------------------------------------
-- SECTION 2 — seed the 5 taxonomy issues Huntsville lacks, as EMPTY
-- municipal issues. No positions reference them; they render blank until
-- positions are researched and published, like empty issues elsewhere.
-- ---------------------------------------------------------------------
with m as (select id from municipalities where slug = 'huntsville')
insert into issues (municipality_id, name, slug, voter_question, description, sort_order, applies_to)
select m.id, v.name, v.slug, v.voter_question, v.description, v.sort_order, 'municipal'
from m, (values

('Social & community services',
 'social-and-community-services',
 'Who looks after the most vulnerable residents?',
 'Food banks, shelters, seniors and youth programs -- often delivered with the upper tier or non-profits, steered by council funding choices.',
 11),

('Arts & culture',
 'arts-and-culture',
 'Does the candidate value what makes this place feel alive?',
 'Festivals, public art, heritage, and grants for the groups that give a town its identity.',
 13),

('Data centres',
 'data-centres',
 'Should energy-hungry data centres be welcomed here?',
 'Tax revenue and jobs versus electricity demand, water use and noise. A live file in several municipalities this cycle.',
 14),

('Water & waste',
 'water-and-waste',
 'Is our drinking water safe and our waste handled?',
 'Treatment plants, wells, garbage and recycling. Invisible until they fail -- and then the only thing that matters.',
 15),

('Bylaw enforcement',
 'bylaw-enforcement',
 'Are the rules fair, and are they actually enforced?',
 'Noise, property standards, short-term rentals, parking. Where municipal rules meet daily life.',
 16)

) as v(name, slug, voter_question, description, sort_order)
on conflict (municipality_id, slug) do update set
    name           = excluded.name,
    voter_question = excluded.voter_question,
    description    = excluded.description,
    sort_order     = excluded.sort_order,
    applies_to     = excluded.applies_to;

commit;

-- ---------------------------------------------------------------------
-- POST-CHECKS — run after commit. All should read PASS / 0.
-- ---------------------------------------------------------------------

-- 18 Huntsville issues: 16 municipal + 2 school_board
select 'issue count' as "Check",
       case when count(*) = 18 then 'PASS — 18 issues'
            else 'FAIL — expected 18, found ' || count(*) end as "Result"
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug = 'huntsville'
union all
select 'applies_to split',
       case when count(*) filter (where i.applies_to = 'municipal') = 16
                 and count(*) filter (where i.applies_to = 'school_board') = 2
            then 'PASS — 16 municipal, 2 school_board'
            else 'FAIL — unexpected applies_to split' end
from issues i
join municipalities m on m.id = i.municipality_id
where m.slug = 'huntsville'
union all
select 'names match taxonomy',
       case when count(*) = 0 then 'PASS — all 18 names match'
            else 'FAIL — ' || count(*) || ' name(s) differ from taxonomy' end
from issues i
join municipalities m on m.id = i.municipality_id and m.slug = 'huntsville'
join (values
  ('housing','Housing'),('taxes-and-spending','Taxes & spending'),
  ('emergency-services','Emergency services'),('transit','Transit'),
  ('government','Government'),('roads-and-infrastructure','Roads & infrastructure'),
  ('economy','Economy'),('environment','Environment'),('healthcare','Healthcare'),
  ('growth-and-development','Growth & development'),
  ('social-and-community-services','Social & community services'),
  ('active-transportation','Active transportation'),('arts-and-culture','Arts & culture'),
  ('data-centres','Data centres'),('water-and-waste','Water & waste'),
  ('bylaw-enforcement','Bylaw enforcement'),
  ('trustee-role','What a trustee actually does'),
  ('student-wellbeing','Student wellbeing and learning')
) as t(slug, name) on t.slug = i.slug and t.name <> i.name
union all
select 'sort orders match taxonomy',
       case when count(*) = 0 then 'PASS — all 18 orders match'
            else 'FAIL — ' || count(*) || ' order(s) differ' end
from issues i
join municipalities m on m.id = i.municipality_id and m.slug = 'huntsville'
join (values
  ('housing',1),('taxes-and-spending',2),('emergency-services',3),('transit',4),
  ('government',5),('roads-and-infrastructure',6),('economy',7),('environment',8),
  ('healthcare',9),('growth-and-development',10),
  ('social-and-community-services',11),('active-transportation',12),
  ('arts-and-culture',13),('data-centres',14),('water-and-waste',15),
  ('bylaw-enforcement',16),('trustee-role',17),('student-wellbeing',18)
) as t(slug, ord) on t.slug = i.slug and t.ord <> i.sort_order;

-- Positions untouched: every Huntsville issue has the same position
-- count as before the migration, and nothing is orphaned.
select 'positions per issue unchanged' as "Check",
       case when count(*) = 0 then 'PASS — no issue gained or lost positions'
            else 'FAIL — ' || count(*) || ' issue(s) changed position count' end
         as "Result"
from _h34_before b
join issues i on i.slug = b.slug
join municipalities m on m.id = i.municipality_id and m.slug = 'huntsville'
left join lateral (
    select count(*) as c from positions p where p.issue_id = i.id
) after on true
where b.positions <> after.c;

-- expect 0 rows: every position still points at an existing issue
select count(*) as orphaned_positions
from positions p
left join issues i on i.id = p.issue_id
where i.id is null;

-- expect 0 rows: no duplicate under the migration-30 dedupe index
select count(*) as dedupe_index_collisions
from (
    select candidate_id, issue_id,
           coalesce(source_url,''),
           md5(coalesce(verbatim_quote,'')),
           md5(coalesce(summary_short,''))
    from positions
    group by 1,2,3,4,5
    having count(*) > 1
) d;

-- ---------------------------------------------------------------------
-- ROLLBACK — run ONLY if the post-checks fail. Copy/paste the whole
-- block below into the SQL Editor and run it as one transaction.
-- Restores Huntsville's original names, questions, descriptions and
-- order, and removes the 5 seeded empty issues. Positions are untouched
-- by migration 34, so they need no rollback.
-- ---------------------------------------------------------------------
-- begin;
-- with m as (select id from municipalities where slug = 'huntsville')
-- update issues i
-- set name           = v.name,
--     voter_question = v.voter_question,
--     description    = v.description,
--     sort_order     = v.sort_order
-- from (values
-- ('taxes-and-spending','Taxes, spending and value for money','What happens to my tax bill, and where does the money go?','The municipal levy and the District portion, efficiencies and waste, and what a candidate would cut or fund. Raised by all six candidates whose platforms we read — the most universal issue in this election.',1),
-- ('roads-and-infrastructure','Roads, infrastructure and the basics','Will the things I use every day actually get fixed?','Roads, sidewalks, bridges, snow removal, water and wastewater, safe intersections. Named specifics include Chaffey Township Road, winter sidewalk clearing, safe routes to school, the aging Operations Centre, and rural cell service.',2),
-- ('government','Government','How would this person actually govern?','Transparency, public consultation, communication and accountability. In a non-partisan municipal race voters are choosing judgment and temperament, not a party platform — which makes this one of the most useful sections on the page.',3),
-- ('growth-and-development','Growth, development and community character','How much should Huntsville grow, and where?','The Official Plan, the height and density plan, intensification versus rural character, and whether infrastructure keeps pace with approved development. Almost every candidate frames this as a balance rather than a yes or no.',4),
-- ('housing','Housing and affordability','Can people who work here afford to live here?','Purpose-built rental, attainable housing, secondary dwelling units, seniors on fixed incomes, and young people priced out of the town they grew up in. Specific levers named include reducing or eliminating development charges on qualifying rental projects.',5),
-- ('healthcare','Healthcare','Can I see a doctor, and how will we pay for the new hospital?','The local share of the new hospital — one candidate puts it at $10 million — plus doctor and nurse-practitioner recruitment. Note that most of healthcare is provincial: council controls the local share, recruitment incentives and advocacy, and the page should be clear about that line.',6),
-- ('environment','Environment, lakes and dark skies','Who is protecting the lakes and the night sky?','Shoreline development and water quality, forests and natural heritage, the weight given to environmental studies in planning decisions, and the Dark Sky outdoor lighting bylaw — a distinctly Muskoka issue with a real enforcement record.',7),
-- ('economy','Economy','Will there be decent work here, and a downtown worth walking to?','Business attraction and retention, downtown vitality, Brendale Square, and tourism. The underlying problem named by candidates: seasonal, part-time and low-paying work alongside an influx of outside wealth pushing up local costs.',8),
-- ('active-transportation','Active transportation','Can you get around safely without a car, and are the parks and trails looked after?','The Parks and Trails Master Plan, trail connections between neighbourhoods, cycling and pedestrian safety, and year-round accessibility of parks and public spaces.',9),
-- ('emergency-services','Police, fire and emergency services','Who shows up when you call 911, and do they have what they need?','Policing priorities and visible presence, the Huntsville Fire Department now that the shared agreement with Lake of Bays has ended, fire station and equipment decisions, and coordination between police, fire and paramedics. Added after the first ten issues were set, when a candidate platform made it a central pillar that none of the ten could hold.',11),
-- ('transit','Transit and getting around without a car','Can you get where you need to go if you do not drive?','Local bus routes, modified and accessible transit, regional connections including the Northlander and Corridor 11, bus shelters, and transit into rural parts of the municipality. Distinct from roads, which is about the condition of the infrastructure rather than whether a service exists at all.',12),
-- ('trustee-role','What a trustee can actually do','What is this job, and how do I reach the person doing it?','The scope of a trustee''s authority after recent provincial changes limiting it, how accessible and visible they are to families, and whether they bring local concerns to the board table. In a race most voters know least about, this is the most useful section on the page.',2),
-- ('student-wellbeing','Student wellbeing and special education','Are students supported, and are the ones who need more getting it?','Mental health supports, special education resourcing, school safety and climate. NO CANDIDATE HAS SPOKEN TO THIS YET — it is listed because it is a core part of the role, not because someone raised it. Every trustee page will show it as blank until one does.',3)
-- ) as v(slug, name, voter_question, description, sort_order), m
-- where i.municipality_id = m.id
--   and i.slug = v.slug;
-- delete from issues i
-- using municipalities m
-- where i.municipality_id = m.id
--   and m.slug = 'huntsville'
--   and i.slug in ('social-and-community-services','arts-and-culture','data-centres',
--                  'water-and-waste','bylaw-enforcement');
-- commit;
-- -- expect 13 Huntsville issues back:
-- select count(*) as huntsville_issues
-- from issues i join municipalities m on m.id = i.municipality_id
-- where m.slug = 'huntsville';
